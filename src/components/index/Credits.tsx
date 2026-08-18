"use client";

import * as React from "react";

/* ── The colophon, set as end credits ─────────────────────────────────────
   Borrowed wholesale from the ending of Linear's mobile launch page: a
   monospace studio card, then role/name rows in two columns with dim
   right-aligned labels against bright left-aligned names, each line fading
   up as it crosses into view so scrolling reads as a roll rather than as a
   table arriving all at once.

   The reason it survives on a page that otherwise refuses decoration is
   that it isn't decoration. It is the attribution this site owed anyway,
   and a credits roll is the one format where a list of names is the point
   instead of an aside. It is also the last thing on the page, so it costs
   nothing to anyone who doesn't scroll that far.

   ── What it credits, and what it deliberately doesn't ─────────────────────
   Only what this site is made of: the typefaces, the framework, the
   primitives, the two components lifted from somebody else's write-up. Not
   the influences. Those are Resources' job three sections up, each with a
   sentence about what it changed, and a second bare list of the same four
   names down here would be the weaker copy of a section that already
   exists.

   Every line is checkable against package.json, components.json, or a
   header comment in the file that uses it. A credits roll that invents a
   department is a joke; one that invents a collaborator is a lie, so the
   only human name here is mine. */

type CreditGroup = { role: string; names: string[] };

const credits: CreditGroup[] = [
  { role: "Design, engineering, writing", names: ["Omar Sadek"] },
  /* The people, not the files. "Inter" is a dependency; "Rasmus Andersson"
     is a credit, and the distinction is the whole reason this section is a
     roll rather than a dependency list. */
  { role: "Typefaces", names: ["Inter, by Rasmus Andersson", "Newsreader, by Production Type"] },
  { role: "Framework", names: ["Next.js", "React"] },
  { role: "Styles", names: ["Tailwind CSS"] },
  { role: "Primitives", names: ["Radix UI", "shadcn/ui", "cmdk", "Embla"] },
  /* Vendored geometry rather than a package: see components/icon/glyphs.ts,
     which records the upstream export name for every path in it. */
  { role: "Icons", names: ["Hugeicons"] },
  /* transitions.dev earns a line here because two components in ui/ carry
     an "Adapted from" header pointing at it, and an adaptation credited in
     a source comment nobody reads is credited nowhere. */
  { role: "Motion", names: ["Motion", "torph", "transitions.dev"] },
  { role: "Written in", names: ["Cairo, Egypt"] },
];

/* Flattened to one row per name at module scope rather than nested at render
   time, because the reveal observes rows: a group holding four names is four
   independent lines that have to fade in one after another as each reaches
   the fold, and a group rendered as a single element would land all four
   together. The label rides on the first row of its group and the rest carry
   an empty cell, which is exactly how a printed credit block sets it. */
const lines = credits.flatMap((group) =>
  group.names.map((name, i) => ({ role: i === 0 ? group.role : null, name })),
);

export function Credits() {
  const rootRef = React.useRef<HTMLElement>(null);
  const [armed, setArmed] = React.useState(false);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* Armed from an effect, so the hidden state only ever exists once the
       observer that clears it exists too. Without JS, or if hydration never
       lands, `armed` stays false and every line renders at full opacity: the
       credits degrade to a plain block rather than to a blank space where a
       block should be.

       No flash to weigh against that, because this is the last thing on the
       longest page here. Nothing in it is on screen at first paint, so
       there is nothing visible to hide when the effect runs. */
    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          /* Unobserved on arrival, so a line that has played never plays
             again on the way back up. Credits roll once. */
          observer.unobserve(entry.target);
        }
      },
      /* A 12% bottom inset, so a line trips its reveal just before it clears
         the fold rather than the instant its first pixel does. At the speed
         a reader scrolls this the difference is the whole effect: fading in
         at the exact edge reads as lines popping in at the bottom of the
         window, and fading in a little inside it reads as the roll arriving
         from underneath. */
      { rootMargin: "0px 0px -12% 0px" },
    );

    for (const line of root.querySelectorAll("[data-credit-line]")) observer.observe(line);
    return () => observer.disconnect();
  }, []);

  return (
    /* Its own block rather than a `Section`: the mono card below is this
       block's heading, and stacking a 13px "Colophon" label on top of it
       would be the same word said twice in two type styles. The real
       heading is here for a screen reader and for the document outline,
       which is the one reader the card can't serve. */
    <section
      ref={rootRef}
      id="colophon"
      data-armed={armed || undefined}
      className="mt-32 mb-4"
      aria-labelledby="colophon-heading"
    >
      <h2 id="colophon-heading" className="sr-only">
        Colophon
      </h2>

      {/* The block is centred on the column while everything above it is
          flush left, and that is the signal that the page has ended. Credits
          are the one thing on a page that is allowed to be centred, because
          centring is what says "this is no longer the document". */}
      {/* One grid for the card and the rows together, so the card sits in the
          name column rather than beside the block. That is where the
          original puts its logotype, and the reason is structural: the axis
          between the two columns is the only vertical line this block has,
          and a heading floating to the left of it would give the block a
          second, softer edge that nothing else lines up to.

          `items-baseline` per row rather than on the grid: the label is 13px
          and the name 15px, so aligning the boxes would leave every label
          riding high against the name it belongs to. */}
      <div className="mx-auto grid w-fit grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-6 gap-y-2">
        {/* The studio card. Monospace, uppercase, 11px: the only place on
            this site any of the three happens outside a code block, and it
            does the job the dithered logotype does in the original, which is
            to mark the change of register before a single credit is read. */}
        <Line className="col-span-2 mb-8 grid grid-cols-subgrid">
          <p className="text-micro text-foreground-faint col-start-2 font-mono tracking-wider uppercase">
            This site
            <br />
            and what it is made of
          </p>
        </Line>

        {lines.map((line) => (
          <Line key={line.name} className="col-span-2 grid grid-cols-subgrid items-baseline">
            <span className="text-meta text-foreground-faint text-right">{line.role}</span>
            <span className="text-body-sm text-foreground">{line.name}</span>
          </Line>
        ))}
      </div>
    </section>
  );
}

/* One line of the roll, and the only thing that knows about the reveal.

   The hidden state is scoped to `[data-armed]` so it can never apply to a
   page whose observer isn't running, and cleared by `[data-shown]`, which
   the observer stamps on arrival. Both are attributes rather than state
   because the observer writes to roughly twenty elements as the reader
   scrolls past them, and routing that through React would re-render the
   whole block twenty times to change one opacity each time.

   The travel is 4px. Any more and the lines slide, which is a different
   effect: the original barely moves, and what sells it is the opacity ramp
   with just enough displacement to give it a direction.

   `motion-reduce` returns the line to visible outright rather than only
   killing the transition. A cut from invisible to visible is not motion, but
   it is still content appearing on scroll, and the point of the setting is
   that the page should already be finished by the time it is read. */
function Line({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-credit-line
      className={`transition-[opacity,translate] duration-500 ease-out [[data-armed]_&]:translate-y-1 [[data-armed]_&]:opacity-0 [[data-armed]_&[data-shown]]:translate-y-0 [[data-armed]_&[data-shown]]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
}
