import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "About Omar Sadek: born in Cairo, programming since CS50";

export default async function Image() {
  return renderOgCard({
    eyebrow: "Omar Sadek",
    /* The title is the page's own h1 rather than a restatement of the site
       name. In a feed the bold line is the only thing read at a glance, so
       it should say which page this is; the eyebrow carries whose it is. */
    title: "About",
    subtitle: "Born in Cairo, programming since CS50. The books, films and music behind the work.",
  });
}
