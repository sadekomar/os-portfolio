"use client";

import Link from "next/link";

/* ── Route error boundary ─────────────────────────────────────────────────
   Without this file a render throw anywhere inside the layout unwound to the
   React root and the reader got a blank white document. Not a broken page: a
   blank one, with no title, no way back, and nothing to report. The status
   code was 200.

   The copy does not apologise twice and does not speculate about the cause.
   It says what happened, offers the one action that usually works (this
   route, again, because most of what reaches here is transient: a fetch that
   timed out, a hydration mismatch on a slow connection), and then a route
   home for when it doesn't.

   `reset()` re-renders the segment rather than reloading the document, which
   is the cheap attempt. It is first for that reason, but it is a button and
   the link beside it is a link, because they do genuinely different things
   and styling them identically would be a lie about the second one.

   Deliberately no `digest` on screen. It identifies the error in the server
   logs, and this site has no error tracking wired up yet, so printing it
   would ask the reader to carry a number to somebody who cannot look it up.
   When Sentry (or equivalent) lands, this is where the reference goes. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="max-w-measure-gutter text-body mx-auto w-full px-6 pt-16 pb-24 md:pt-24">
      <div className="mb-12">
        <h1 className="text-headline text-foreground mb-4 font-medium">
          Something went wrong here
        </h1>
        <p className="max-w-measure text-body text-foreground-muted">
          This page failed to render. It is usually worth trying again. If it keeps happening, the
          rest of the site is unaffected.
        </p>
      </div>

      <div className="-mx-3 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={reset}
          className="group ease-out-quint hover:bg-wash focus-visible:ring-ring/20 text-body text-foreground cursor-pointer rounded-lg px-3 py-3 font-medium transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
        >
          Try this page again
        </button>
        <Link
          href="/"
          className="group ease-out-quint hover:bg-wash focus-visible:ring-ring/20 text-body text-foreground-muted rounded-lg px-3 py-3 transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
        >
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
