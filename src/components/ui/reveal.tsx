"use client";

import * as React from "react";

import { Icon } from "@/components/icon/Icon";

/* ── Reveal ───────────────────────────────────────────────────────────────
   A few rows, then the list feathers out into a "Show more".

   The first version of this was a closed disclosure, and it was the wrong
   shape for the same reason a fold is the wrong shape for a reading list: a
   collapsed section says "there is a section here" and asks you to spend a
   click finding out whether you wanted it. A handful of visible rows say
   what the list is by being it, and the fade says there is more of it. One
   of those is an invitation and the other is a door.

   The mechanism is `t-reveal` in globals.css, which is a mask-based feather
   over a max-height transition on the site's house curve. The notes on why
   it is a mask rather than a gradient overlay, and max-height rather than
   the accordion's grid trick, are there.

   ── Why this is shared ───────────────────────────────────────────────────
   It was Resources' own code until the Stack table wanted the same
   treatment, and the part worth not copying is everything below: a bezier
   solved by hand, a rAF loop, and a clamp guarding a specific scroll-jump
   failure. Two copies of that drift silently (one gets the fix, the other
   keeps the bug) and the drift is invisible because both still look
   roughly right. The two sections' *content* has nothing in common, which
   is why they hand their rows in as `teaser` and `rest` rather than sharing
   a row component; it is only the mechanism that is the same.

   The section this lives in is found with `closest("section")` rather than
   passed in. Every caller already sits inside one, that section already
   carries the `scroll-mt-24` this needs to read, and a ref threaded down
   from the page would be a second way to say the same thing. */

/* Matches the `t-reveal` transition in globals.css. The height is animated
   by CSS and the scroll by JS, and the only thing keeping them in lockstep
   is that both run on this duration and the curve below. Change one, change
   both, or the page and the list start arriving at different times. */
const REVEAL_MS = 250;

/* The house curve, cubic-bezier(0.22, 1, 0.36, 1), evaluated in JS.
   Restated here rather than shared because CSS owns the original and there
   is no way to read a computed cubic-bezier back out as coefficients.

   Solved by bisection rather than Newton-Raphson: this runs a handful of
   times per frame for a quarter of a second, so twenty iterations of a
   dead-simple loop is free, and it cannot diverge the way Newton can near
   a flat tangent, which this curve has at x = 0.22. */
function houseCurve(t: number) {
  const bezier = (a: number, b: number, u: number) => {
    const v = 1 - u;
    return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u;
  };

  let lo = 0;
  let hi = 1;
  let u = t;
  for (let i = 0; i < 20; i++) {
    const x = bezier(0.22, 0.36, u);
    if (x < t) lo = u;
    else hi = u;
    u = (lo + hi) / 2;
  }
  return bezier(1, 1, u);
}

