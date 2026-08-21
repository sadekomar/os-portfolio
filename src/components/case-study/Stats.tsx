"use client";

import * as React from "react";
import { TextMorph } from "torph/react";

/* ── The outcome row ──────────────────────────────────────────────────────
   The numbers a case study earns, lifted out of the prose that was burying
   them. Set as a definition list rather than a card grid: these are the same
   kind of thing as the Role/Period/Stack rows below, just louder, so they
   get the same markup and none of the chrome. Nothing is drawn around them:
   the value's weight against the label's 40% is the whole separation, which
   is the argument the rest of the page makes with tone.

   ── The animation ────────────────────────────────────────────────────────
   `TextMorph` animates a segment when its text *changes*, so a figure that
   is fixed for the life of the route has to be given something to change
   from. That something is the same string with every digit set to zero:
   40,000+ settles out of 00,000+, 20M+ out of 00M+.

   Masking rather than counting up is what suits this library. torph splits
   on graphemes and morphs each one in place, so a same-length mask puts
   every digit on its own transition and lands them together, with the
   separators and the + sitting still throughout. It also means the row never
   reflows: the string is the same width before and after, so the columns
   beside it don't shuffle while it plays. A 0 → 40,000+ count-up would do
   the opposite on both counts. torph has no digit spinner, so it would read
   as characters being inserted while the column grew.

   Reduced motion needs no branch here: torph's own `respectReducedMotion`
   defaults on, so those readers get the same swap with the transition off.
   The mask is never a state anyone is stuck in; it resolves on the
   observer, not on a hover or a click.

   ── Why the mask is not in the HTML ──────────────────────────────────────
   The mask is a browser-only state, and it has to be, because the shipped
   HTML is the one artefact here that gets read by things that never run the
   animation: a crawler, a reader with JS off, a page whose hydration threw.
   A `<dd>` holding 00M+ tells all three of them that the product serves no
   traffic. The real figure sitting in a neighbouring `sr-only` span does not
   repair that; it is the wrong number in the visible node.

   So the server emits the figure, plainly, in one node. `useLayoutEffect`
   then arms the animation, which is the same pre-paint guarantee the footer
   clock gets from its em-space placeholder, reached from the other side:
   layout effects run in the hydration commit, before the browser paints, so
   the mask is in the DOM by the first frame and nobody sees the value it
   replaced. `useEffect` would not do: it lands after paint, and the reader
   would watch the real figure appear and then be overwritten by zeros.

   Arming also swaps the markup, not just the string. Before it, the figure
   is one node with no `aria-hidden` and no duplicate; after it, the pair the
   morph needs. Which means the mask never reaches the a11y tree and never
   reaches the HTML, rather than being hidden from one and left in the other.
   The mask string is the initial `shown` state, so torph mounts on it and
   has nothing to animate: the first transition anyone sees is the intended
   one, mask → figure, when the observer fires. */

const maskDigits = (value: string) => value.replace(/\d/g, "0");

export function CaseStudyStats({ stats }: { stats: { value: string; label: string }[] }) {
  const rootRef = React.useRef<HTMLDListElement>(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const root = rootRef.current;
    if (revealed || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      /* Most of the row has to be on screen, not just its first pixel. The
         header sits near the top of the page, so a lower threshold would
         spend the animation before the reader has arrived at it. */
      { threshold: 0.6 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [revealed]);

  if (stats.length === 0) return null;

  return (
    /* `data-tour` so the guided tour can loop the cursor around the figures
       while the voice is saying "what it did". See components/tour/script.ts. */
    <dl ref={rootRef} data-tour="case-stats" className="flex flex-wrap gap-x-16 gap-y-8">
      {stats.map((stat, i) => (
        /* Label first in the DOM because it is the term the value describes;
           `flex-col-reverse` puts the value back on top visually. Reading
           order stays "Users, 40,000+" for a screen reader either way. */
        <div key={stat.label} className="flex flex-col-reverse gap-1">
          <dt className="text-case-caption text-foreground-faint">{stat.label}</dt>
          {/* Tabular figures so a row of values sits on a common grid. The
              one place on this page where digits are the content rather than
              part of a sentence. */}
          <dd className="font-serif text-case-heading italic tabular-nums text-foreground">
            <Stat value={stat.value} revealed={revealed} index={i} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Stat({ value, revealed, index }: { value: string; revealed: boolean; index: number }) {
  const [shown, setShown] = React.useState(() => maskDigits(value));
  /* False through the server render and the hydration render, so the two
     agree and there is no mismatch to suppress. Flipped in the commit that
     hydration ends with, which is still before paint. */
  const [armed, setArmed] = React.useState(false);

  /* `react-hooks/set-state-in-effect` is right about the general case and
     wrong about this one. The rule's objection is the cascading render; that
     render is the entire point here, and there is no other mechanism that
     produces it before paint. `useSyncExternalStore`, which is how
     LastShippedLine reads its clock, checks the client snapshot in a passive
     effect, so the swap would land a frame late and the figure would be seen
     and then overwritten: the flash this whole arrangement removes. One
     extra render per stat, twice per page, on mount. */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useLayoutEffect(() => setArmed(true), []);

  React.useEffect(() => {
    if (!revealed) return;

    /* Left to right, a beat apart, so the row resolves as a sequence rather
       than as one block snapping. Short enough that the last value is still
       settling while the reader is on the first. */
    const timer = window.setTimeout(() => setShown(value), index * 90);
    return () => window.clearTimeout(timer);
  }, [revealed, value, index]);

  /* What the server sends and what a reader without working JS keeps: the
     figure itself, no mask, no aria-hidden, no second copy of it to read. */
  if (!armed) {
    return <span>{value}</span>;
  }

  return (
    <>
      {/* The real figure, always, from a node that never changes. This is
          what a screen reader announces; it would otherwise narrate the
          mask, or re-announce the value mid-morph as the segments swap
          underneath it. `sr-only` is clipped rather than laid out, so
          arming does not change the row's width. */}
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        <TextMorph duration={600}>{shown}</TextMorph>
      </span>
    </>
  );
}
