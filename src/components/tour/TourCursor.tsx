"use client";

import { useImperativeHandle, useRef, type RefObject } from "react";

import { animate, motion, useMotionValue, useMotionTemplate } from "motion/react";

/* ── The tour's cursor ────────────────────────────────────────────────────
   A visible pointer, and it is not decoration. Without it the tour is a page
   where rows light up and panels open for no stated reason, which reads as
   the site glitching rather than as someone using it. The cursor is the
   sentence "a hand is doing this".

   It is a soft dot rather than an arrow glyph. An arrow would be a second
   mouse pointer on screen, and every reader with a real cursor visible six
   inches away would spend the tour comparing the two. A dot is legible as a
   focus of attention without claiming to be their mouse.

   Position is on motion values, so a move is one transform write per frame
   and never a React render. The handle is imperative because the script
   drives it from outside the render cycle: `await cursor.moveTo(x, y)` is a
   line in a timeline, not a state change. */

const DIAMETER = 18;

/* Travel time is derived from distance rather than fixed. A fixed duration
   makes a 40px nudge between two adjacent rows feel sluggish and a 900px
   traverse feel teleported, and the whole point of a visible cursor is that
   the reader's eye can follow it. Clamped at both ends: below 180ms the eye
   loses it, above 620ms the tour is waiting on its own cursor. */
function travelMs(distance: number) {
  return Math.min(620, Math.max(180, 180 + distance * 0.42));
}

export type CursorHandle = {
  moveTo: (x: number, y: number) => Promise<void>;
  /* Follow a path rather than travel to a point. `moveTo` is the wrong tool
     for a sweep along a phrase or a loop around a figure: it derives its own
     duration from distance and settles on an ease at both ends, so a path
     expressed as twelve `moveTo`s is twelve separate arrivals and takes about
     three seconds to draw a circle. One keyframe animation is one gesture,
     one duration, and linear throughout, which is what a hand tracing
     something actually looks like. */
  glide: (points: { x: number; y: number }[], durationMs: number) => Promise<void>;
  press: () => Promise<void>;
  show: (x?: number, y?: number) => void;
  hide: () => void;
};

export function TourCursor({
  handleRef,
  reduced,
}: {
  handleRef: RefObject<CursorHandle | null>;
  reduced: boolean;
}) {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(0);
  const at = useRef({ x: -100, y: -100 });

  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`;

  useImperativeHandle(
    handleRef,
    () => ({
      show: (nx, ny) => {
        if (nx != null && ny != null) {
          x.jump(nx - DIAMETER / 2);
          y.jump(ny - DIAMETER / 2);
          at.current = { x: nx, y: ny };
        }
        animate(opacity, 1, { duration: 0.2 });
      },
      hide: () => {
        animate(opacity, 0, { duration: 0.16 });
      },
      moveTo: async (nx, ny) => {
        const dx = nx - at.current.x;
        const dy = ny - at.current.y;
        at.current = { x: nx, y: ny };

        const tx = nx - DIAMETER / 2;
        const ty = ny - DIAMETER / 2;

        if (reduced) {
          x.jump(tx);
          y.jump(ty);
          return;
        }

        /* One ease for both axes rather than a spring. A spring overshoots,
           and an overshooting cursor arrives past the row it is pointing at
           and settles back onto it, which reads as imprecision on the one
           element whose entire job is precision. */
        const duration = travelMs(Math.hypot(dx, dy)) / 1000;
        const ease = [0.32, 0.72, 0, 1] as const;
        await Promise.all([
          animate(x, tx, { duration, ease }).finished,
          animate(y, ty, { duration, ease }).finished,
        ]);
      },
      glide: async (points, durationMs) => {
        if (points.length === 0) return;
        const last = points[points.length - 1];
        at.current = { x: last.x, y: last.y };

        const xs = points.map((point) => point.x - DIAMETER / 2);
        const ys = points.map((point) => point.y - DIAMETER / 2);

        if (reduced) {
          x.jump(xs[xs.length - 1]);
          y.jump(ys[ys.length - 1]);
          return;
        }

        /* Linear, and starting from wherever the cursor already is: the first
           keyframe is prepended by the caller when the path should be entered
           from a distance. An ease here would slow the middle of a trace,
           which is the part the reader is reading. */
        const duration = durationMs / 1000;
        await Promise.all([
          animate(x, xs, { duration, ease: "linear" }).finished,
          animate(y, ys, { duration, ease: "linear" }).finished,
        ]);
      },
      press: async () => {
        if (reduced) return;
        /* Down fast, up slower. The asymmetry is what a press feels like:
           the commit is instant, the release is the hand lifting. */
        await animate(scale, 0.62, { duration: 0.08, ease: "easeOut" }).finished;
        await animate(scale, 1, { duration: 0.22, ease: [0.22, 1, 0.36, 1] }).finished;
      },
    }),
    [opacity, scale, x, y, reduced],
  );

  return (
    <motion.div
      aria-hidden
      style={{ transform, opacity, width: DIAMETER, height: DIAMETER }}
      className="pointer-events-none fixed top-0 left-0 z-[70] will-change-transform"
    >
      {/* Two rings, because one is either too faint to see over a photo or
          too heavy to sit on white. The inner dot carries the position, the
          outer halo carries it across whatever it happens to be over. */}
      <motion.div style={{ scale }} className="h-full w-full">
        <div className="absolute inset-0 rounded-full bg-black/12 blur-[3px] dark:bg-white/18" />
        <div className="ring-foreground/15 absolute inset-[3px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.28)] ring-1 dark:bg-white" />
      </motion.div>
    </motion.div>
  );
}
