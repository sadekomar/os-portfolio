import type { Activity } from "@/components/contributions/ContributionGraph";
import { LastShippedLine } from "@/components/contributions/LastShippedLine";
import { lastShippedDate, shippedLabel } from "@/lib/shipped";

/* The server half: it awaits the promise the Code section already created,
   so this adds a Suspense boundary and no network. Everything that can be
   decided from server state is decided here, and only the two strings the
   browser needs to correct itself cross into the client bundle.

   Three separate ways this renders nothing, all of them silent: the fetch
   failed and returned [] (see lib/contributions.ts), there is no day with
   activity in the payload, or the most recent one is older than the
   cutoff. None of them produce an em dash, an error, or a reserved gap
   with an apology in it; the section is simply one line shorter. */
export async function LastShipped({ contributions }: { contributions: Promise<Activity[]> }) {
  const data = await contributions;
  const now = new Date();

  const date = lastShippedDate(data, now);

  if (date === null) {
    return null;
  }

  const label = shippedLabel(date, now);

  if (label === null) {
    return null;
  }

  return <LastShippedLine date={date} initialLabel={label} />;
}
