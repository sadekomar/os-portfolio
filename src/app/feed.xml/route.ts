import type { Block } from "@/data/posts";
import { posts } from "@/data/posts";
import { siteUrl } from "@/lib/site";

/* ── The feed ─────────────────────────────────────────────────────────────
   RSS 2.0 rather than Atom, for one reason that has nothing to do with the
   formats being better or worse: every reader parses RSS, and the one field
   this feed cares about most, the full post body, has a de facto home there
   in `content:encoded` and a much more contested one in Atom's `content`
   with a `type` attribute nobody agrees on.

   `force-static` because everything this route reads is a TypeScript array
   compiled into the bundle. Left dynamic, Next would re-render the whole
   feed per request on a site where the only thing that can change it is a
   deploy, and the CDN in front would never be allowed to hold it.

   The feed is full text, and that is a decision the data made rather than
   one taken on principle. A post here is `Block[]`: four variants, each
   carrying plain strings. There is no MDX, no serialised React, and nothing
   in a post that can express a layout, so every block has an exact HTML
   equivalent and none of it is a guess. If posts.ts ever grows a block type
   that renders a component, this has to fall back to summaries rather than
   invent markup for it: a truncated feed is a smaller version of the post,
   and a mangled one is a different post. */
export const dynamic = "force-static";

/* Escapes the five characters that can end an XML text node early. Applied
   twice on the way to `content:encoded`, and deliberately: once when the
   HTML is built, so an ampersand in the prose is a valid HTML entity, and
   again over the finished markup, so the tags themselves survive as text
   inside the XML. A reader unescapes the outer layer, gets HTML with the
   inner entities intact, and renders exactly what the page renders. */
function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* The inline vocabulary from components/blog/Prose.tsx, restated as strings.
   It is the same alternation in the same order (code first, so a backticked
   run containing an asterisk is consumed whole) and it has to stay that way,
   because a reader seeing different emphasis from the page is the one bug
   in a feed nobody reports.

   Restated rather than shared because the two produce different things: the
   page returns React nodes carrying Tailwind classes and a `next/link`, and
   a feed has neither a router nor a stylesheet. Factoring out the common
   part would leave a parser that hands its caller an array of tagged spans
   and two renderers over it, which is more machinery than one regex. */
const INLINE = /(`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

function inline(text: string) {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return `<code>${escape(part.slice(1, -1))}</code>`;
      }

      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return `<em>${escape(part.slice(1, -1))}</em>`;
      }

      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (link) {
        const [, label, href] = link;
        /* Site-relative hrefs are resolved against the origin here. A feed
           item is read outside the document it came from, so "/work/wholana"
           resolves against the reader's own base and lands nowhere. */
        const absolute = href.startsWith("/") || href.startsWith("#") ? `${siteUrl}${href}` : href;
        return `<a href="${escape(absolute)}">${escape(label)}</a>`;
      }

      return escape(part);
    })
    .join("");
}

/* h2 rather than h1 for a `h` block, matching the page: the post title is
   the h1 and a reader that renders the item title above the content would
   otherwise show two of them. */
function html(blocks: Block[]) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "h":
          return `<h2>${escape(block.text)}</h2>`;
        case "p":
          return `<p>${inline(block.text)}</p>`;
        case "list":
          return `<ul>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`;
        case "code":
          /* The caption becomes a `figcaption` inside a `figure`, as on the
             page, rather than a paragraph after the block. Readers that
             strip unknown elements keep the text either way, and the ones
             that don't get the association. */
          return block.caption
            ? `<figure><pre><code>${escape(block.code)}</code></pre><figcaption>${inline(
                block.caption,
              )}</figcaption></figure>`
            : `<pre><code>${escape(block.code)}</code></pre>`;
      }
    })
    .join("");
}

/* RFC 822 with a four-digit year, which RSS 2.0 asks for and
   `toUTCString()` produces exactly. Posts carry a date and no time, so the
   whole feed publishes at midnight UTC; inventing an hour to look more
   precise would be a claim the data cannot support. */
function rfc822(date: string) {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

const CHANNEL_TITLE = "Omar Sadek";
const CHANNEL_DESCRIPTION =
  "Essays on design engineering by Omar Sadek. Notes on the parts of the work that took a second attempt.";

export function GET() {
  /* `posts` is newest first already and the array order is the published
     order (see the note at the top of data/posts.ts), so this sorts by date
     rather than trusting that. Two posts sharing a day keep their array
     order, which is what a stable sort gives and what the index shows. */
  const items = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  /* The newest post's date, not `new Date()`. A `lastBuildDate` that moves
     on every deploy tells a reader polling hourly that something changed
     when nothing did, and the readers that use it to decide whether to fetch
     the body end up doing so for a file they already have. */
  const lastBuildDate = items[0] ? rfc822(items[0].date) : new Date().toUTCString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escape(CHANNEL_TITLE)}</title>
    <link>${siteUrl}/blog</link>
    <description>${escape(CHANNEL_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map((post) => {
    const url = `${siteUrl}/blog/${post.slug}`;

    /* The guid is the permalink, and `isPermaLink="true"` says so. The
       alternative, a synthetic id, buys the freedom to change a post's URL
       without every subscriber seeing it again, and this site cannot use
       that freedom: the slug is also the route, the canonical and the
       sitemap entry, so a slug change is a new page regardless. */
    return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <description>${escape(post.description)}</description>
      <content:encoded>${escape(html(post.blocks))}</content:encoded>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
