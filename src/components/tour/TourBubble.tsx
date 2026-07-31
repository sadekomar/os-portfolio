"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";

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

   ── Where it lands, and why it is not the corner ──────────────────────────
   The bubble used to dock bottom-left, which is where a video parks when the
   page has not decided where it belongs: it is the picture-in-picture corner,
   the cookie banner corner, the chat widget corner. Every one of those is
   something the page is doing *at* the reader, and landing there put the tour
   in that company before it had said a word.

   It docks in the gutter beside the Instatus row instead, which is the row
   the first spoken line is about. The column is 640px on a page that is
   usually much wider, so the space is already there and holds nothing; a
   circle in it reads as a margin note against the row rather than as an
   overlay on the page. It also means the landing is an argument: the bubble
   comes to rest pointing at the thing the voice is about to name, so the
   first sentence is already illustrated when it starts.

   It tracks that row, rather than freezing where the row happened to be when
   the tour began. The tour scrolls, so a position measured once would be
   beside Instatus for three seconds and beside nothing for the remaining
   fifty. Tracked, it stays where it is glued until the row leaves, and then
   clamps to the viewport instead of following it off the bottom, because a
   tour whose speaker has scrolled out of the room is not a tour. The clamp is
   the only reason it is `fixed` at all.

   No tween on that tracking, deliberately, and the same reasoning as the Work
   preview panel: a bubble easing toward a scroll position it is already being
   given twenty times a second is a bubble permanently behind the page. It is
   a transform write in the same frame as the scroll.

   ── The trajectory ───────────────────────────────────────────────────────
   One object, one path, one arrival. All three of those took getting wrong to
   find.

   The gesture is a shared element: the reader pressed a round letter and a
   round video is what they get, so the whole job of the motion is to say
   "this is that, moved". Everything that is not that claim is decoration, and
   this page cannot carry decoration; the argument of the site is that it is
   quiet.

   So the two things that made it feel like a flourish are gone. There is no
   rotation, because a tilt on a portrait answers no question the reader is
   asking. And there is no overshoot, because a circle that passes its resting
   size and comes back has told the reader it is springy, which is a fact
   about a toy.

   What is left is a curve, and it is now an actual curve rather than a side
   effect. The previous version bent the line by giving x and y different
   *durations*, which bends it correctly and lands the object twice: vertical
   travel finished at 250ms, horizontal kept going to 400ms, so the bubble
   arrived, and then drifted. That drift is the thing that reads as not-quite-
   right at full speed and is obvious the moment it is slowed down. Both axes
   now run the same length and differ only in *easing*: both decelerate, the
   vertical harder than the horizontal, so the bubble falls out of the letter
   and swings into the gutter along one path and stops moving on one frame.
   Scale runs that same length too, so nothing is still growing after the
   object is home.

   260ms out, under the 300ms that separates motion a reader watches from
   motion a reader waits through, and 200ms back, because an exit should get
   out of the way faster than an entrance arrived.

   No blur, though a slide of this length usually wants one. It is a video: a
   face behind 2px reads as a frame that has not decoded yet, which is the one
   thing this circle must never look like.

   ── Why the ring ──────────────────────────────────────────────────────────
   It is the only honest way to ask for thirty seconds. A video with no
   visible end is an open-ended commitment, and the reader's first question
   is not "what is this" but "how long is this". The ring answers it before
   the first sentence lands and keeps answering it. */

const SIZE = 128;
const SIZE_SM = 96;

const RING_STROKE = 2;

/* The site's own `--ease-out-quint`, restated rather than read off the custom
   property: these are JS animations, and a `getComputedStyle` per open would
   be a layout read to fetch a constant. Everything that is arriving uses it. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* The horizontal lane: the same shape, decelerating less hard. Both axes
   ease out, and the gap between how sharply they do it is the entire curve.

   The first attempt at bending it this way held x back with an ease-in-out,
   on the theory that the vertical drop covers for the horizontal sitting
   still. Measured, it put 102px of bow on a 335px trip: the bubble dropped and
   then whipped sideways, which is the flourish this pass exists to remove. Two
   ease-outs of different strengths peak under 30px instead, which is a path
   that is visibly curved and not doing anything about it. */
const EASE_SWING = [0.33, 1, 0.68, 1] as const;

