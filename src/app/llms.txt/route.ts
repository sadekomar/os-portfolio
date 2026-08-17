import { allProjects, projectOrder } from "@/app/work/[project]/projects";
import { showcaseComponents } from "@/data/components";
import { EMAIL, contacts } from "@/data/contact";
import { posts } from "@/data/posts";
import { talks } from "@/data/talks";
import { siteUrl } from "@/lib/site";

/* ── /llms.txt ────────────────────────────────────────────────────────────
   robots.ts names seventeen AI crawlers and allows every one of them, and
   the components section already publishes each page as markdown at
   /components/<slug>/markdown. This is the index for both of those: one
   file that says what is here and where the machine-readable version of it
   lives, so a model that arrives at the origin does not have to infer the
   shape of the site from a sitemap of URLs.

   Every line below is generated from the same modules the pages render
   from, for the reason sitemap.ts gives: a hand-written copy of this list
   would be the one that goes stale silently. A case study added to
   projects.ts appears here on the next build, and one that is renamed
   cannot end up described here under its old name.

   /talks was deliberately absent while it was `noindex`: keeping an
   unfinished page out of a crawler's hands applies at least as strongly to a
   file whose entire purpose is to tell a model what to read. The note here
   asked whoever finished the talks copy to take the noindex off and add the
   section in the same change. Both are done, so the section is below.

   `force-static` for the same reason as feed.xml: nothing this reads can
   change between requests, only between deploys. */
export const dynamic = "force-static";

/* Case-study intros run to a paragraph and the convention here is one line
   per entry, so each is clipped to its opening sentence. The lookbehind
   requires a full stop specifically, rather than any sentence-ending
   punctuation: "Yum! Brands" appears in the Instatus intro and splitting on
   an exclamation mark would cut a customer list in half. */
function firstSentence(text: string) {
  return text.split(/(?<=\.)\s/)[0];
}

export function GET() {
  const work = projectOrder
    .map((slug) => {
      const project = allProjects[slug];
      return `- [${project.title}](${siteUrl}/work/${slug}): ${firstSentence(project.intro)}`;
    })
    .join("\n");

  const writing = posts
    .map((post) => `- [${post.title}](${siteUrl}/blog/${post.slug}): ${post.description}`)
    .join("\n");

  /* Each component links to its markdown route rather than to the page it
     is rendered on. The page is a live preview with a code panel behind a
     tab; the markdown is the same component as a document, source files
     included, which is the form worth handing to a reader that cannot
     click. The HTML page is named once, above the list, for anything that
     wants to see it running. */
  const components = showcaseComponents
    .map(
      (component) =>
        `- [${component.title}](${siteUrl}/components/${component.slug}/markdown): ${component.description}`,
    )
    .join("\n");

  /* Role first, then the event, because "Moderator" and "Panellist" are
     different jobs and data/talks.ts types them as a union specifically so a
     reader cannot assume the more flattering one. A model summarising this
     file is exactly the reader most likely to make that assumption. */
  const speaking = talks
    .map(
      (talk) =>
        `- [${talk.title}](${siteUrl}/talks#${talk.slug}): ${talk.role}, ${talk.event}, ${talk.date}. ${firstSentence(talk.description[0] ?? "")}`,
    )
    .join("\n");

  const elsewhere = contacts
    .map((contact) => `- [${contact.name}](${contact.url})`)
    .join("\n");

  const body = `# Omar Sadek

> Product engineer at Instatus and founder of Wholana. This site is the work, the writing that came out of it, and the components lifted from the products themselves.

The site is a Next.js App Router application. Every list on it, the case studies, the essays, the components and the sitemap, is generated from a data module in the repository, so a page and its structured data cannot disagree about what exists. This file is generated from those same modules.

## Work

Case studies, in the order the index lists them: the current job first, then the founded work, then client work. There is no /work route; the index is the Work section of the home page, at ${siteUrl}/#work.

${work}

## Writing

Essays, newest first. There is an RSS feed at ${siteUrl}/feed.xml.

${writing}

## Components

Components taken out of shipped products and documented one page each, at ${siteUrl}/components. The links below are the markdown form of each page: description, behaviour, usage, and the full source of every file. Where a component is adapted from someone else's work, or was changed to run outside its product, the page says so.

${components}

## Talks

Rooms Omar has stood in, in the order the page lists them, at ${siteUrl}/talks. Not chronological: data/talks.ts is ordered deliberately, the same way the work index is. Recordings are embedded where they exist; an entry without one still names the session, the role and the date rather than being held back until footage turns up.

${speaking}

## About

- [About](${siteUrl}/about): Where Omar is from, how he started, and the photos, books, films and music behind the work.
- [Email](mailto:${EMAIL}): The quickest way to get a reply.
${elsewhere}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
