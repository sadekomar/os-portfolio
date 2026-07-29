"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

import { AnimatePresence, motion } from "motion/react";

/* ── The bubble ───────────────────────────────────────────────────────────
   The round video, its progress ring, the line being spoken, and the two
   controls.

   ── Why it blooms out of the O ────────────────────────────────────────────
   Not for the trick. A video that fades in at the corner is a video that
   arrived from nowhere and could be an ad; a video that grows out of the
   letter you just pressed is unmistakably the thing you pressed. The letter
   is round and the video is round, so there is no shape change to explain,
   and the return trip is what tells the reader the tour is over without a
   word being spent on saying so.

   It is one transform, not a width and a height. Animating the box would
   relayout a <video> on every frame; scaling a fixed 128px circle from the
   ratio of the letter's width to it is the same motion on the compositor.
   The seed offset is measured, not guessed, so it works at any type size and
   at any scroll position the heading happens to be at.

   ── Why the ring ──────────────────────────────────────────────────────────
   It is the only honest way to ask for thirty seconds. A video with no
   visible end is an open-ended commitment, and the reader's first question
   is not "what is this" but "how long is this". The ring answers it before
   the first sentence lands and keeps answering it. */

const DOCK_MARGIN = 24;
const DOCK_MARGIN_SM = 16;
const SIZE = 128;
const SIZE_SM = 96;

const RING_STROKE = 2;

type Seed = { x: number; y: number; scale: number };

/* Where the bubble comes from and returns to, in the docked circle's own
   coordinate space. Recomputed on every open and every close rather than
   cached: the heading moves with the scroll, and the tour deliberately ends
   somewhere other than where it started. */
function seedFrom(anchor: HTMLElement | null): Seed {
  const small = window.innerWidth < 640;
  const size = small ? SIZE_SM : SIZE;
  const margin = small ? DOCK_MARGIN_SM : DOCK_MARGIN;

  const dockCx = margin + size / 2;
  const dockCy = window.innerHeight - margin - size / 2;

  const rect = anchor?.getBoundingClientRect();
  /* No heading on this route, or it is scrolled out of sight. Growing out of
     a letter nobody can see is a bubble sliding in from an edge for no
     reason, so it fades in place instead. */
  if (!rect || rect.width === 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
    return { x: 0, y: 12, scale: 0.72 };
  }

  return {
    x: rect.left + rect.width / 2 - dockCx,
    y: rect.top + rect.height / 2 - dockCy,
    scale: Math.max(0.08, rect.width / size),
  };
}

