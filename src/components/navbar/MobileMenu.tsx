"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { menuPages } from "@/data/menuPages";

/* ── The nav below `sm` ───────────────────────────────────────────────────
   Five links plus a wordmark is more than a phone's top row will hold at a
   readable size, so on touch the links leave the header and become one
   control docked at the bottom-right of the viewport, where a thumb already
   is. The header keeps the wordmark and nothing else. The morph itself (a
   40px circle growing up and left into the panel, the plus rotating into an
   ×) is all in globals.css under `.t-morph`; this file is only the state
   that drives `data-open` and the behaviour a menu has to have to be one.

   The panel is not a modal. It doesn't trap focus, lock the scroll or lay
   an overlay over the page, because it is five links in a 192px box, and
   every one of those would be a bigger interruption than the thing they
   were protecting. What it does have is the four ways out a reader will
   actually try: the ×, a tap outside, Escape, and following a link.

   The command palette is hidden at this width for its own reasons (see
   command/CommandHint.tsx), so this is the only nav control on a phone. */

export function MobileMenu() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  /* Navigating closes it. Clicking a link would do that too, but not for
     the back button, an in-page anchor, or the guided tour driving a real
     click from outside this component, and all three leave the panel
     hanging over the new page. Watching the path covers every route change
     regardless of what caused it.

     Adjusted during render rather than in an effect, which is React's own
     answer for state that has to reset when a prop changes: an effect would
     paint the new route once with the panel still open, then close it on a
     second pass, and it's the flash of that first frame the reader sees. */
  const [renderedFor, setRenderedFor] = useState(pathname);
  if (renderedFor !== pathname) {
    setRenderedFor(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    /* Escape puts focus back on the toggle. Without that, dismissing from
       the keyboard drops focus onto <body> and the next Tab restarts at the
       top of the document, which is a worse place than where the reader
       was. */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    /* pointerdown rather than click: a click fires after the press has
       already moved things, and on touch that means the panel is still
       open under a finger that was aiming at the page behind it. */
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    /* The 40px slot the morph is absolutely positioned in. Fixed, so it
       stays put while the page scrolls under it, and `max(1rem, ...)` so it
       clears the home indicator on a notched phone and still has a real
       margin on one without.

       z-40, under the command palette's z-50 rather than beside it: the
       palette is hidden at this width but an iPad with a keyboard can still
       open it, and a floating dot on top of a modal is nobody's idea of a
       stacking order. */
    <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 h-10 w-10 sm:hidden">
      <div
        ref={ref}
        className="t-morph"
        data-open={open ? "true" : "false"}
        /* Height is `head + count * row` in CSS; the count is the only part
           of it this file knows. */
        style={{ "--t-morph-count": menuPages.length } as React.CSSProperties}
      >
        {/* `inert` while closed, because `pointer-events: none` only stops
            the mouse: without it the links stay in the tab order and a
            keyboard lands inside a panel that isn't on screen. */}
        <ul className="t-morph-menu" inert={!open}>
          {menuPages.map((page) => {
            const active =
              page.slug === "/"
                ? pathname === "/"
                : pathname === page.slug || pathname.startsWith(`${page.slug}/`);

            return (
              <li key={page.slug}>
                <Link
                  href={page.slug}
                  aria-current={active ? "page" : undefined}
                  className="t-morph-link text-body-sm"
                  onClick={() => setOpen(false)}
                >
                  {page.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          ref={toggleRef}
          type="button"
          className="t-morph-toggle"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          /* The outside-click listener is on the document, so without this
             the toggle's own press would close what it just opened. */
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setOpen((value) => !value)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
