"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { useTour } from "@/components/tour/TourProvider";

/* ── The O ────────────────────────────────────────────────────────────────
   The first letter of "Omar", and the only control on this page that is also
   a piece of the sentence it sits in.

   ── Why the invitation is one breath, once ────────────────────────────────
   Three options were on the table and two of them are wrong for this site.

   A bubble that parks itself on load converts best and is the loudest thing
   that could possibly happen on a page whose argument is that it is quiet: a
   face talking at a reader who has not asked is the pop-up the whole design
   is a rebuttal to.

   A purely silent affordance is the most tasteful and almost nobody finds it.
   A tour nobody takes is worth exactly as much as no tour.

   So: on a first visit only, after a beat and a half, the letter breathes
   once and a small label appears beside it. It never moves again, it never
   returns on a second visit, and it costs a reader who ignores it one glance.
   The delay matters as much as the motion. Firing on load means competing
   with the reader's own first pass down the page; a second and a half in,
   they have read the name and the one-line claim, which is exactly the moment
   "want the tour?" becomes a question rather than an interruption.

   ── The accessibility trade ───────────────────────────────────────────────
   The button's accessible name is the letter, deliberately. Naming it "Play a
   30 second tour" would make the h1 announce as "Hey, I'm Play a 30 second
   tour mar", which trades one reader's affordance for another reader's
   heading. The description carries the meaning instead, and the same tour is
   reachable as a plainly labelled row in the ⌘K palette, which is where a
   keyboard-first reader is going to look for it anyway. */

const SEEN_KEY = "tour:invited";

/* Long enough that the reader has taken in the name and the sentence under
   it, short enough that they are still on the intro rather than into Work. */
const INVITE_DELAY_MS = 1500;

/* The label withdraws on its own. It is an offer, and an offer that stays on
   screen forever stops being an offer and becomes furniture. */
const INVITE_LINGER_MS = 7000;

export function TourO() {
  const { start, status, anchorRef } = useTour();
  const localRef = useRef<HTMLButtonElement>(null);
  const [invited, setInvited] = useState(false);

  /* Two refs on one node: the context ref is what the bubble measures its
     bloom against, and the local one is what this component needs for its own
     geometry. Assigning in an effect rather than with a callback ref because
     the context ref is shared and should be released on unmount, which is the
     case that matters when the tour is started from a case study page. */
  useEffect(() => {
    const node = localRef.current;
    anchorRef.current = node;
    return () => {
      if (anchorRef.current === node) anchorRef.current = null;
    };
  }, [anchorRef]);

  useEffect(() => {
    /* Wrapped because Safari in private browsing throws on localStorage
       rather than returning null, and a thrown storage read should cost the
       reader an invitation they will not see twice, not the page. */
    let seen = true;
    try {
      seen = window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    const show = window.setTimeout(() => {
      setInvited(true);
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {}
    }, INVITE_DELAY_MS);
    const hide = window.setTimeout(() => setInvited(false), INVITE_DELAY_MS + INVITE_LINGER_MS);

    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  /* Derived rather than an effect that clears the flag: the invitation has
     served its purpose the moment the tour is running, and that is a fact
     about the current status, not an event to react to. It also covers the
     entry point this component has no knowledge of, the palette's "Play the
     guided tour" row, which never touches the button. */
  const inviting = invited && status === "idle";

  return (
    <span className="relative inline-block">
      <button
        ref={localRef}
        type="button"
        onClick={() => {
          setInvited(false);
          start();
        }}
        /* `title`, not a visually-hidden span wired up with
           `aria-describedby`. The span was the first attempt and it is wrong
           in a way only a screen reader shows you: a heading's accessible
           name is computed from its own text content, so a hidden sentence
           anywhere inside the h1 becomes part of the heading, and this one
           announced as "Hey, I'm O Plays a 30 second guided tour of this
           site. mar."

           `title` contributes a *description* rather than content: the
           button keeps "O" as its name, the heading keeps its sentence, and
           the explanation is still there for anyone whose reader announces
           descriptions. It also gives sighted mouse users the native
           tooltip, which is the same information by a second route. */
        title="Play a 30 second tour of this site"
        /* `align-baseline` and no padding: this letter has to sit on the
           heading's baseline exactly as the glyph it replaces did, and any
           box model at all would kern the word open. The ring is drawn
           outside the flow for the same reason. */
        className="group focus-visible:ring-ring/25 relative cursor-pointer rounded-full align-baseline focus-visible:ring-2 focus-visible:outline-none"
      >
        O
        {/* The resting affordance: a hairline circle that only appears under
            the pointer. Inset negative so it rings the letter rather than
            crowding it, and `aria-hidden` because it says nothing the button
            does not already say. */}
        <span
          aria-hidden
          className="ring-foreground/20 pointer-events-none absolute -inset-x-1 -inset-y-0.5 rounded-full opacity-0 ring-1 transition-opacity duration-200 group-hover:opacity-100"
        />
        <AnimatePresence>
          {inviting && (
            /* One breath. A ring that grows out of the letter and dissolves,
               exactly once, which is a knock rather than a pulse. A repeating
               animation on a portfolio index would be the page tapping the
               reader on the shoulder until they respond. */
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
      </button>

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
            30s tour
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
