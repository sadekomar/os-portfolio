import { describe, expect, it } from "vitest";

import { clipAtWord } from "@/lib/clip";

describe("clipAtWord", () => {
  it("leaves a string at or under the limit alone, with no ellipsis", () => {
    expect(clipAtWord("Short enough.", 155)).toBe("Short enough.");
    expect(clipAtWord("exactly-ten", 11)).toBe("exactly-ten");
  });

  it("clips at the last word boundary before the limit", () => {
    const text = "The investor pitch for Loom Cairo, on stage at AUC Venture Lab.";
    /* Index 33 is the comma in "Cairo,", so the last boundary at or before it
       is the space at 27. Clipping to the boundary rather than the limit is
       the whole point: "…for Loom Cai…" is what the limit alone would give. */
    const clipped = clipAtWord(text, 33);
    expect(clipped).toBe("The investor pitch for Loom…");
    /* The boundary, not the limit: no partial word, and no space stranded in
       front of the ellipsis. */
    expect(clipped).not.toContain(" …");
  });

  it("hard-cuts a single word longer than the limit instead of dropping a character", () => {
    /* The inherited version was slice(0, lastIndexOf(" ", max)), and
       lastIndexOf returns -1 with no space in range, so slice(0, -1) quietly
       returned the whole string minus its last character with an ellipsis
       stuck on. It needed a 156-character first word to fire, which is why it
       survived: it failed by producing plausible output. */
    const word = "a".repeat(200);
    expect(clipAtWord(word, 155)).toBe(`${"a".repeat(155)}…`);
  });

  it("counts the ellipsis as one character, not three dots", () => {
    const clipped = clipAtWord("one two three four five", 12);
    expect(clipped.endsWith("…")).toBe(true);
    expect(clipped).not.toContain("...");
  });
});
