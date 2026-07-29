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
   40,000+ settles out of 00,000+, 12M+ out of 00M+.

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
   observer, not on a hover or a click. */

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
    <dl ref={rootRef} className="flex flex-wrap gap-x-16 gap-y-8">
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

  React.useEffect(() => {
    if (!revealed) return;

    /* Left to right, a beat apart, so the row resolves as a sequence rather
       than as one block snapping. Short enough that the last value is still
       settling while the reader is on the first. */
    const timer = window.setTimeout(() => setShown(value), index * 90);
    return () => window.clearTimeout(timer);
  }, [revealed, value, index]);

  return (
    <>
      {/* The real figure, always, from a node that never changes. This is
          what a screen reader announces; it would otherwise narrate the
          mask, or re-announce the value mid-morph as the segments swap
          underneath it, and it is what the figure is doing in the shipped
          HTML at all, since the visible node renders masked until the
          observer fires. */}
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        <TextMorph duration={600}>{shown}</TextMorph>
      </span>
    </>
  );
}
