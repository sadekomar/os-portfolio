import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";

/* The section index's card. It had none until now, and neither did the six
   pages under it: both export an `openGraph` object without images, which is
   enough to stop the root card reaching them, so every link to a component
   unfurled as a bare line of text. That is the wrong section to lose, because
   it is the one part of the site that is the work running rather than a
   description of it.

   Same template as every other card. This file is content. */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "Components by Omar Sadek: interface pieces lifted out of the products they shipped in";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Omar Sadek",
    title: "Components",
    /* Not the page's description, which is already the og:description
       directly under the card in every client that shows one. This is the
       lede's second line instead, which makes the claim the description
       leaves implicit. */
    subtitle: "Each one is the real file from the product it shipped in, not a demo.",
  });
}
