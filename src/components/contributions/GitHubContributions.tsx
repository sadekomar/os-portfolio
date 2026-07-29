"use client";

import { use } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Activity } from "@/components/contributions/ContributionGraph";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/components/contributions/ContributionGraph";

/* The promise is created on the server and resolved here with `use()`, so
   the page streams: the rest of the index paints immediately and this
   section swaps in behind a Suspense boundary when the fetch lands.

   The graph is exactly as wide as the column it sits in. Rather than pick a
   block size and hope it lands there, `trackWidth` hands the target to the
   graph and it solves for the block; see the note on that prop. Only the
   2px gutter is chosen here; the ~10px block falls out of the arithmetic.

   This replaces a hand-fitted 7px block sized against the old 512px measure.
   The measure is 640px now, and the graph had quietly stayed 475px wide,
   which is the argument for deriving it: a picked number is right until the
   thing it was picked against moves, and then it is silently wrong.

   Upstream's 16px-per-week default runs to 848px and cuts the year off
   around May, which is the one thing this graph must not do. The point of
   it is twelve months in one glance. Below the column's own breakpoint the
   track still scrolls, where no block size would fit. */

/* The 640px of `--measure` in globals.css. Duplicated as a number because
   the block arithmetic happens in JS, and read back through the DOM it
   would cost a measure pass and a first-paint jump. If the measure moves,
   this moves with it. */
const MEASURE = 640;

export function GitHubContributions({
  contributions,
  githubProfileUrl,
  className,
}: {
  contributions: Promise<Activity[]>;
  githubProfileUrl: string;
  className?: string;
}) {
  const data = use(contributions);

  if (data.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <ContributionGraph
        className={cn("text-meta text-foreground-faint", className)}
        data={data}
        trackWidth={MEASURE}
        blockMargin={2}
        blockRadius={2}
        fontSize={13}
      >
        <ContributionGraphCalendar className="px-3" title="GitHub contributions">
          {({ activity, dayIndex, weekIndex }) => (
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <ContributionGraphBlock
                    activity={activity}
                    dayIndex={dayIndex}
                    weekIndex={weekIndex}
                  />
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {activity.count === 0 ? "No" : activity.count} contribution
                  {activity.count === 1 ? "" : "s"} on{" "}
                  {format(new Date(activity.date), "d MMM yyyy")}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </ContributionGraphCalendar>

        <ContributionGraphFooter className="px-3">
          <ContributionGraphTotalCount>
            {({ totalCount }) => (
              <div className="text-foreground-subtle">
                {totalCount.toLocaleString("en")} contributions in the past year on{" "}
                <a
                  className="text-foreground decoration-foreground-ghost hover:decoration-foreground focus-visible:ring-ring/20 rounded-sm underline underline-offset-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                  href={githubProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                .
              </div>
            )}
          </ContributionGraphTotalCount>

          <ContributionGraphLegend />
        </ContributionGraphFooter>
      </ContributionGraph>
    </TooltipProvider>
  );
}

/* Reserves the graph's own height so the section doesn't jump when the data
   arrives: 21px of month labels, then 7 rows of the ~10.1px block the 640px
   track solves to, on a 2px gutter (104), the 8px stack gap, and the footer
   line (20). Was 110 when the block was 7px, so the reservation has to move
   with the block, or the fix for the width reintroduces the shift. */
export function GitHubContributionsFallback() {
  return (
    <div className="flex h-[132px] w-full items-center justify-center">
      <Spinner size="control" className="text-foreground-faint" />
    </div>
  );
}
