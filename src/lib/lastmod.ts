/* ── Resolving a route's lastmod ──────────────────────────────────────────
   Lifted out of app/sitemap.ts so it can be tested. The reasoning for why
   this function is defensive at all lives there, with the sitemap; the short
   version is that `Invalid Date` serialises to an empty `<lastmod>`, which
   fails schema validation for the whole document rather than for the one URL
   that caused it.

   Two failure modes reach here and they are not the same:

     route missing from the map   a new route nobody added to the generator
     map value unparseable       a build that could not reach git

   Both resolve to the fallback, because a sitemap that is slightly stale is
   worth more than no sitemap. Neither is *detected* here; that is the CI
   drift check's job, not a runtime concern. */
export function resolveLastModified(
  map: Record<string, string>,
  route: string,
  fallback: string,
): Date {
  const parsed = new Date(map[route] ?? fallback);
  return Number.isNaN(parsed.getTime()) ? new Date(fallback) : parsed;
}
