"use client";

import { AnimatePresence, motion } from "motion/react";

/* ── The one breath, on its own ───────────────────────────────────────────
   The knock and the label used to sit inline in TourO, which meant the whole
   of `motion` (~40KB brotli) was in the homepage's first-load graph so that a
   ring could dissolve once, a second and a half after paint, on a visitor's
   very first visit and never again. That is a runtime downloaded on every
   load to be used on almost none of them.

   Split out here it is fetched by the timer that shows it. Both halves live in
   one module so the two `dynamic` calls in TourO resolve to a single chunk and
   a single request. Nothing in here is content: both elements are
   `aria-hidden`, both are absolutely positioned out of flow, and neither
   exists at all on a repeat visit, so arriving late costs no layout shift and
   takes nothing out of the server-rendered heading.

   Both take `inviting` rather than being conditionally rendered by the caller.
   AnimatePresence can only animate an exit it is still mounted to watch, and
   the label's withdrawal is the half of this that a reader is most likely to
   actually be looking at. */

/* One breath. A ring that grows out of the letter and dissolves, exactly once,
   which is a knock rather than a pulse. A repeating animation on a portfolio
   index would be the page tapping the reader on the shoulder until they
   respond. */
export function TourKnock({ inviting }: { inviting: boolean }) {
  return (
    <AnimatePresence>
      {inviting && (
        <motion.span
          aria-hidden
          key="knock"
          className="ring-foreground/35 pointer-events-none absolute -inset-x-1 -inset-y-0.5 rounded-full ring-1"
          initial={{ opacity: 0.55, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </AnimatePresence>
  );
}

export function TourInviteLabel({ inviting }: { inviting: boolean }) {
  return (
    <AnimatePresence>
      {inviting && (
        <motion.span
          aria-hidden
          className="text-meta text-foreground-faint pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Rounded up from the recording's real 37.2s, and up rather than
              to nearest on purpose: see the note on TOUR_END in script.ts. */}
          40s tour
        </motion.span>
      )}
    </AnimatePresence>
  );
}
