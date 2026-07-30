import { notFound } from "next/navigation";

import { componentMarkdown } from "@/components/showcase/markdown";
import { readShowcaseSource } from "@/components/showcase/source";
import { componentSlugs, getComponent } from "@/data/components";

/* The page as a document, for anything that reads rather than renders: the
   View as Markdown link, the Copy page button, and the assistants the
   "Open in" menu hands a URL to.

   Statically generated alongside the pages, and `dynamicParams` off so an
   unknown slug is a 404 at the edge rather than a build-time read of a path
   that does not exist. Served as `text/markdown` with `charset` stated,
   because several of the components carry Arabic and a consumer that
   guesses latin-1 turns the whole file into mojibake. */
export const dynamicParams = false;

export function generateStaticParams() {
  return componentSlugs.map((component) => ({ component }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ component: string }> }) {
  const { component: slug } = await params;
  const component = getComponent(slug);
  if (!component) notFound();

  const files = await readShowcaseSource(slug, component.files);

  return new Response(componentMarkdown(component, files), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      /* Inline rather than an attachment: the link is called View as
         Markdown, and a browser that downloads it instead of showing it has
         answered a question nobody asked. */
      "Content-Disposition": "inline",
    },
  });
}