export function TourBubble({
  status,
  caption,
  progress,
  hasVideo,
  videoRef,
  anchorRef,
  reduced,
  src,
  onVideoError,
  onSkip,
  onResume,
}: {
  status: "idle" | "playing" | "yielded";
  caption: string;
  progress: number;
  hasVideo: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
  reduced: boolean;
  src: string;
  onVideoError: () => void;
  onSkip: () => void;
  onResume: () => void;
}) {
  const open = status !== "idle";
  const [seed, setSeed] = useState<Seed>({ x: 0, y: 12, scale: 0.72 });

  /* Layout effect, not an effect: the seed has to be correct in the same
     commit that flips `open`, so it is measured and applied before the
     browser paints and the bloom's first frame is already right.

     This is also why the circle below is not inside an `AnimatePresence`.
     The obvious shape (mount on start, exit on stop) cannot work here: the
     return trip's destination is the heading's position *at the moment the
     tour ends*, which is not where it was when the tour began, and an
     `exit` prop is read off children AnimatePresence has already snapshotted
     and will not re-render. The bubble would fly home to wherever the O was
     forty seconds ago, off the top of the viewport more often than not.
     Keeping it mounted and animating between two targets means the exit
     reads a seed measured one frame before it starts. */
  useLayoutEffect(() => {
    setSeed(seedFrom(anchorRef.current));
  }, [status, anchorRef]);

  const radius = SIZE / 2 - RING_STROKE;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      data-tour-ui
      /* Above the preview panel and the nav, below nothing. `inert` rather
         than unmounted while idle: the circle stays in the tree so the
         return animation has something to run on, and inert is what keeps a
         parked, invisible video out of the tab order and the a11y tree. */
      {...{ inert: !open }}
      className="pointer-events-none fixed bottom-4 left-4 z-[60] flex flex-col items-start gap-3 sm:bottom-6 sm:left-6"
    >
      <motion.div
        className="pointer-events-auto relative size-24 sm:size-32"
        animate={
          open
            ? reduced
              ? { opacity: 1 }
              : { x: 0, y: 0, scale: 1, opacity: 1 }
            : reduced
              ? { opacity: 0 }
              : { ...seed, opacity: 0 }
        }
        initial={false}
        transition={
          reduced
            ? { duration: 0.15 }
            : /* Spring, and a soft one. The bubble has mass: it is being
                 pulled out of a letter, and a tween would have it arrive
                 with the abruptness of a modal. The same spring runs the
                 return so the two trips are recognisably one object. */
              { type: "spring", duration: 0.62, bounce: 0.22 }
        }
        style={{ transformOrigin: "50% 50%" }}
      >
        {/* The ring sits outside the clipped video, in its own layer, so
                the video can be a plain circle with overflow hidden and the
                stroke is never subject to that clip. */}
        <svg
          aria-hidden
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="pointer-events-none absolute -inset-1 size-[calc(100%+0.5rem)] -rotate-90"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            fill="none"
            strokeWidth={RING_STROKE}
            className="stroke-foreground/10"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="stroke-foreground/45 transition-[stroke-dashoffset] duration-100 ease-linear"
          />
        </svg>

        <div className="bg-surface-sunken ring-foreground/8 relative size-full overflow-hidden rounded-full shadow-[0_8px_28px_-12px_rgba(0,0,0,0.45)] ring-1">
          <video
            ref={videoRef}
            src={src}
            /* Nothing is fetched until the reader presses the O. A 30s
                   recording pulled on every page load, for the majority who
                   never take the tour, would be the single heaviest thing on
                   a site whose homepage is a column of text. */
            preload="none"
            playsInline
            onError={onVideoError}
            className="size-full scale-[1.02] object-cover"
          />

          {!hasVideo && (
            /* Rehearsal. Says so, plainly, rather than showing an empty
                   circle that reads as a failed load. Only ever visible in
                   development, because in production the file is there. */
            <div className="text-micro text-foreground-faint absolute inset-0 flex items-center justify-center px-4 text-center">
              rehearsal
            </div>
          )}
        </div>
      </motion.div>

      {/* The line being spoken, rendered whether or not there is a recording.
          It is the transcript, not a rehearsal aid: the tour is a voice, and
          a voice is the one medium that excludes people silently. `aria-live`
          so it is announced as it changes rather than only if focus happens
          to land on it. */}
      <div className="pointer-events-auto max-w-[min(20rem,calc(100vw-3rem))]">
        <AnimatePresence mode="wait">
          {open && caption && (
            <motion.p
              key={caption}
              aria-live="polite"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="text-meta text-foreground bg-surface-raised ring-foreground/8 rounded-xl px-3 py-2 shadow-[0_6px_20px_-14px_rgba(0,0,0,0.5)] ring-1"
            >
              {caption}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {open && (
        <div className="pointer-events-auto flex items-center gap-1">
          {status === "yielded" && (
            <button
              type="button"
              onClick={onResume}
              className="text-meta text-foreground bg-surface-raised ring-foreground/8 hover:bg-wash focus-visible:ring-ring/20 rounded-full px-3 py-1 ring-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
            >
              Resume tour
            </button>
          )}
          {/* "Skip" while it is running, "Dismiss" once the reader has taken
              the page back: the same button, but after a yield the tour is no
              longer playing and offering to skip something that has already
              stopped is the interface describing the wrong state. */}
          <button
            type="button"
            onClick={onSkip}
            className="text-meta text-foreground-subtle hover:text-foreground hover:bg-wash focus-visible:ring-ring/20 rounded-full px-3 py-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
          >
            {status === "yielded" ? "Dismiss" : "Skip"}
          </button>
        </div>
      )}
    </div>
  );
}