/* How long each trip takes, in seconds. Every lane of a trip runs the same
   length, deliberately: the path is bent by the easings above, not by letting
   one axis finish first. Out stays under the 300ms that separates motion a
   reader watches from motion a reader waits through, and back is quicker
   still. */
const FLIGHT = { out: 0.26, back: 0.2 };

/* The gap between the text column and the bubble. Wider than the row's own
   12px bleed so the circle sits in the margin rather than looking like it is
   trying to join the row. */
const DOCK_GAP = 28;

/* Closest the bubble is allowed to sit to a viewport edge. */
const EDGE_MARGIN = 16;

/* Roughly what hangs below the circle: the caption chip and the controls.
   Reserved in the bottom clamp so a bubble tracking a row to the foot of the
   screen does not push its own transcript off it. Approximate on purpose,
   the caption is one to three lines depending on the sentence, and measuring
   it would make the dock depend on which word is being spoken. */
const STACK_BELOW = 112;

/* Where it starts before anything has been measured: the old corner, which is
   the only sane answer on a route with no column to sit beside. */
const FALLBACK_LEFT = 24;

type Dock = { left: number; top: number; gutter: boolean };
type Seed = { x: number; y: number; scale: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/* The resting place, in viewport coordinates, for the top-left of the whole
   stack. `previous` is what a missing anchor falls back to, which is what
   happens the moment the tour crosses into a case study: the index unmounts
   under it and the bubble should stay exactly where it is rather than
   teleporting to a corner because the row it was beside has gone. */
function dockFrom(anchor: HTMLElement | null, previous: Dock): Dock {
  const small = window.innerWidth < 640;
  const size = small ? SIZE_SM : SIZE;
  const bottom = window.innerHeight - EDGE_MARGIN - size - STACK_BELOW;

  const rect = anchor?.getBoundingClientRect();
  if (!rect || rect.width === 0) {
    return { ...previous, top: clamp(previous.top, EDGE_MARGIN, bottom) };
  }

  const left = rect.left - DOCK_GAP - size;
  /* No gutter to sit in: a phone, or a desktop window dragged narrow. The
     corner is the honest answer there, and it is why this returns rather than
     clamping `left` into the column, which would park the video on top of the
     row it is supposed to be beside. Bottom rather than top, because the
     caption hangs below the circle and a corner dock is the one case where
     there is no room to spare on either axis. */
  if (left < EDGE_MARGIN) {
    return { left: small ? EDGE_MARGIN : FALLBACK_LEFT, top: bottom, gutter: false };
  }

  return {
    left,
    top: clamp(rect.top + rect.height / 2 - size / 2, EDGE_MARGIN, bottom),
    gutter: true,
  };
}

/* How much room the caption and the controls have, and which way they grow.

   In the gutter the answer is not "as wide as they like". The circle is the
   width of the caption's *right* edge, not its left: a chip hanging below the
   bubble and running rightward would cross into the column and cover the row
   the sentence is about, which is the one thing the new dock exists to point
   at. So it grows the other way, into the margin it is already sitting in,
   and the margin is what caps it.

   In the corner there is nothing to the left to grow into, so it goes back to
   what it always did: left-aligned, capped at a comfortable reading width. */
function captionWidth(dock: Dock): number {
  const size = window.innerWidth < 640 ? SIZE_SM : SIZE;
  if (dock.gutter) return dock.left + size - EDGE_MARGIN;
  return Math.min(320, window.innerWidth - EDGE_MARGIN * 2 - dock.left);
}

/* Where the bubble comes from and returns to, in the docked circle's own
   coordinate space. Recomputed on every open and every close rather than
   cached: the heading moves with the scroll, and the tour deliberately ends
   somewhere other than where it started. */
function seedFrom(anchor: HTMLElement | null, dock: Dock): Seed {
  const size = window.innerWidth < 640 ? SIZE_SM : SIZE;

  const rect = anchor?.getBoundingClientRect();
  /* No heading on this route, or it is scrolled out of sight. Growing out of
     a letter nobody can see is a bubble sliding in from an edge for no
     reason, so it fades in place instead, and without the spin: a rotation
     with no origin to have come from is decoration. */
  if (!rect || rect.width === 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
    return { x: 0, y: 12, scale: 0.72 };
  }

  return {
    x: rect.left + rect.width / 2 - (dock.left + size / 2),
    y: rect.top + rect.height / 2 - (dock.top + size / 2),
    /* The measured ratio of the letter to the circle, which is off any scale
       of pre-scales and has to be: this is not a surface easing up from 0.97,
       it is one object that is a glyph at one end of the trip and a video at
       the other, and the number is whatever the type size says it is. */
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
  muted,
  onVideoError,
  onUnmute,
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
  /* Playing, but with the voice off, because the browser refused audio on a
     tour nobody pressed. See the retry in TourEngine. */
  muted: boolean;
  onVideoError: () => void;
  onUnmute: () => void;
  onSkip: () => void;
  onResume: () => void;
}) {
  const open = status !== "idle";

  /* Motion values driven imperatively rather than an `animate` prop off a
     piece of seed state, and the difference is the whole first bloom.

     Declaratively, the starting point of the trip out is wherever the closed
     state left the circle parked, so the seed has to have been correct
     *before* the reader pressed anything. On the very first run of a page load
     it never is: this component's layout effect measures the O in the same
     commit it mounts in, and the O registers itself in a passive effect that
     has not run yet, so the parked seed is the no-anchor fallback and the
     first tour anyone ever takes fades in from twelve pixels below the dock
     instead of coming out of the letter. Every run after that looks right,
     which is exactly why it survived: it is invisible to anyone testing it
     twice.

     Set imperatively, the seed is measured and applied in the same frame the
     flight starts, so there is no parked state to be stale. */
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(0);

  const stackRef = useRef<HTMLDivElement>(null);
  /* Infinity rather than a number: the first `dockFrom` clamps it, so a tour
     that somehow opens with no row to sit beside starts at the bottom of the
     screen, which is where this used to live and the only corner a video with
     a caption under it fits in. */
  const dock = useRef<Dock>({ left: FALLBACK_LEFT, top: Number.POSITIVE_INFINITY, gutter: false });

  /* Which way the caption grows is the one thing about the dock that has to be
     in React, because it is a class rather than a number. It changes when the
     window is resized past the width that has a gutter in it, which is orders
     of magnitude rarer than a scroll frame, so it is set only on a change. */
  const [gutter, setGutter] = useState(false);

  /* Everything else is written straight to the node rather than held in state.
     The dock is recomputed on every scroll frame, and a `setState` per frame
     would re-render the video, the ring and the caption to move a box that
     only needs a transform. */
  const place = useCallback(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const next = dockFrom(document.querySelector("[data-tour-dock]"), dock.current);
    dock.current = next;
    stack.style.transform = `translate3d(${next.left}px, ${next.top}px, 0)`;
    stack.style.setProperty("--tour-aside", `${captionWidth(next)}px`);
    setGutter((current) => (current === next.gutter ? current : next.gutter));
  }, []);

  /* Layout effect, not an effect: the seed has to be correct in the same
     commit that flips `open`, so it is measured and applied before the
     browser paints and the flight's first frame is already right. The dock is
     placed first, in the same pass, because the seed is expressed as an
     offset from it: measuring the O against last frame's resting place would
     start the trip from the wrong point by however far the page has scrolled
     since.

     This is also why the circle below is not inside an `AnimatePresence`.
     The obvious shape (mount on start, exit on stop) cannot work here: the
     return trip's destination is the heading's position *at the moment the
     tour ends*, which is not where it was when the tour began, and an
     `exit` prop is read off children AnimatePresence has already snapshotted
     and will not re-render. The bubble would fly home to wherever the O was
     forty seconds ago, off the top of the viewport more often than not. One
     mounted circle, aimed at a target measured one frame before it moves. */
  useLayoutEffect(() => {
    place();
    const seed = seedFrom(anchorRef.current, dock.current);
    const opening = status !== "idle";

    /* Reduced motion gets the arrival and none of the journey. Not a slower
       version of it: the travel is the whole of what this setting is for. */
    if (reduced) {
      if (opening) {
        x.set(0);
        y.set(0);
        scale.set(1);
      }
      const fade = animate(opacity, opening ? 1 : 0, { duration: 0.15 });
      return () => fade.stop();
    }

    /* Snapped, then flown, in one frame. On the way back there is nothing to
       snap: the circle is already at rest in the gutter, which is where the
       return has to start from. */
    if (opening) {
      x.set(seed.x);
      y.set(seed.y);
      scale.set(seed.scale);
      opacity.set(0);
    }

    /* No spring anywhere, and that was the first thing to go. A spring's
       entire expressive range is in how it disagrees with where it is going,
       and every unit of that here was a unit of bounce on a video of a face.

       One duration across the lanes, two easings across the axes. Scale is on
       the same clock as the position for the same reason the axes are on it
       together: a circle that is still growing after it has stopped moving is
       two events, and this is one. */
    const duration = FLIGHT[opening ? "out" : "back"];
    const flight = [
      animate(x, opening ? 0 : seed.x, { duration, ease: EASE_SWING }),
      animate(y, opening ? 0 : seed.y, { duration, ease: EASE_OUT }),
      animate(scale, opening ? 1 : seed.scale, { duration, ease: EASE_OUT }),
      /* The one lane allowed to be shorter than the trip, and only outbound.
         The bubble leaves the letter at the letter's size, which is about
         eighteen pixels of video: unreadable, and the reader spends the first
         frames of the journey watching a smear resolve. Bringing it up in
         under half the trip means what travels is a legible circle almost
         immediately, and the growing is done by the scale where it belongs.

         Coming back it takes the full length on a linear ramp, because the
         return trip is how the reader is told the tour is over. On the shared
         ease-out the fade is spent in the first third of the journey and the
         circle is gone before it reaches the heading, which tells them
         nothing. */
      animate(opacity, opening ? 1 : 0, {
        duration: opening ? 0.12 : duration,
        ease: opening ? EASE_OUT : "linear",
      }),
    ];
    return () => flight.forEach((control) => control.stop());
  }, [status, reduced, anchorRef, place, x, y, scale, opacity]);

  /* Only while it is on screen. Tracking the row costs a rect read per scroll
     frame, and there is no reason to pay it for a parked, invisible circle on
     a page whose reader never asked for the tour. */
  useEffect(() => {
    if (!open) return;

    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        place();
      });
    };

    /* Capture, because the row can be inside a scroller of its own and a
       bubble that only follows the window would stay put while the thing it
       is glued to moves. */
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
    };
  }, [open, place]);

  const radius = SIZE / 2 - RING_STROKE;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      data-tour-ui
      ref={stackRef}
      /* Above the preview panel and the nav, below nothing. `inert` rather
         than unmounted while idle: the circle stays in the tree so the
         return animation has something to run on, and inert is what keeps a
         parked, invisible video out of the tab order and the a11y tree.

         Pinned to the viewport's top-left and moved by transform, with the
         resting place written by `place` above. `top`/`left` would be the
         obvious pair and they are the wrong one here: this box is written on
         every scroll frame, and a transform is the only version of that write
         the compositor can take without laying the caption out again.

         The box is exactly the circle's width, and the caption and controls
         overhang it: that is what lets them be aligned to one edge of the
         bubble and grow away from the column. A shrink-to-fit box would be as
         wide as the caption instead, and the circle would then be pushed
         around by the length of whatever sentence is being spoken. */
      {...{ inert: !open }}
      className={`pointer-events-none fixed top-0 left-0 z-[60] flex w-24 flex-col gap-3 sm:w-32 ${
        gutter ? "items-end" : "items-start"
      }`}
    >
      <motion.div
        className="pointer-events-auto relative size-24 sm:size-32"
        style={{ x, y, scale, opacity, transformOrigin: "50% 50%" }}
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
      <div className="pointer-events-auto w-max max-w-[var(--tour-aside,20rem)]">
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
        <div className="pointer-events-auto flex w-max items-center gap-1">
          {/* First in the row, and styled like Resume rather than like Skip,
              because on an auto-started tour it is the only control the reader
              actually wants: the voice is the tour, and this is the button
              that turns it on. It is absent from a tour started by pressing
              the O, where the sound was never blocked in the first place. */}
          {muted && status === "playing" && (
            <button
              type="button"
              onClick={onUnmute}
              className="text-meta text-foreground bg-surface-raised ring-foreground/8 hover:bg-wash focus-visible:ring-ring/20 rounded-full px-3 py-1 ring-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
            >
              Sound on
            </button>
          )}
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
