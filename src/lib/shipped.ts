import { differenceInCalendarDays, parseISO } from "date-fns";

import type { Activity } from "@/components/contributions/ContributionGraph";

/* "Last shipped", derived from the contribution payload the Code section
   has already fetched, rather than from a second API call.

   The obvious source is GitHub's own `/users/:user/events/public`, which
   carries push events to the second. It is the wrong source here: Omar's
   work lives in private repos, so that feed is empty and the newest public
   push is months old. A line reading "last shipped 5 months ago" while the
   graph directly above it shows contributions today is worse than no line;
   it is a confident, precise falsehood. The contributions API counts
   private contributions, so it is the only unauthenticated source that
   tells the truth about this account.

   The cost is granularity: days, not hours. That is an honest trade, since the
   line says "today" or "3 days ago" and never pretends to know more.

   Reusing the same promise also buys a property a separate fetch could not:
   the line and the graph are always computed from one payload, so they can
   never disagree about whether there was activity today. */

/* Past two weeks the line stops being a signal of life and becomes a
   report on an absence. It renders nothing instead, the same silence as
   the API being down, which is the correct behaviour for a supporting
   detail that has nothing to add. */
const MAX_AGE_DAYS = 14;

/* The most recent day with any activity. Walks backwards because the
   payload is chronological and the answer is nearly always the last or
   second-to-last entry.

   `now` is passed in rather than read here so the same function can run on
   the server at render time and again in the browser against the reader's
   clock; see LastShippedLine. Future-dated entries are skipped: the
   payload includes today from midnight UTC onward, and a reader west of
   UTC can be on the previous calendar day when it arrives. */
export function lastShippedDate(contributions: Activity[], now: Date): string | null {
  for (let index = contributions.length - 1; index >= 0; index--) {
    const activity = contributions[index];

    if (activity.count === 0) {
      continue;
    }

    if (differenceInCalendarDays(now, parseISO(activity.date)) < 0) {
      continue;
    }

    return activity.date;
  }

  return null;
}

/* `parseISO` on a bare YYYY-MM-DD gives local midnight, not UTC midnight,
   which is what a calendar-day comparison wants: the date is a label on a
   square in a grid, not an instant. */
export function shippedLabel(date: string, now: Date): string | null {
  const days = differenceInCalendarDays(now, parseISO(date));

  if (days < 0 || days > MAX_AGE_DAYS) {
    return null;
  }

  if (days === 0) {
    return "today";
  }

  if (days === 1) {
    return "yesterday";
  }

  return `${days} days ago`;
}
