import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Writing by Omar Sadek: essays on design engineering";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Omar Sadek",
    /* "Writing", not "Blog", because that is what the h1 on the page says
       and a card that disagrees with the page it opens is a small lie. */
    title: "Writing",
    subtitle: "Notes on the parts of the work that took a second attempt.",
  });
}
