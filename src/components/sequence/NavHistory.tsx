"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* ── Where the reader came from ───────────────────────────────────────────
   One question, asked by one caller: is the page Escape would send the
   reader to the same page they arrived from?

   It exists because `router.push(indexPath)` is the wrong verb for a key
   that means "out of here". Push appends a history entry and lands at the
   top of the destination, so Escape out of a case study returned the reader
   to the heading of the Work section rather than to the row they had opened
   (measured on the index at y=1400, back at y=790), and left Back pointing
   *into* the case study they had just escaped. Two wrongs from one call:
   the position is lost, and the browser's own way out of the site is now
   one press further away.

   `router.back()` fixes both for free, because scroll restoration on a
   popstate is the browser's job and Next already does it: the same trip
   through `history.back()` lands at y=1400 on the nose. What it needs in
   return is a guarantee that back actually goes to the index, which is the
   only thing this module answers.

   ── Why the answer is tracked rather than read ───────────────────────────
   There is no API for "what is the previous history entry". `document.referrer`
   does not update across a soft navigation, and Next's own history state is
   an internal shape that would be a bug the day it changes. So the route is
   recorded as it changes, in module scope, which survives a client-side
   navigation and dies with the tab, the same lifetime as the history stack
   it is describing.

   Deliberately the *route* history and not the entry stack: after a back,
   `previous` becomes the page that was left rather than the entry now behind
   the index. That divergence cannot be observed, because the only reader is
   a pager, and pagers do not mount on index pages. Every case it does answer
   is a case where being wrong means falling back to the old push, never
   navigating somewhere the reader did not ask for. */

let previous: string | null = null;
let current: string | null = null;

export function previousPathname() {
  return previous;
}

/* Mounted once, in the root layout, and renders nothing. It has to be above
   the routes rather than inside the pager, because the transition worth
   recording is the one *onto* the index, and the pager is not there for it. */
export function NavHistory() {
  const pathname = usePathname();

  useEffect(() => {
    /* Guards the StrictMode double-mount, which would otherwise record the
       same route twice and shift the real previous one off the end. */
    if (pathname === current) return;
    previous = current;
    current = pathname;
  }, [pathname]);

  return null;
}
