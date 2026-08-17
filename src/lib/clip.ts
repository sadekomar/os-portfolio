/* ── Clipping a meta description ──────────────────────────────────────────
   Lifted out of the case-study route's `generateMetadata` so it can be
   tested, and fixed on the way out.

   Clipping happens at the last word boundary at or before the limit, not at
   the limit, because a description cut mid-word is the one kind of truncation
   a reader notices in a search result. The ellipsis is the single character
   "…", not three dots, so it counts as one against the limit rather than
   three.

   The inherited version was `slice(0, lastIndexOf(" ", max))`, which has a
   quiet edge: `lastIndexOf` returns -1 when there is no space in range, and
   `slice(0, -1)` then silently drops the final character of the string and
   appends an ellipsis to it. That needs a 156-character first word to fire,
   so no case study triggers it today — but it fails by producing plausible
   wrong output rather than by throwing, which is exactly the class of thing
   worth pinning down while it is cheap. A word longer than the limit is now
   hard-cut at the limit instead. */
export function clipAtWord(text: string, max: number): string {
  if (text.length <= max) return text;

  const boundary = text.lastIndexOf(" ", max);
  if (boundary <= 0) return `${text.slice(0, max)}…`;

  return `${text.slice(0, boundary)}…`;
}
