import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";

/* The homepage card. Name, one line about what the name does, the mark;
   the same three things the top of the index says, in the same order, which
   is the whole reason not to reach for a photograph here: /me.png is a
   portrait, and a portrait unfurled next to a link says "a person" where
   this needs to say "a person who builds X".

   The template lives in components/og/card.tsx. This file is content. */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Omar Sadek: product engineer at Instatus, founder of Wholana";

export default async function Image() {
  return renderOgCard({
    title: "Omar Sadek",
    /* No eyebrow: the title is already the name, and an eyebrow above it
       would be a label on a label. Every other card needs one because its
       title is a section rather than a person. */
    subtitle: "Product engineer at Instatus. Founder of Wholana.",
  });
}
