import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";
import { allProjects, projectOrder, type ProjectKeys } from "./projects";

/* ── Why a generated card rather than the project's own hero ──────────────
   Three of the nine case studies have a hero figure; the other six ship no
   imagery at all, so reusing hero art would give a third of the work a real
   share card and hand the rest the site's portrait of me, a photograph of
   a person standing in for a piece of software. The two failures are not
   symmetrical either: a wrong image is worse than a plain one, because the
   card is the only thing a reader sees before deciding to click.

   The hero images that do exist are also product screenshots at whatever
   aspect ratio the capture happened to be, and 1.91:1 crops them through
   the middle of a UI. A generated card is uniform across all nine, always
   legible at the size these are actually rendered, and stays correct when
   the tenth case study lands with no art.

   Every word and every glyph on the card is read off `projects.ts`, so the
   same object the page header renders from. There is no second copy of a
   title, a role, a period or a logo in this file, so a card cannot describe
   a case study the page no longer is. The template itself lives in
   components/og/card.tsx and is shared with the four site cards. */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/* The image is a route of its own, so it needs its own params to be
   prerendered alongside the nine pages rather than rendered on demand. */
export async function generateStaticParams() {
  return projectOrder.map((project) => ({ project }));
}

/* One image per page, declared through generateImageMetadata rather than a
   static `alt` export, because that export is a module constant and would
   describe all nine cards identically. The alt text is what a screen reader
   is handed in place of the card, so it names the project.

   The unnamed-project branch is not defensive noise: Next calls this once
   with no params while collecting page data, before any static param
   exists, and an unguarded lookup there fails the build rather than the
   request. */
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ project: string }>;
}) {
  const { project: key } = (await params) ?? {};
  const project = allProjects[key as ProjectKeys];

  return [
    {
      id: "card",
      size,
      contentType,
      alt: project ? `${project.title}, a case study by Omar Sadek` : "A case study by Omar Sadek",
    },
  ];
}

export default async function Image({ params }: { params: Promise<{ project: string }> }) {
  const { project: key } = await params;
  const project = allProjects[key as ProjectKeys];

  /* Role and period, joined only where both are there. Every case study has
     a role; one day one of them won't have a period, and a card reading
     "Design and engineering ·" with nothing after it is the kind of error
     that only ever surfaces in someone else's group chat. */
  const subtitle = [project.role, project.period].filter(Boolean).join(" · ");

  return renderOgCard({
    eyebrow: "Case study",
    title: project.title,
    subtitle,
    mark: project.mark,
  });
}
