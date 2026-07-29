"use client";

import * as React from "react";

import { Icon, iconGap } from "@/components/icon/Icon";
import { resources } from "@/data/resources";

/* ── Resources ────────────────────────────────────────────────────────────
   Four rows, then the list feathers out into a "Show more".

   The first version of this was a closed disclosure, and it was the wrong
   shape for the same reason a fold is the wrong shape for a reading list: a
   collapsed section says "there is a section here" and asks you to spend a
   click finding out whether you wanted it. Four visible rows say what the
   list is by being it, and the fade says there is more of it. One of those
   is an invitation and the other is a door.

   ── Why four ─────────────────────────────────────────────────────────────
   Enough to establish the kind of thing on the list rather than the fact
   that a list exists. The first four are the most formative ones (see the
   ordering note in data/resources.ts), so the teaser is also the strongest
   part of it, which is the only honest way to truncate: show the top, not
   the first four alphabetically.

   The mechanism is `t-reveal` in globals.css, which is a mask-based feather
   over a max-height transition on the site's house curve. The notes on why
   it is a mask rather than a gradient overlay, and max-height rather than
   the accordion's grid trick, are there. */

/* How many stay visible when collapsed. Named because it appears twice: the
   slice below and the count on the button have to agree, and two literals
   that must match are one edit away from disagreeing. */
const TEASER = 4;

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

export function Resources() {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();

  const section = React.useRef<HTMLElement | null>(null);
  const frame = React.useRef<number | null>(null);

  React.useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
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
     The failure this is really guarding against: collapsing removes ~900px
     of document, so `scrollMaxY` drops out from under the current position
     and the browser slams the page to the new bottom. That is the jump.
     Clamping each frame to the max *as it is at that moment* turns the slam
     into part of the same eased motion. The target is always reachable by
     the end: it is the top of a section that exists in the collapsed
     document, so there is always enough page left below it to scroll to. */
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

  /* Where the page should land when the list closes: the section's own top,
     less the clearance an in-page link would use.

     This used to be the scroll position captured at expand time, which was
     close but not the same thing. Restoring that puts the page back where it
     was, and where it was is not necessarily anywhere you can see the
     heading: open the list from a view that had "Resources" just off the top
     of the screen and it closes onto rows with no label above them. Closing
     onto the heading is the stronger promise, and it needs no remembered
     state to keep, which also disposes of the objection that the remembered
     value goes stale.

     The clearance is read off the element's own `scroll-margin-top` rather
     than hardcoded. `scroll-mt-24` is already on this section, and on every
     other section on the index, precisely so the 64px sticky header does not
     cover an anchored heading; the value exists to answer this question and
     was already answered. Reading it means this lands in exactly the same
     place as following a `#resources` link, and if the header's height ever
     changes there is one number to update rather than two. */
  const headerTop = () => {
    const el = section.current;
    if (!el) return null;
    const clearance = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - clearance);
  };

  const toggle = () => {
    if (open) {
      /* Measured before the state flush, but it makes no difference which
         side of it you read: everything above this section is untouched by
         the collapse, so its top does not move. */
      const target = headerTop();
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

  const hidden = resources.length - TEASER;

  return (
    <section ref={section} id="resources" className="mb-14 scroll-mt-24">
      {/* No px-3, matching Section in app/page.tsx: the rows below sit in a
          -mx-3 wrapper that cancels their own padding, so a padded heading
          would sit 12px inboard of the list it labels. */}
      <h2 className="text-meta text-foreground-faint mb-2 font-medium">Resources</h2>
      <div className="-mx-3">
        {/* The first four are outside the reveal, so they are never masked
            and never animate. Only the remainder moves, which is also what
            keeps the fade at the boundary rather than over the whole list. */}
        {resources.slice(0, TEASER).map((item) => (
          <ResourceRow key={item.href} item={item} />
        ))}

        {/* `inert` while collapsed: the rows underneath the fade are real
            links in the DOM, and without this Tab walks into nine of them
            behind a mask. */}
        <div id={listId} className="t-reveal" data-open={open} {...{ inert: !open }}>
          {resources.slice(TEASER).map((item) => (
            <ResourceRow key={item.href} item={item} />
          ))}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={toggle}
          /* The guided tour opens this section by clicking this button, so it
             needs a name that survives the copy on it changing. Real click,
             not a state poke: see components/tour/driver.ts. */
          data-tour="resources-more"
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
          {/* The count is the argument for pressing it. "Show more" alone
              asks the reader to guess whether more is three or thirty. */}
          {open ? "Show less" : `Show ${hidden} more`}
          <span className="t-acc-chevron shrink-0" aria-hidden="true">
            <Icon name="disclosure" size="control" />
          </span>
        </button>
      </div>
    </section>
  );
}

/* Row idiom borrowed from components/index/Row.tsx: same padding, same bleed
   outside the text column, same hover. Not imported, because that component
   is title + description + meta + mark, and this one puts the source on the
   title's baseline with the reason underneath. Sharing it would mean adding
   a second layout mode to a component that currently has one. */
function ResourceRow({ item }: { item: (typeof resources)[number] }) {
  /* Press dip matched to Row.tsx, curve and property list included: these two
     rows sit in the same column at the same width, so anything short of an
     identical treatment would read as one list behaving two ways. 1% rather
     than the 3% a button gets, because the same percentage across the full
     width of the measure reads as the page flinching rather than as a control
     answering. Named properties, never `all`: `all` would also tween the focus
     ring, and a focus ring that fades in is late for the one reader who needs
     it. */
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group hover:bg-wash focus-visible:ring-ring/20 ease-out-quint block rounded-lg px-3 py-3 transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span
          className={`flex items-center ${iconGap("inline")} text-body text-foreground font-medium`}
        >
          {item.title}
          <Icon
            name="external"
            className="text-foreground-faint transition-transform duration-150 ease-out group-hover:translate-x-px group-hover:-translate-y-px"
          />
        </span>
        <span className="text-meta text-foreground-faint shrink-0">{item.source}</span>
      </div>
      <p className="text-body-sm text-foreground-subtle mt-1">{item.why}</p>
    </a>
  );
}
