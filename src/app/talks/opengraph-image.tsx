import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Talks by Omar Sadek: a panel, a talk, and a pitch";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Omar Sadek",
    title: "Talks",
    /* Written while the page was still `noindex`, on the reasoning that a card
       is not for crawlers: a link pasted into a DM unfurls whatever the page
       declares regardless of robots, so this had to be right before the
       directive came off rather than after it. It is off now, and this needed
       no change, which was the argument. */
    /* Typographic apostrophe, matching the page's own lede. A straight
       quote in a rendered image can't be fixed by a stylesheet later. */
    subtitle: "Rooms I’ve spoken in: a panel I moderated, a talk, and a pitch.",
  });
}
