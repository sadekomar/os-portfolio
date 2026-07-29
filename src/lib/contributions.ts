import "server-only";

import type { Activity } from "@/components/contributions/ContributionGraph";

/* Jonathan Gruber's GitHub Contributions API, the same scrape GitHub's own
   profile grid renders, without needing a token.
   https://github.com/grubersjoe/github-contributions-api

   Upstream wraps this in `unstable_cache`; Next's own Data Cache does the
   job with one option and no deprecated API. `revalidate: 86400` means the
   index is served from cache and refreshed at most once a day. The grid
   moves once per day at the fastest, so anything shorter buys nothing and
   costs a round trip on a cold render.

   A failure returns [] rather than throwing: the graph is a supporting
   detail, and an API that's down should cost the section, not the page. */

const API_URL =
  process.env.GITHUB_CONTRIBUTIONS_API_URL ?? "https://github-contributions-api.jogruber.de";

type GitHubContributionsResponse = {
  contributions?: Activity[];
};

export async function getContributions(username: string): Promise<Activity[]> {
  try {
    const res = await fetch(`${API_URL}/v4/${username}?y=last`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as GitHubContributionsResponse;
    return data.contributions ?? [];
  } catch {
    return [];
  }
}
