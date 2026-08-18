"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* ── On this page ─────────────────────────────────────────────────────────
   The right rail. Same instrument as the left one, reading in the other
   direction: the left rail is where you are in the set, this is where you
   are in the page.

   It marks everything on screen rather than a single winner. A reader
   looking at a viewport that holds the end of one section and the start of
   the next is, honestly, in both, and a rail that insists on one of them has
   to pick by a rule the reader can't see. Picking is also where the naive
   version gets its worst behaviour: scrolling up and down through the same
   boundary flips the mark back and forth on a threshold nobody asked about.
   A range has no boundary to flip on. It grows and shrinks.

   So the answer is geometry, not events. Each section owns the band from its
   own heading down to the next one's, and the marked set is every section
   whose band overlaps the viewport under the sticky header. Long sections
   stay marked while their heading is far above the fold, which an observer
   watching headings alone can't say.

   The mark itself is one line beside the whole run, not a state on each row,
   which is what keeps it smooth: a single element moving and stretching
   reads as one thing tracking the page, where per-row marks lighting up in
   turn read as a stagger, an animation with a rhythm of its own competing
   with the scroll. */

export type TocItem = { id: string; label: string; depth?: 2 | 3 };

/* Under the sticky header: content up there is technically in the viewport
   and is not what anyone is reading. */
const HEADER = 88;

export function TableOfContents({ items }: { items: TocItem[] }) {
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const [active, setActive] = useState<Set<string>>(() => new Set());
  const [bar, setBar] = useState<{ top: number; height: number } | null>(null);

  const setRow = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) rowRefs.current.set(id, node);
    else rowRefs.current.delete(id);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    /* Section bands, in document coordinates. Rebuilt whenever the page can
       have reflowed (resize, fonts, images landing) and never while
       scrolling: scrolling moves the viewport, not the headings. */
    let bands: { id: string; start: number; end: number }[] = [];

    const measure = () => {
      const headings = items
        .map((item) => {
          const el = document.getElementById(item.id);
          return el ? { id: item.id, start: el.getBoundingClientRect().top + window.scrollY } : null;
        })
        .filter((entry): entry is { id: string; start: number } => entry !== null);

      bands = headings.map((heading, index) => ({
        ...heading,
        end: headings[index + 1]?.start ?? document.documentElement.scrollHeight,
      }));
    };

    const update = () => {
      const top = window.scrollY + HEADER;
      const bottom = window.scrollY + window.innerHeight;
      const visible = bands.filter((band) => band.start < bottom && band.end > top);

      setActive((previous) => {
        if (
          previous.size === visible.length &&
          visible.every((band) => previous.has(band.id))
        ) {
          return previous;
        }
        return new Set(visible.map((band) => band.id));
      });

      /* The run is contiguous by construction, so the bar only needs its two
         ends. Nothing visible means the reader is above the first heading;
         the bar keeps its last geometry and fades, so coming back down
         resumes the movement instead of restarting it somewhere else. */
      const first = visible[0] && rowRefs.current.get(visible[0].id);
      const last = visible.at(-1) && rowRefs.current.get(visible.at(-1)!.id);
      if (!first || !last) return;
      setBar({ top: first.offsetTop, height: last.offsetTop + last.offsetHeight - first.offsetTop });
    };

    const remeasure = () => {
      measure();
      update();
    };

    remeasure();

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    /* The article's own height, not the window's: code blocks, images and
       live component stages all settle after first paint, and every one of
       them moves every heading below it. */
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(document.documentElement);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      resizeObserver.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-meta">
      {/* `font-medium`, like every other micro label on the site (the ⌘K hint,
          the palette's group headings, the footer's column titles). 11px at
          400 on a near-white ground is the one place where greyscale AA gives
          up the letterforms, which is why the rung is only ever used at 500. */}
      <p className="text-micro text-foreground-faint mb-3 pl-4 font-medium">On this page</p>
      <ul className="relative space-y-2">
        {/* One line for the whole run. `transform` and `height` are the only
            two things that change, both on the same curve, so a jump of four
            rows and a growth of one read as the same gesture at different
            lengths. `top: 0` with a translate rather than an animated `top`:
            transform is the property that doesn't ask the browser to lay the
            list out again on every frame. */}
        <span
          aria-hidden
          className={cn(
            "bg-foreground absolute top-0 left-0 w-px transition-[transform,height,opacity] duration-300 ease-out motion-reduce:transition-none",
            bar ? "opacity-100" : "opacity-0",
          )}
          style={{ transform: `translateY(${bar?.top ?? 0}px)`, height: bar?.height ?? 0 }}
        />
        {/* The faint full-length rule the bar travels along. It's the one
            place a line is doing container work rather than marking
            something, and it earns it: without it the mark is a floating
            dash with no measure to be a part of. 15% is the same tone the
            left rail's inactive ticks use. */}
        <span aria-hidden className="bg-foreground/15 absolute inset-y-0 left-0 w-px" />
        {items.map((item) => (
          <li
            key={item.id}
            ref={(node) => setRow(item.id, node)}
            className={cn("pl-4", item.depth === 3 && "pl-7")}
          >
            <a
              href={`#${item.id}`}
              aria-current={active.has(item.id) ? "location" : undefined}
              className={cn(
                "block transition-colors duration-300 ease-out",
                active.has(item.id)
                  ? "text-foreground"
                  : "text-foreground-faint hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
