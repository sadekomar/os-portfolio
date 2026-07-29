"use client";

import { useSyncExternalStore } from "react";

import { shippedLabel } from "@/lib/shipped";

/* One line of text under the graph. Deliberately not a card, a badge or a
   pulsing dot. The signal is that the sentence exists and says "today".

   ── The hydration problem ────────────────────────────────────────────────

   The phrase is relative ("today", "3 days ago") but the page is cached.
   The server computes it against server time at render; the reader may
   receive that HTML minutes or hours later, out of the full route cache, on
   a clock in another timezone. Compute it once on the server and it goes
   quietly wrong. Compute it only in the browser and the line is absent on
   first paint, which is a loading state on the index and is not allowed.

   So: both, via `useSyncExternalStore`. The reader's clock is the external
   store: state React does not own and cannot derive. The third argument is
   the server snapshot, so the HTML and the hydration pass render the same
   string and there is no mismatch and no flash. React then reads the client
   snapshot and re-renders only if the answer actually changed, which it
   does not in the overwhelmingly common case.

   The earlier version of this was `useState(initialLabel)` plus an effect
   that called `setLabel`. Same output, worse mechanism: it renders the
   stale value, commits, then renders again, and it is the pattern React's
   own lint rule points at when it says an effect is not how you read
   external state. `useSyncExternalStore` gets it right in the first render
   after hydration instead of the second.

   The machine-readable truth is the absolute date on `<time dateTime>`,
   which the server owns and neither clock can make wrong. */

/* No subscription: a phrase measured in days has nothing to push. React
   reads the snapshot when it renders for its own reasons, and the value
   self-corrects then. Hoisted so the reference is stable across renders,
   an inline arrow would resubscribe on every one. */
const subscribe = () => () => {};

export function LastShippedLine({ date, initialLabel }: { date: string; initialLabel: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () => shippedLabel(date, new Date()),
    () => initialLabel,
  );

  /* The reader's clock can push the date past the cutoff the server thought
     it was inside. Rendering nothing is the same outcome as the fetch
     having failed, which is the intended behaviour in both cases. */
  if (label === null) {
    return null;
  }

  return (
    <p className="text-meta text-foreground-subtle px-3">
      Last shipped <time dateTime={date}>{label}</time>.
    </p>
  );
}
