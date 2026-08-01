import { allProjects, type ProjectKeys } from "@/app/work/[project]/projects";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/components/og/card";
import { componentSlugs, getComponent } from "@/data/components";

/* A component's card carries the product's mark rather than the monogram,
   which is the whole claim the page makes: this is not a piece invented for a
   showcase, it came out of something that shipped. The case-study cards
   already do this, and a component card that fell back to "OS" would be
   quietly making the opposite argument in the one place most people see.

   The mark is read through `allProjects` off the project's own slug rather
   than mapped here, so there is no second table pairing a component with a
   logo. A component whose project has no case study gets the monogram, which
   is the honest answer: there is nothing to point at.

   Every word is read off components.ts, the same object the page renders
   from. The template lives in components/og/card.tsx. This file is content. */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/* Prerendered alongside the six pages rather than rendered on demand, the
   same as the case studies: the image is a route of its own and needs its own
   params to be built with them. */
export async function generateStaticParams() {
  return componentSlugs.map((component) => ({ component }));
}

/* Per-component alt text, for the reason the case studies and the essays
   generate theirs: a static `alt` export is a module constant and would
   describe all six identically. The undefined branch covers the pass Next
   makes while collecting page data, before any static param exists. */
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component: slug } = (await params) ?? {};
  const component = getComponent(slug);

  return [
    {
      id: "card",
      size,
      contentType,
      alt: component
        ? `${component.title}, a component by Omar Sadek`
        : "A component by Omar Sadek",
    },
  ];
}

export default async function Image({ params }: { params: Promise<{ component: string }> }) {
  const { component: slug } = await params;
  const component = getComponent(slug);
  const project = component?.project;

  return renderOgCard({
    eyebrow: "Component",
    title: component?.title ?? "Components",
    /* The product, not the description. The description is the og:description
       sitting directly under the card, and the same sentence twice at two
       sizes is the mistake the essay cards avoid by printing the date. Where
       a component came from is the one fact the card can add, and it is the
       fact the mark above it is already showing. */
    subtitle: project ? `Built for ${project.name}` : "Lifted out of a shipped product",
    mark: project?.slug ? allProjects[project.slug as ProjectKeys]?.mark : undefined,
  });
}
