import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";
import { formatDate, getPost, posts } from "@/data/posts";

/* A post's card is its own headline and its own date, not the author photo
   the metadata used to fall back to. The title is the argument of the essay
   (it is the one line that decides whether a link in a group chat gets
   opened) and handing that job to a portrait of me spends it on the wrong
   subject entirely.

   Same template as every other card. This file is content. */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

/* Per-post alt text, for the same reason the case studies generate theirs:
   a static `alt` export is a module constant and would describe every essay
   identically. The undefined branch covers the pass Next makes while
   collecting page data, before any static param exists. */
export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = (await params) ?? {};
  const post = getPost(slug);

  return [
    {
      id: "card",
      size,
      contentType,
      alt: post ? `${post.title}, an essay by Omar Sadek` : "An essay by Omar Sadek",
    },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  return renderOgCard({
    eyebrow: "Writing",
    title: post?.title ?? "Writing",
    /* The date rather than the description. The description is already the
       og:description directly under the card in every client that shows one,
       and repeating it inside the image would be the same sentence twice at
       two different sizes. The date is the one fact the card can add. */
    subtitle: post ? formatDate(post.date) : "Essays on design engineering",
    mark: undefined,
  });
}
