import dynamic from "next/dynamic";
import { createElement, type ComponentType } from "react";

/* ── Slug to component ────────────────────────────────────────────────────
   Kept apart from `src/data/components.ts` on purpose. That file is plain
   serialisable data, and it is imported by the metadata route, the sitemap
   and the nav rail. If the dynamic imports lived in it, every one of those
   would pull the whole showcase in behind a request for a list of titles.

   Deliberately not `ssr: false`. These are the content of the page rather
   than an enhancement to it, and skipping them on the server would leave
   the stage empty in the first paint and then reflow the article the moment
   hydration lands, which is the shift the stage's `min-height` exists to
   prevent. One of them (the WhatsApp thread) has no client JS at all and
   would be pure loss.

   Each import names its own export rather than relying on a default,
   because none of these were authored as default exports and adding one on
   the way over is a change to the file the Code panel is showing. */
export const showcaseRegistry: Record<string, ComponentType> = {
  "color-pills": dynamic(() => import("./color-pills/color-pills").then((m) => m.ColorPills)),
  "brand-values-dial": dynamic(() =>
    import("./brand-values-dial/brand-values-dial").then((m) => m.BrandValuesDial),
  ),
  "decode-flow": dynamic(() => import("./decode-flow/decode-flow").then((m) => m.DecodeFlow)),
  "expandable-features": dynamic(() =>
    import("./expandable-features/expandable-features").then((m) => m.ExpandableFeatures),
  ),
  "whatsapp-screen": dynamic(() =>
    import("./whatsapp-screen/whatsapp-screen").then((m) => m.WhatsAppScreen),
  ),
  "isometric-brands": dynamic(() =>
    import("./isometric-brands/isometric-brands").then((m) => m.IsometricBrands),
  ),
};

/* ── What the stage overrides ─────────────────────────────────────────────
   The props the showcase passes that the product did not. Kept here rather
   than edited into the components, because the Code panel is showing those
   files and a lift that quietly differs from the file printed under it is
   the one thing this section cannot afford.

   Expandable Features defaults its `heading` to the section title it shipped
   under on the Wholana landing page, set in a fluid clamp that tops out at
   60px. On its own page that is the first thing you read; inside a preview
   panel it is 2.5x the article's own h1 and the largest type on the site,
   which otherwise stops at 32px, so the panel row it is meant to introduce
   reads as a caption to it. The heading is a prop precisely so the host can
   supply its own, and here the host already has one. */
export const showcaseProps: Record<string, Record<string, unknown>> = {
  "expandable-features": { heading: null },
};

export function hasShowcaseEntry(slug: string) {
  return slug in showcaseRegistry;
}

/* The page renders the preview through this rather than pulling the
   component out and calling it itself. Both do the same thing, but a
   capitalised binding assigned during a render is indistinguishable, to
   the lint rule that guards against remounting, from a component defined
   inline on every pass. Reading the record here and handing it to
   `createElement` says the reference is fixed, which it is: the record is
   module scope and never rebuilt. */
export function ShowcasePreview({ slug }: { slug: string }) {
  const entry = showcaseRegistry[slug];
  return entry ? createElement(entry, showcaseProps[slug]) : null;
}
