"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/* ── The stack's note ─────────────────────────────────────────────────────
   One label that moves between pills, written as a copy of
   ContributionTooltip because it is the same problem and that is the answer
   this site already has for it.

   The table used to hang a Radix tooltip off every pill, which is the right
   model for a control you hover once and the wrong one for a row of sixty
   you sweep across. Radix mounts a content element per trigger, so moving
   from React to Next.js was not one label changing its mind: it was one box
   destroyed at one place and another created at another. That is a cut, and
   a cut every two hundred milliseconds along a row is what reads as
   jarring.

   The first attempt at fixing it animated the box between pills, which was
   the same mistake wearing better clothes. Travel time is time the answer
   is not readable yet, and the reader crossing a row is asking sixty
   questions, not watching one object tour the section. So there is no
   transition on position or size at all: the label is simply where the
   cursor is, and the only thing that animates is the single fade when it
   first arrives.

   The grid's docblock makes the argument in full. The two components should
   stay the same; if one grows a behaviour the other should get it too. */

/* Matches the tooltip primitive's `sideOffset`, so a note sits off its pill
   by the same distance every other floating label on the site does. */
const OFFSET = 8;

/* Keeps the box off the viewport edge on the first and last pill of a row.
   Vertical flipping is not handled: the section sits mid-page and the notes
   are three lines at most. */
const EDGE = 8;

/* The intent delay, and only on the first note. Once a label is on screen
   the reader is already reading notes, so every pill after it is immediate;
   charging 80ms per pill is what made the old version feel sticky. */
const DELAY = 80;

type Anchor = { note: string; x: number; y: number };

/* Read off `data-stack-note` rather than passed down, so the container needs
   one listener instead of sixty and adding a pill to the table is a data
   change. Same contract the grid has with `data-date`. */
function anchorFrom(target: EventTarget | null): Anchor | null {
  if (!(target instanceof Element)) return null;

  const pill = target.closest<HTMLElement>("[data-stack-note]");
  const note = pill?.dataset.stackNote;
  if (!pill || !note) return null;

  const box = pill.getBoundingClientRect();
  return { note, x: box.left + box.width / 2, y: box.top - OFFSET };
}

export function useStackNote() {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* A mirror of "is a label on screen", read inside the pointer handler.
     State would be a render behind: the handler that decides whether to pay
     the delay runs before React has rendered the label it just asked for. */
  const visible = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  const move = useCallback(
    (next: Anchor) => {
      clear();
      /* pointerover fires again for every child of a pill the cursor crosses
         (the mark, then the label), and all of those carry the same answer.
         Comparing before setting means React renders once per pill rather
         than once per element under the cursor. */
      setAnchor((current) =>
        current && current.note === next.note && current.x === next.x ? current : next,
      );
      visible.current = true;
    },
    [clear],
  );

  const hide = useCallback(() => {
    clear();
    setAnchor(null);
    visible.current = false;
  }, [clear]);

  const onPointerOver = useCallback(
    (event: React.PointerEvent) => {
      const next = anchorFrom(event.target);
      if (!next) return;
      if (visible.current) return void move(next);

      clear();
      timer.current = setTimeout(() => move(next), DELAY);
    },
    [clear, move],
  );

  /* Leaving a pill for the gap between two pills is not leaving the table,
     so dismissal is bound to the container rather than to each pill: a sweep
     that passes over 2px of background does not blink the label off and back
     on. */
  const onPointerLeave = useCallback(() => hide(), [hide]);

  /* Keyboard gets the same label, only on `:focus-visible`, so clicking a
     pill (which does nothing else) doesn't pin a note under the cursor. No
     delay: arriving by Tab is already deliberate. */
  const onFocus = useCallback(
    (event: React.FocusEvent) => {
      const pill = (event.target as Element).closest<HTMLElement>("[data-stack-note]");
      if (!pill?.matches(":focus-visible")) return;
      const next = anchorFrom(event.target);
      if (next) move(next);
    },
    [move],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape" && visible.current) hide();
    },
    [hide],
  );

  /* A label positioned in viewport coordinates is wrong the moment the page
     moves under it, and a trackpad can scroll without the cursor leaving the
     pill. Dismissing is the honest response: the alternative is recomputing
     on every scroll frame to keep a label glued to something the reader has
     already decided to scroll past. */
  useEffect(() => {
    if (!anchor) return;
    const dismiss = () => hide();
    window.addEventListener("scroll", dismiss, { passive: true });
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss);
      window.removeEventListener("resize", dismiss);
    };
  }, [anchor, hide]);

  return {
    anchor,
    tableProps: { onPointerOver, onPointerLeave, onFocus, onBlur: onPointerLeave, onKeyDown },
  };
}

export function StackNote({ anchor }: { anchor: Anchor | null }) {
  const ref = useRef<HTMLDivElement>(null);

  /* Position is written straight to the node instead of being rendered.
     Clamping needs the box's width, the width depends on the note, and the
     note is only known once React has committed it, so going back through
     state to place it would mean a second render for every pill crossed. A
     layout effect runs after the commit and before paint, which is exactly
     the gap where the measurement exists and the pixel has not been drawn.

     Both axes go through `transform` so the move is composited, and so the
     mount fade below has opacity to itself. `translateY(-100%)` last, which
     pins the bottom edge 8px above the pill: a one-line note and a
     three-line one both sit against the thing they describe, and the box
     grows upward into the gap above the row. */
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
      /* Not `role="tooltip"`: the notes are exposed to assistive tech through
         `aria-describedby` on each pill, which is a per-pill relationship a
         single roaming element cannot express. This is the visible half. */
      aria-hidden="true"
      className={[
        "pointer-events-none fixed top-0 left-0 z-50 w-max max-w-xs",
        /* The one animation. It plays when the label enters the table, which
           happens once per visit to the section, and never again while the
           reader moves inside it, because the element does not leave. A fade
           on arrival is an introduction; a fade between pills was the same
           object apologising for having new text, and a slide between pills
           was it taking a walk to deliver it. */
        "fade-in-on-mount ease-out-quint opacity-100 transition-opacity duration-150",
        "bg-surface-raised text-tooltip text-foreground rounded-md px-3 py-1.5",
        "border border-black/8 dark:border-white/10",
      ].join(" ")}
    >
      {anchor.note}
    </div>
  );
}