export function Reveal({
  teaser,
  rest,
  /* The whole button label, not a count, because the noun differs: Resources
     hides rows and the Stack hides categories, and "Show 4 more" next to a
     table of pills is a question rather than an answer. The count is the
     argument for pressing it ("Show more" alone asks the reader to guess
     whether more is three or thirty), so callers are expected to put one in,
     but they own the wording. */
  more,
  less = "Show less",
  /* Published as `data-tour` on the button. The guided tour opens a section
     by clicking it for real, so it needs a name that survives the copy on
     the button changing. See components/tour/driver.ts. */
  tourId,
  /* Applied to the reveal's own wrapper, for a caller whose rows need a
     layout of their own inside it. Resources' rows stack on their own;
     the Stack's categories are flex children of a gapped column and have to
     stay one inside the fold. */
  restClassName,
}: {
  teaser: React.ReactNode;
  rest: React.ReactNode;
  more: string;
  less?: string;
  tourId?: string;
  restClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();

  const anchor = React.useRef<HTMLDivElement | null>(null);
  const frame = React.useRef<number | null>(null);

  /* The height of the reveal while it is closed, measured once rather than
     restated as a constant.

     The collapse needs to know how much document is about to disappear, and
     the honest source for that is `max-height` on `.t-reveal` in globals.css,
     which this cannot read back, because during a transition
     `getComputedStyle` returns the interpolated value rather than the target
     one, and after the state flush the transition has already begun.

     So it is measured at mount instead, which is the one moment the element
     is guaranteed to be sitting at exactly that height and not moving. It
     costs one layout read on the first paint and it cannot drift from the
     stylesheet the way a copied `40` would. */
  const collapsedHeight = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (collapsedHeight.current === null && anchor.current) {
      collapsedHeight.current = anchor.current.getBoundingClientRect().height;
    }
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  /* ── Why the scroll is animated by hand ─────────────────────────────────
     `scrollTo({ behavior: "smooth" })` would be one line and the wrong one.
     Its duration is decided by the browser (and by the OS, and by the user's
     scroll settings), so it cannot be made to agree with a 250ms CSS
     transition. The list would finish collapsing while the page was still
     travelling, or the reverse, and the two motions would read as two
     events instead of one.

     Driving it from rAF on the same curve and the same clock makes the
     collapse and the scroll a single gesture: the list shrinks by exactly
     the amount the page rises, at the same rate, so the rows above the fold
     appear to stay still while everything below them closes up.

     ── The clamp ─────────────────────────────────────────────────────────
     The failure this is really guarding against: collapsing removes several
     hundred pixels of document, so `scrollMaxY` drops out from under the
     current position and the browser slams the page to the new bottom. That
     is the jump. Clamping each frame to the max *as it is at that moment*
     turns the slam into part of the same eased motion. The target is always
     reachable by the end: it is the top of a section that exists in the
     collapsed document, so there is always enough page left below it to
     scroll to. */
  const collapseTo = (target: number) => {
    const from = window.scrollY;
    if (Math.abs(from - target) < 2) return;

    /* Only ever upward.

       Collapsing should undo the scrolling the expansion caused, and nothing
       else. Pulling the reader *forward* to a place they had deliberately
       scrolled away from would be inventing a destination rather than
       restoring one. So a reader who opened the list, scrolled back up to
       re-read something above it, and then closed it stays exactly where
       they are: the header is already above them, which is the thing this
       scroll exists to guarantee. */
    if (from <= target) return;

    /* Reduced motion still lands on the header: leaving the reader adrift is
       not an accessibility win. It just does not travel there. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, target);
      return;
    }

    const start = performance.now();

    /* The reader taking over cancels it. An animation that fights a wheel
       gesture is worse than no animation, and by scrolling they have said
       where they want to be. */
    const cancel = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      for (const type of ["wheel", "touchstart", "keydown"] as const) {
        window.removeEventListener(type, cancel);
      }
    };
    for (const type of ["wheel", "touchstart", "keydown"] as const) {
      window.addEventListener(type, cancel, { passive: true, once: true });
    }

    const step = () => {
      const t = Math.min(1, (performance.now() - start) / REVEAL_MS);
      const y = from + (target - from) * houseCurve(t);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(y, Math.max(0, max)));

      if (t < 1) frame.current = requestAnimationFrame(step);
      else cancel();
    };
    frame.current = requestAnimationFrame(step);
  };

  /* Where the page should land when the list closes.

     ── Two answers, because there are two readers ──────────────────────────
     This used to have one: the section's own top, less the clearance an
     in-page link would use. That was right while the only reveal on the site
     was Resources, which is the last section on the index: a reader closing
     it is a reader who was looking at it, and everything below it is the
     footer.

     It stopped being right the moment the Stack table folded too. Stack sits
     mid-page, with three sections and a footer under it, and the single rule
     meant that closing it from the colophon hauled the page up nineteen
     hundred pixels to a heading the reader had left behind several minutes
     ago. Measured, not estimated: y=4288 to y=2321.

     So the destination now depends on whether the section is still on screen:

     Visible, or above the fold but not past it: the reader can see the list
     they are closing, so land on its heading. This is the original promise
     and the original argument for it holds: restoring the scroll position
     captured at expand time is close but not the same thing, because that
     position is not necessarily anywhere the heading is visible from. Open
     the list from a view that had the heading just off the top of the screen
     and it closes onto rows with no label above them.

     Entirely above the viewport: the reader has moved on and is reading
     something else. Every pixel the fold removes is a pixel the whole
     document below it rises by, so the fix is to fall by exactly that much
     and leave what they are actually reading where it is. This is what the
     browser's own scroll anchoring would do if `.t-reveal` had not switched
     it off (it had to: two controllers on one value is a fight, and the note
     in globals.css makes that case).

     Clamped at the heading in the second branch, so a reader sitting just
     below the section lands on it rather than being carried past it upward.

     The clearance is read off the section's own `scroll-margin-top` rather
     than hardcoded. `scroll-mt-24` is already on every section on the index,
     precisely so the 64px sticky header does not cover an anchored heading;
     the value exists to answer this question and was already answered.
     Reading it means this lands in exactly the same place as following an
     in-page link to the section, and if the header's height ever changes
     there is one number to update rather than two. */
  const collapseTarget = () => {
    const el = anchor.current;
    const section = el?.closest("section");
    if (!el || !section) return null;

    const box = section.getBoundingClientRect();
    const clearance = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    const heading = Math.max(0, box.top + window.scrollY - clearance);

    if (box.bottom > 0) return heading;

    const removed = el.getBoundingClientRect().height - (collapsedHeight.current ?? 0);
    return Math.max(heading, window.scrollY - Math.max(0, removed));
  };

  const toggle = () => {
    if (open) {
      /* Measured before the state flush, but it makes no difference which
         side of it you read: everything above this section is untouched by
         the collapse, so its top does not move. */
      const target = collapseTarget();
      setOpen(false);
      /* One frame later, so the CSS transition and the scroll start together
         rather than the scroll starting early against a document that has
         not begun shrinking. */
      if (target !== null) requestAnimationFrame(() => collapseTo(target));
      return;
    }

    /* Expanding does not move the page. The list grows downward into space
       the reader is not looking at, and scrolling to follow it would take
       the decision about what to read away from them. */
    setOpen(true);
  };

  return (
    <>
      {/* The teaser is outside the reveal, so it is never masked and never
          animates. Only the remainder moves, which is also what keeps the
          fade at the boundary rather than over the whole list. */}
      {teaser}

      {/* `inert` while collapsed: the rows underneath the fade are real links
          and buttons in the DOM, and without this Tab walks into all of them
          behind a mask.

          The ref lives here rather than on a wrapper of its own because this
          element is inside the section and is rendered in both states, which
          is all `closest("section")` needs. */}
      <div
        ref={anchor}
        id={listId}
        className={restClassName ? `t-reveal ${restClassName}` : "t-reveal"}
        data-open={open}
        {...{ inert: !open }}
      >
        {rest}
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
        data-tour={tourId}
        /* ── Why this is a full-width row, not a label-sized button ───────
           `flex` alone does not make a <button> fill its parent. Buttons
           size to fit-content whatever their display is, so this was 140px
           of a 664px column: the target ended where the word "more" did,
           and the 500-odd pixels to its right, which look exactly as
           pressable, did nothing. `w-full` is what actually widens it.

           With the width comes the obligation to show it. A target the
           reader cannot see the edges of is only honest if hovering
           reveals them, so this takes the rows' wash rather than the
           text-colour-only hover it had: the lit rectangle *is* the
           statement about how far the hit area reaches. `justify-between`
           makes the same point statically, by putting the chevron on the
           far edge so the control visibly spans the column, and it is the
           layout ui/accordion.tsx already uses for a disclosure head.

           `cursor-pointer` because Tailwind v4's preflight sets buttons to
           `cursor: default`. The rows on either side of this are anchors
           and get the pointer for free, so without it the one control in
           the section is also the only thing here that doesn't answer the
           mouse.

           The press dip drops from 3% to the rows' 1% for the reason
           Row.tsx gives: the same percentage across the full measure reads
           as the page flinching rather than as a control answering. It was
           3% while this was a small button, and the number was right for
           that size, not for this one.

           Only colour, background and scale are named. `transition-all`
           would drag the max-height of the reveal and the chevron's
           rotation onto this element's schedule, and both already have
           their own in globals.css (`t-reveal`, `t-acc-chevron`). */
        className="text-body-sm text-foreground-subtle hover:text-foreground hover:bg-wash focus-visible:ring-ring/20 ease-out-quint mt-1 flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-[color,background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
      >
        {open ? less : more}
        <span className="t-acc-chevron shrink-0" aria-hidden="true">
          <Icon name="disclosure" size="control" />
        </span>
      </button>
    </>
  );
}
