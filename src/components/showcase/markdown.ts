import type { ShowcaseComponent } from "@/data/components";

import type { SourceFile } from "./source";

/* ── The page, as markdown ────────────────────────────────────────────────
   One function, used by three callers that would otherwise each grow their
   own slightly different version: the `/markdown` route that serves it as a
   document, the Copy page button that puts it on the clipboard, and every
   "open in" link that hands an assistant a URL to fetch.

   The point of it is that a model reading this gets the same thing a person
   reading the page gets, in the order the page presents it, including the
   note about what changed when the component was lifted. A summary that
   quietly dropped that note would be the one part of the page worth having
   and the part an assistant would most confidently repeat wrongly. */

export const SITE_URL = "https://sadekomar.com";

export function componentMarkdown(component: ShowcaseComponent, files: SourceFile[]) {
  const url = `${SITE_URL}/components/${component.slug}`;

  const out: string[] = [
    `# ${component.title}`,
    "",
    component.description,
    "",
    `Built for ${component.project.name}. Source: ${url}`,
    "",
  ];

  if (component.note) {
    out.push("> [!NOTE]", `> ${component.note}`, "");
  }

  out.push("## Features", "");
  for (const feature of component.features) out.push(`- ${feature}`);
  out.push("", "## Usage", "", "```tsx", component.usage, "```", "");

  out.push("## Source", "");
  for (const file of files) {
    out.push(`### ${file.name}`, "", "```" + file.language, file.code, "```", "");
  }

  /* Trailing newline: a markdown file without one is a diff that starts by
     adding one, and this is meant to be saved as well as read. */
  return out.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}

/* ── Handing the page to an assistant ─────────────────────────────────────
   Every one of these is the same shape: a prompt naming the component, plus
   the URL of the markdown above, on the assumption the tool will fetch it.
   The URL has to be absolute and public for that to be true, which is why
   it is built off the deployed origin rather than off `location`. */
export function assistantPrompt(component: ShowcaseComponent) {
  return `Read ${SITE_URL}/components/${component.slug}/markdown and help me understand how the ${component.title} component works.`;
}

export function markdownUrl(slug: string) {
  return `${SITE_URL}/components/${slug}/markdown`;
}

export function githubUrl(slug: string, file: string) {
  return `https://github.com/sadekomar/os-portfolio/blob/main/src/components/showcase/${slug}/${file}`;
}
