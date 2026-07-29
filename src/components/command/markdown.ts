import { allProjects, type ProjectKeys } from "@/app/work/[project]/projects";

/* ── Page → Markdown ──────────────────────────────────────────────────────
   What "Copy page as Markdown" and the two Open-in-a-chat actions hand off.

   Two sources, and which one is used is decided by whether the page's
   content exists as data or only as layout.

   A case study is data: `projects.ts` holds the intro, the role, the period,
   the stats, the stack and every section as an array of paragraphs, and the
   page is a rendering of that record. Serialising the record is therefore
   not an approximation of the page; it *is* the page, minus the typography.
   It also survives things the DOM cannot give us honestly: the full text of
   a section is present whether or not it has been scrolled into view, and
   the stack list arrives as a list rather than as a comma-run that happens
   to be joined for display.

   Every other page (the index, /about, /blog, /talks) is JSX. There is no
   record behind `<p>` on those routes, so the only source of truth for their
   content is the rendered document, and the walker below scrapes `main` /
   `article` and converts it. That is a real downgrade and worth naming: a
   scrape inherits whatever the DOM happens to say, including text that is
   there for layout reasons, and it will drift the moment a page starts
   rendering content behind an interaction. It is used because the
   alternative is shipping no Markdown at all for four of the routes.

   Nothing here truncates. The URL-length ceiling is handled at the call site
   by refusing to build the link and copying instead (see `chatUrl`), because
   a Markdown document silently cut off mid-sentence is worse than an honest
   "this was too long to put in a link". */

const SITE_URL = "https://sadekomar.com";

/* Re-exported rather than redefined: the case-study page stamps its section
   ids with this exact function, and a jump target that disagrees with the id
   it points at fails silently. See lib/slug.ts. */
export { slugify } from "@/lib/slug";

/* ── The data path ──────────────────────────────────────────────────────── */

export function projectMarkdown(key: ProjectKeys): string {
  const project = allProjects[key];
  const url = `${SITE_URL}/work/${key}`;

  const meta = [
    `- **Role:** ${project.role}`,
    project.period && `- **Period:** ${project.period}`,
    project.link && `- **Site:** https://${project.link}`,
    `- **Stack:** ${[...project.technologies.backend, ...project.technologies.frontend].join(", ")}`,
    `- **Source:** ${url}`,
  ].filter(Boolean) as string[];

  const stats = project.stats?.map((stat) => `- **${stat.value}**: ${stat.label}`) ?? [];

  const sections = project.sections.map((section) => {
    const heading = section.title ? `## ${section.title}\n\n` : "";
    return `${heading}${section.content.join("\n\n")}`;
  });

  return [
    `# ${project.title}`,
    project.intro,
    meta.join("\n"),
    stats.length > 0 ? `## Outcomes\n\n${stats.join("\n")}` : undefined,
    ...sections,
  ]
    .filter(Boolean)
    .join("\n\n")
    .concat("\n");
}

/* ── The scrape path ────────────────────────────────────────────────────── */

/* Elements that become a Markdown block. Queried flat and in document order
   rather than walked recursively, because the pages are shallow and a flat
   query is far less code. The only thing it needs to guard is nesting (a
   `<p>` inside an `<li>` would otherwise be emitted twice), which the
   ancestor test below does. */
const BLOCKS = "h1, h2, h3, h4, p, li, blockquote, figcaption, dt, dd, pre";

const HEADING_LEVEL: Record<string, string> = { H1: "#", H2: "##", H3: "###", H4: "####" };

/* Inline formatting is kept because it is meaning, not decoration: a link's
   href is the one thing on the page a chat window cannot infer from the
   text, and emphasis is how the prose marks a term. Everything else
   collapses to its text. */
function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";
  if (node.getAttribute("aria-hidden") === "true") return "";

  const inner = Array.from(node.childNodes).map(inline).join("");
  if (!inner.trim()) return inner;

  switch (node.tagName) {
    case "A": {
      const href = (node as HTMLAnchorElement).href;
      return href ? `[${inner}](${href})` : inner;
    }
    case "STRONG":
    case "B":
      return `**${inner}**`;
    case "EM":
    case "I":
      return `*${inner}*`;
    case "CODE":
      return `\`${inner}\``;
    default:
      return inner;
  }
}

function blockMarkdown(element: HTMLElement): string | undefined {
  const text = inline(element).replace(/\s+/g, " ").trim();
  if (!text) return undefined;

  const heading = HEADING_LEVEL[element.tagName];
  if (heading) return `${heading} ${text}`;

  switch (element.tagName) {
    case "LI":
      return `- ${text}`;
    case "BLOCKQUOTE":
      return `> ${text}`;
    case "DT":
      return `- **${text}**`;
    case "DD":
      return `  ${text}`;
    case "PRE":
      return `\`\`\`\n${element.textContent?.trim() ?? ""}\n\`\`\``;
    default:
      return text;
  }
}

export function documentMarkdown(url: string): string | undefined {
  const root = document.querySelector<HTMLElement>("main, article");
  if (!root) return undefined;

  const seen = new Set<HTMLElement>();
  const blocks: string[] = [];

  root.querySelectorAll<HTMLElement>(BLOCKS).forEach((element) => {
    /* Skip anything whose own block-level ancestor is already being
       emitted, and anything the page has hidden from assistive tech,
       an `aria-hidden` subtree is by definition not the page's content. */
    if (element.parentElement?.closest(BLOCKS)) return;
    if (element.closest('[aria-hidden="true"]')) return;
    if (seen.has(element)) return;
    seen.add(element);

    const markdown = blockMarkdown(element);
    if (markdown) blocks.push(markdown);
  });

  if (blocks.length === 0) return undefined;

  const title = document.title.split("|")[0].trim();
  /* The title is prepended as an H1 only if the page didn't already open
     with one; /about and /blog both set their own. */
  const hasH1 = blocks[0]?.startsWith("# ");

  return [hasH1 ? undefined : `# ${title}`, `*Source: ${url}*`, ...blocks]
    .filter(Boolean)
    .join("\n\n")
    .concat("\n");
}

/* ── Handing it to a chat ───────────────────────────────────────────────── */

/* Both products read a `q` param on load and drop it into the composer.
   The ceiling is ours, not theirs: browsers will carry far more, but
   intermediaries (proxies, the OS handoff on mobile, anything that logs a
   URL) start truncating somewhere in the low thousands, and a prompt that
   arrives cut in half is the failure mode this number exists to avoid.
   6,000 characters of encoded URL is roughly 3,500 of Markdown, and every case
   study on the site is longer than that, which is the point: the copy-and-
   open fallback is the *normal* path here, not the edge case. */
const MAX_URL = 6000;

export const CHAT_BASE = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
} as const;

export type ChatTarget = keyof typeof CHAT_BASE;

export function chatPrompt(markdown: string, url: string) {
  return `Here is a page from Omar Sadek's portfolio (${url}). Read it, then help me with questions about it.\n\n---\n\n${markdown}`;
}

/** The prefilled URL, or `undefined` when the prompt won't fit in one. */
export function chatUrl(target: ChatTarget, prompt: string): string | undefined {
  const url = `${CHAT_BASE[target]}?q=${encodeURIComponent(prompt)}`;
  return url.length > MAX_URL ? undefined : url;
}
