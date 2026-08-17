import { describe, expect, it } from "vitest";

import { fillHoles, groupByWeeks } from "@/components/contributions/ContributionGraph";

type Activity = { date: string; count: number; level: number };

const day = (date: string, count = 0, level = 0): Activity => ({ date, count, level });

/* This is the vendored half of the contributions graph, and it is the part
   that can be wrong quietly. Both functions take a sparse list of days from a
   third-party endpoint and turn it into a grid; a dropped day or a
   mis-padded first column renders as a calendar that looks completely
   plausible and is off by one square for the rest of the year. Nothing
   throws, nothing logs, and the only way to notice is to count. */
describe("fillHoles", () => {
  it("returns nothing for no activity, rather than a one-day range at the epoch", () => {
    expect(fillHoles([])).toEqual([]);
  });

  it("keeps a single day as a single day", () => {
    expect(fillHoles([day("2026-01-01", 3, 2)])).toEqual([day("2026-01-01", 3, 2)]);
  });

  it("fills the gap between two days with explicit zeroes", () => {
    const filled = fillHoles([day("2026-01-01", 5, 3), day("2026-01-04", 2, 1)]);
    expect(filled.map((a) => a.date)).toEqual([
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
      "2026-01-04",
    ]);
    /* The inserted days must be real zeroes, not holes: the renderer reads
       `level` to pick a colour and would otherwise index off undefined. */
    expect(filled[1]).toEqual(day("2026-01-02", 0, 0));
    expect(filled[2]).toEqual(day("2026-01-03", 0, 0));
  });

  it("sorts before ranging, so unordered input still spans the full interval", () => {
    /* The endpoint has no documented ordering guarantee, and taking the
       first element as the range start would silently return one day. */
    const filled = fillHoles([day("2026-01-05"), day("2026-01-01"), day("2026-01-03")]);
    expect(filled).toHaveLength(5);
    expect(filled.at(0)?.date).toBe("2026-01-01");
    expect(filled.at(-1)?.date).toBe("2026-01-05");
  });
});

describe("groupByWeeks", () => {
  it("returns nothing for no activity", () => {
    expect(groupByWeeks([])).toEqual([]);
  });

  it("pads the first week so a mid-week start lands in the right column", () => {
    /* 1 Jan 2026 is a Thursday. With weeks starting Sunday, the first column
       needs four empty cells in front of it or every square in the graph
       shifts up by four days. */
    const weeks = groupByWeeks([day("2026-01-01", 1, 1)]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0]?.slice(0, 4)).toEqual([undefined, undefined, undefined, undefined]);
    expect(weeks[0]?.[4]).toEqual(day("2026-01-01", 1, 1));
  });

  it("does not pad when the range already starts on the week's first day", () => {
    /* 1 Mar 2026 is a Sunday. */
    const weeks = groupByWeeks([day("2026-03-01"), day("2026-03-07")]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0]?.[0]?.date).toBe("2026-03-01");
    expect(weeks[0]).toHaveLength(7);
  });

  it("splits into calendar weeks of seven, leaving only the last one short", () => {
    const weeks = groupByWeeks([day("2026-03-01"), day("2026-03-10")]);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[1]).toHaveLength(3);
    /* Ten consecutive days in, ten real days out: nothing dropped by the
       slicing. */
    expect(weeks.flat().filter(Boolean)).toHaveLength(10);
  });
});
