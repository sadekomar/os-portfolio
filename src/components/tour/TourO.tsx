"use client";

import { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";

import { useTour } from "@/components/tour/TourProvider";

/* The two decorations of the invitation, and the only reason this component
   would otherwise need `motion`. See components/tour/TourInvite.tsx: they are
   aria-hidden, out of flow, shown once ever and 1.5s after paint, so there is
   nothing here that has to be in the HTML or on the critical path. Both point
   at the same module, so this is one chunk and one request. */
const TourKnock = dynamic(() => import("@/components/tour/TourInvite").then((m) => m.TourKnock), {
  ssr: false,
});
const TourInviteLabel = dynamic(
  () => import("@/components/tour/TourInvite").then((m) => m.TourInviteLabel),
  { ssr: false },
);

/* ── The O ────────────────────────────────────────────────────────────────
   The first letter of "Omar", and the only control on this page that is also
   a piece of the sentence it sits in.

   ── Why the invitation is one breath, once ────────────────────────────────
   Three options were on the table.

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

   ── And why the first option is now also taken ────────────────────────────
   The paragraph above stands as the reasoning and no longer describes the
   default. TourProvider now plays the tour unasked on a first visit to the
   index, so the loud option won on the one load where a reader has no idea
   what this site is, and the quiet one still covers every load after it.

   The three things that make that survivable are all in TourProvider, and the
   argument above is the reason each of them is there: the offer is taken back
   the instant the reader touches anything, it happens once per browser and
   never again, and it does not happen at all on a route the reader chose. A
   tour that plays itself, cannot be escaped, and returns tomorrow would be
   the pop-up. One that yields to the first scroll is a greeting.

   What is left of the cost is real and worth naming: the reader who is
   perfectly still for 2.6s and did want to read in peace gets a video anyway,
   once. Skip is the second control in the bubble.

   This component's own job in that arrangement is not to double up on it. It
   reads the provider's key and stays quiet when the auto-start owns the
   visit; see AUTO_KEY below.

   ── The accessibility trade ───────────────────────────────────────────────
   The button's accessible name is the letter, deliberately. Naming it "Play a
   40 second tour" would make the h1 announce as "Hey, I'm Play a 40 second
   tour mar", which trades one reader's affordance for another reader's
   heading. The description carries the meaning instead, and the same tour is
   reachable as a plainly labelled row in the ⌘K palette, which is where a
   keyboard-first reader is going to look for it anyway. */

const SEEN_KEY = "tour:invited";

/* TourProvider's key, read here and never written here. On a first visit to
   the index the provider claims this browser's one unrequested tour, and it
   does that in its own mount effect, which runs after this component's. So it
   is read on the invitation's timer rather than on mount; see the note at the
   read itself, which is a mistake worth not making twice.

   It is asked because otherwise a first-time visitor gets both. The letter
   would breathe at 1.5s, the label would appear beside it, and 1.1s later the
   bubble would bloom out of the same letter and the label would withdraw
   under it, which is the page making an offer and then interrupting itself to
   take it. Whoever is playing the tour on this visit owns the invitation too.

   And it stays owned. A reader who cancelled the auto-start by scrolling
   during those 2.6s does not get the label back on their next visit, which is
   the right way round: they have already been shown the tour once and moved,
   and the second ask is the one that reads as nagging. */
const AUTO_KEY = "tour:autoplayed";

/* Long enough that the reader has taken in the name and the sentence under
   it, short enough that they are still on the intro rather than into Work. */
const INVITE_DELAY_MS = 1500;

/* The label withdraws on its own. It is an offer, and an offer that stays on
   screen forever stops being an offer and becomes furniture. */
const INVITE_LINGER_MS = 7000;

export function TourO() {
  const { start, status, warm, anchorRef } = useTour();
  const localRef = useRef<HTMLButtonElement>(null);
  const [invited, setInvited] = useState(false);
  /* Latches on the first invitation and never lets go. `invited` withdraws
     after the linger, and unmounting the two pieces on that edge would mean
     unmounting the AnimatePresence that owes them an exit: the label would
     vanish rather than fade. Once the chunk is here, keeping two closed
     AnimatePresence wrappers mounted costs nothing. */
  const [armed, setArmed] = useState(false);

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
    const read = (key: string) => {
      try {
        return window.localStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    };

    if (read(SEEN_KEY)) return;

    const show = window.setTimeout(() => {
      /* AUTO_KEY is read here rather than beside SEEN_KEY above, and the
         difference is one React ordering rule. Effects run child-first, so at
         the moment this effect's body runs, TourProvider's effect has not:
         the key is reliably absent even on the visit that is about to be
         claimed, and gating on it up there suppressed nothing at all. By the
         time this timer fires, a tick and a half later, the parent has long
         since written it. */
      if (read(AUTO_KEY)) return;

      setArmed(true);
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
        /* Intent, not commitment. Both fire well before the click that means
           it, and both are idempotent, so the tour's chunk is in the cache by
           the time `start()` needs it and the bubble blooms on the same frame
           as the press rather than a round trip later. `onFocus` is not
           decoration: it is the keyboard reader's equivalent of the hover,
           and without it Enter on this button would be the one path that
           waits. */
        onPointerEnter={warm}
        onFocus={warm}
        onClick={() => {
          setInvited(false);
          start();
        }}
        /* `title`, not a visually-hidden span wired up with
           `aria-describedby`. The span was the first attempt and it is wrong
           in a way only a screen reader shows you: a heading's accessible
           name is computed from its own text content, so a hidden sentence
           anywhere inside the h1 becomes part of the heading, and this one
           announced as "Hey, I'm O Plays a 40 second guided tour of this
           site. mar."

           `title` contributes a *description* rather than content: the
           button keeps "O" as its name, the heading keeps its sentence, and
           the explanation is still there for anyone whose reader announces
           descriptions. It also gives sighted mouse users the native
           tooltip, which is the same information by a second route. */
        title="Play a 40 second tour of this site"
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
        {armed && <TourKnock inviting={inviting} />}
      </button>

      {armed && <TourInviteLabel inviting={inviting} />}
    </span>
  );
}
