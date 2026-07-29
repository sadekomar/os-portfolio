import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Talks by Omar Sadek: a panel, a talk, and a pitch";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Omar Sadek",
    title: "Talks",
    /* The page is `noindex` until the placeholder dates in data/talks.ts
       are real, but the card is not for crawlers. A link pasted into a DM
       unfurls whatever the page declares regardless of robots, so this has
       to be right now rather than when the directive comes off. */
    /* Typographic apostrophe, matching the page's own lede. A straight
       quote in a rendered image can't be fixed by a stylesheet later. */
    subtitle: "Rooms I’ve spoken in: a panel I moderated, a talk, and a pitch.",
  });
}
