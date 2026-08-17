import { describe, expect, it } from "vitest";

import { LAST_MODIFIED_FALLBACK, lastModified } from "@/data/lastModified";
import { resolveLastModified } from "@/lib/lastmod";

const FALLBACK = "2026-07-31T00:00:00.000Z";

/* The thing being defended against is not a crash. It is a sitemap that
   validates, deploys, and tells every crawler that twenty URLs changed at
   the same instant — which is the one claim a crawler checks for free, and
   permanently discounts the field for once it catches you. */
describe("resolveLastModified", () => {
  it("returns the mapped date for a known route", () => {
    const map = { "/": "2026-08-01T03:33:44.000Z" };
    expect(resolveLastModified(map, "/", FALLBACK).toISOString()).toBe("2026-08-01T03:33:44.000Z");
  });

  it("falls back for a route the generator never wrote", () => {
    expect(resolveLastModified({}, "/talks", FALLBACK).toISOString()).toBe(FALLBACK);
  });

  it("falls back rather than yielding Invalid Date when the map value is junk", () => {
    /* This is the shape a build that could not reach git leaves behind. An
       Invalid Date here serialises to an empty <lastmod>, which fails schema
       validation for the whole document, not just this URL. */
    const map = { "/": "not a date" };
    const resolved = resolveLastModified(map, "/", FALLBACK);
    expect(Number.isNaN(resolved.getTime())).toBe(false);
    expect(resolved.toISOString()).toBe(FALLBACK);
  });

  it("does not treat an empty-string value as present", () => {
    const resolved = resolveLastModified({ "/": "" }, "/", FALLBACK);
    expect(resolved.toISOString()).toBe(FALLBACK);
  });
});

/* The trap this exists to close, having just been walked into: /talks was
   added to the sitemap while `routes` in scripts/generate-last-modified.mjs
   had no "/talks" key. Nothing errors in that state. The route simply reports
   LAST_MODIFIED_FALLBACK to every crawler, forever, and the only way to
   notice is to read the generated file and compare it against the sitemap by
   hand.

   Asserted against the generated map rather than against the script, because
   the generated map is what the sitemap actually imports. A route added to
   sitemap.ts and forgotten in the generator fails here on the next run. */
describe("the generated route map", () => {
  const routesInSitemap = ["/", "/about", "/blog", "/components", "/talks", "/work"];

  it.each(routesInSitemap)("has a real date for %s, not the fallback", (route) => {
    expect(lastModified[route], `no key for ${route} in the generator's route map`).toBeDefined();
    expect(lastModified[route]).not.toBe(LAST_MODIFIED_FALLBACK);
  });
});
