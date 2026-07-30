"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SHOWCASE_HEADING, SHOWCASE_ITEMS } from "./showcase-items";

const DWELL_MS = 6000;
/* The site's one curve, --ease-out-quint in globals.css. Resizing is this
   panel's whole job, so it has to be on the same clock as everything else. */
const EASE_SMOOTH_OUT = [0.22, 1, 0.36, 1] as const;
const RESIZE_SECONDS = 0.7;

export type ExpandableFeature = {
  id: string;
  /** Bold lead-in, shown in every state. */
  title: string;
  /** Trails the title, revealed only while the panel is open. */
  description: string;
  /**
   * Anything paintable: an <Image>, a mock UI, a gradient. It fills the panel
   * and is cropped from the centre as the panel collapses; nested <img> gets
   * object-cover for free. Place fixed-size overlays absolutely so they keep
   * their scale through the resize.
   */
  media: ReactNode;
};

type ExpandableFeaturesProps = {
  heading?: ReactNode;
  items?: ExpandableFeature[];
  /** Milliseconds an open panel holds before auto-advancing. */
  dwellMs?: number;
  className?: string;
};

/**
 * Wall-clock progress from 0 to 1 that stops accumulating while `running` is
 * false, so hovering the section freezes the rail where it stands instead of
 * restarting it. Resets whenever `key` changes.
 */
function useDwellProgress(
  key: number,
  running: boolean,
  dwellMs: number,
  onComplete: () => void,
) {
  /* The reading carries the key it was measured under, so a panel change makes
     the old one stale by construction and the rail falls back to zero in the
     same render that switched panels. The original reset this with a setState
     in an effect, which is a whole second render pass whose only job is to undo
     the first, and a frame of the old panel's rail on the new panel. */
  const [tick, setTick] = useState({ key, progress: 0 });
  const elapsedRef = useRef(0);
  const completeRef = useRef(onComplete);

  /* Latest-callback ref, written after paint rather than during render, so the
     render stays pure. The loop only ever reads it from inside a frame, which
     is always after this has run. */
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  /* `key` is the reset signal: a panel change is exactly what should rewind
     elapsed time. Kept separate from the loop below because the loop also
     restarts whenever `running` flips, and a pause must freeze the rail where
     it stands rather than rewind it. */
  useEffect(() => {
    elapsedRef.current = 0;
  }, [key]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      elapsedRef.current += now - last;
      last = now;
      const next = Math.min(1, elapsedRef.current / dwellMs);
      setTick({ key, progress: next });
      if (next >= 1) {
        completeRef.current();
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key, running, dwellMs]);

  return tick.key === key ? tick.progress : 0;
}

/**
 * A row of panels where the open one grows and the rest give up their width.
 * The section advances itself on a dwell timer, holds while the pointer is
 * over it, and can be driven by hover, click, focus or the arrow keys.
 *
 * Props are all optional so it renders standalone; the defaults are the real
 * Wholana product loop panels, frozen in showcase-items.tsx.
 */
export function ExpandableFeatures({
  heading = SHOWCASE_HEADING,
  items = SHOWCASE_ITEMS,
  dwellMs = DWELL_MS,
  className,
}: ExpandableFeaturesProps = {}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const groupId = useId();

  const advance = useCallback(() => {
    setActive((i) => (i + 1) % items.length);
  }, [items.length]);

  const running = inView && !paused && items.length > 1;
  const progress = useDwellProgress(active, running, dwellMs, advance);

  // Hovering anywhere in the section holds the current panel. Bound imperatively
  // so the <section> stays a non-interactive landmark.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const hold = () => setPaused(true);
    const release = () => setPaused(false);
    node.addEventListener("pointerenter", hold);
    node.addEventListener("pointerleave", release);
    return () => {
      node.removeEventListener("pointerenter", hold);
      node.removeEventListener("pointerleave", release);
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!forward && !back) return;
    event.preventDefault();
    setActive((index + (forward ? 1 : -1) + items.length) % items.length);
  };

  return (
    <section ref={sectionRef} className={className}>
      {heading}

      {/* The gap belongs to the heading, not to the row: `heading` is optional,
          and a row that reserves 40px above itself for a heading that was not
          passed opens the section with dead space. */}
      <div
        className={`flex flex-col gap-3 md:flex-row md:items-stretch ${heading ? "mt-10" : ""}`}
      >
        {items.map((item, index) => {
          const isActive = index === active;
          return (
            <motion.div
              key={item.id}
              initial={false}
              animate={{ flexGrow: isActive ? 2 : 1 }}
              transition={{
                duration: reduceMotion ? 0 : RESIZE_SECONDS,
                ease: EASE_SMOOTH_OUT,
              }}
              className="flex min-w-0 basis-0 flex-col"
            >
              <button
                type="button"
                aria-expanded={isActive}
                aria-controls={`${groupId}-${item.id}`}
                onClick={() => setActive(index)}
                onFocus={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className="group relative block h-[240px] w-full cursor-pointer overflow-hidden rounded-xl bg-foreground/5 text-left focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 md:h-[300px] lg:h-[340px]"
              >
                {/* The media fills the panel; a collapsing panel crops it from
                    both edges. Anything absolutely placed inside (a floating
                    card, a callout) holds its size through the resize instead
                    of squashing with the panel. */}
                <div className="absolute inset-0">{item.media}</div>
                <motion.div
                  aria-hidden
                  className="absolute inset-0 bg-background"
                  initial={false}
                  animate={{ opacity: isActive ? 0 : 0.14 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.4,
                    ease: "easeOut",
                  }}
                />
              </button>

              {/* Every panel carries the hairline track so the row reads as one
                  ruled baseline; only the active panel draws a fill on top, and
                  reaching 100% is what hands the section over to the next one. */}
              <div className="mt-[11px] h-px w-full overflow-hidden bg-foreground/10">
                <div
                  className="h-px origin-left bg-foreground/80"
                  style={{
                    transform: `scaleX(${isActive && !reduceMotion ? progress : 0})`,
                    opacity: isActive && !reduceMotion ? 1 : 0,
                  }}
                />
              </div>

              {/* The scale's rungs rather than the landing's raw values, for
                  the same reason the ink below is `foreground-muted`. The
                  original was `text-[13px] leading-[1.5] md:text-sm`, which
                  had three problems: 14px is not a step on this scale, the
                  hand-typed leading was the 13px rung's own 1.5 retyped, and
                  it was not breakpoint-scoped, so above `md` it held 1.5
                  against a size that wanted 1.6. Each rung now carries its
                  own leading and tracking. */}
              <p id={`${groupId}-${item.id}`} className="text-meta md:text-body-sm mt-5">
                {/* `font-medium`. 600 appears nowhere in this site's authored
                    code; the whole thing is 400 and 500. */}
                <span className="text-foreground font-medium">{item.title}</span>
                <AnimatePresence initial={false}>
                  {isActive && (
                    /* `text-foreground-muted`, not the landing's `text-muted`:
                       in this system `muted` names a surface, and the ink
                       ramp is `foreground-*`. */
                    <motion.span
                      className="inline text-foreground-muted"
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{
                        opacity: 0,
                        filter: "blur(4px)",
                        transition: {
                          duration: reduceMotion ? 0 : 0.2,
                          ease: "easeOut",
                          delay: 0,
                        },
                      }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.45,
                        ease: "easeOut",
                        // Starts while the panel is still growing, so the copy
                        // resolves into place rather than popping in after.
                        delay: reduceMotion ? 0 : 0.1,
                      }}
                    >
                      {" "}
                      {item.description}
                    </motion.span>
                  )}
                </AnimatePresence>
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
