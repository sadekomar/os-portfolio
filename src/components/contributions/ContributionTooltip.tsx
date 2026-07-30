"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { format } from "date-fns";

/* A tooltip for the contribution grid, written by hand rather than reached
   for from `ui/tooltip`.

   Radix models a tooltip as one Root per trigger, and a Root mounts its
   content when it opens and unmounts it when it closes. That is the right
   model for 365 tooltips that are never open at the same time, and the wrong
   model for what this is: one label that answers "which day is this" while
   the reader drags across a year. Crossing a cell boundary there is not two
   events, an ending and a beginning. It is one label changing its mind.
   Radix has to make it two, so the element leaves the document and a new one
   enters, and no amount of turning the animations off closes the frame in
   between. That frame is the flicker.

   Measuring the reference recording settles what the target actually is: at
   60fps, across seventy consecutive frames of fast movement, the label is
   present in every frame. It never fades and never interpolates, it jumps
   straight to the next cell's anchor, and its box changes width as the text
   under it changes. That is not a tooltip being opened three hundred times.
   It is one element being moved.

   So this is one element being moved. There is no portal, no presence, no
   per-cell component, and no state machine: a single pointermove listener on
   the track reads the cell under the cursor off the DOM, and one absolutely
   positioned div follows it. The 365 Radix roots the grid used to mount go
   away as a side effect, which is the usual shape of this kind of fix: the
   performance was never the thing to optimise, it was the symptom of
   describing the interaction wrongly. */

/* Matches `sideOffset` on the shared tooltip, so a label sits off its cell by
   the same distance one sits off any other trigger. */
const OFFSET = 8;

/* Keeps the label off the viewport edge when the cursor is on the first or
   last weeks of the year, which is the one collision case a grid this shape
   can produce. Vertical flipping is not handled because it cannot happen:
   the label is pinned above a graph that sits mid-page. */
const EDGE = 8;

type Anchor = { date: string; count: number; x: number; y: number };

/* The activity is read back off the rendered `rect` rather than passed down,
   because ContributionGraphBlock already writes it there for styling and
   the alternative is threading 365 activities through a pointer handler that
   only ever needs one of them. `data-count` and `data-date` are the block's
   own contract; this reads it, it does not add to it. */
function anchorFrom(target: EventTarget | null): Anchor | null {
  if (!(target instanceof Element)) return null;

  const cell = target.closest<SVGRectElement>("rect[data-date]");
  if (!cell) return null;

  const date = cell.dataset.date;
  if (!date) return null;

  const box = cell.getBoundingClientRect();

  return {
    date,
    count: Number(cell.dataset.count ?? 0),
    x: box.left + box.width / 2,
    y: box.top - OFFSET,
  };
}

export function useContributionTooltip() {
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  /* pointermove fires many times inside a single ten-pixel cell, and all but
     the first of those carry the same answer. Comparing the date before
     setting state means React renders once per cell crossed rather than once
     per pixel travelled, so the work done while dragging across the year is
     proportional to the thing the reader can actually see change. */
  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const next = anchorFrom(event.target);

    setAnchor((current) => {
      if (!next) return current;
      if (current && current.date === next.date && current.x === next.x) return current;
      return next;
    });
  }, []);

  /* Leaving the track dismisses immediately. There is no grace area to cross
     because there is nothing in the label to reach for, and a tooltip that
     outlives the pointer is the behaviour this component exists to remove. */
  const onPointerLeave = useCallback(() => setAnchor(null), []);

  return { anchor, trackProps: { onPointerMove, onPointerLeave } };
}

export function ContributionTooltip({ anchor }: { anchor: Anchor | null }) {
  const ref = useRef<HTMLDivElement>(null);

  /* Position is written straight to the node instead of being rendered.
     Clamping needs the box's width, the width depends on the text, and the
     text is only known once React has committed it, so going back through
     state to place it would mean a second render for every cell crossed.
     A layout effect runs after the commit and before paint, which is exactly
     the gap where the measurement exists and the pixel has not been drawn.

     Both axes go through `transform` rather than `left`/`top` so the move is
     a composited one, and so the mount fade below has opacity to itself. */
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !anchor) return;

    const half = node.offsetWidth / 2;
    const x = Math.min(Math.max(anchor.x, EDGE + half), window.innerWidth - EDGE - half);

    node.style.transform = `translate3d(${Math.round(x - half)}px, ${Math.round(anchor.y)}px, 0) translateY(-100%)`;
  }, [anchor]);

  if (!anchor) return null;

  return (
    <div
      ref={ref}
      role="tooltip"
      aria-live="polite"
      /* fixed rather than absolute inside the track: the track is a scroll
         container below the column's breakpoint, and an absolute child of it
         would be clipped by the same overflow that lets the year scroll. */
      className={[
        "pointer-events-none fixed top-0 left-0 z-50 w-max",
        /* The one animation left. It plays when the label enters the grid,
           which happens once per visit to the graph, and never again while
           the reader moves inside it, because the element does not leave.
           A fade on arrival is an introduction; a fade between cells was the
           same object apologising for having new text. */
        "fade-in-on-mount ease-out-quint opacity-100 transition-opacity duration-150",
        /* The tooltip rung and the tighter box, matching ui/tooltip. This one
           is drawn by hand rather than through the primitive, so the two have
           to be kept in step deliberately: they are the same object as far as
           a reader is concerned, and a hand-rolled one a size off would read
           as a different kind of label. */
        "bg-surface-raised text-tooltip text-foreground rounded-md px-3 py-1.5",
        "border border-black/8 dark:border-white/10",
      ].join(" ")}
    >
      {anchor.count === 0 ? "No" : anchor.count} contribution
      {anchor.count === 1 ? "" : "s"} on {format(new Date(anchor.date), "d MMM yyyy")}
    </div>
  );
}
