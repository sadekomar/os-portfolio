import type * as React from "react";

import { StackNoteLayer } from "./StackNote";
import { Reveal } from "@/components/ui/reveal";
import { TECH_MARKS, type TechMarkName } from "./marks";

import { slugify } from "@/lib/slug";

/* ── Stack ────────────────────────────────────────────────────────────────
   A reference table, not a skills display.

   docs/north-stars.md rules out "skill bars, tool logo grids,
   percentage-proficiency charts", and the index's own note says no logo
   grid. This section is the deliberate exception, and it earns it by being
   a different kind of object: a grid is a wall of marks with no argument
   behind the arrangement, whereas this is a list of named categories whose
   contents happen to have logos. Read down the left column and it still
   makes sense with every glyph removed. That is the test it has to pass.

   It exists because it is the one thing on this site written for someone
   scanning rather than reading. A recruiter filtering for "Postgres" is
   doing a lookup, and a lookup wants a table. Everything else here is prose
   because everything else here is an argument.

   No proficiency levels, no years, no bars. A claim of "advanced" is
   unfalsifiable and reads as padding; the case studies one click away are
   the evidence, and this is only the index into them.

   Separation is tonal and by gap, per the surface scale in globals.css. The
   numbered label column does the work the reference's hairline rules were
   doing. */

/* `note` is a first-person line about the tool, not a description of it:
   "what I use it for and what I think of it", which is the only thing this
   table can say that a search result can't. Kept to one sentence, because it
   is a footnote to a pill, and anything longer stops being scannable, which
   was the whole reason this section is a table. No note is better than a
   filler note, so the field is optional and the pill degrades to plain
   text. */
type Entry = { name: string; mark?: TechMarkName; note?: string };

const CATEGORIES: { title: string; items: Entry[] }[] = [
  {
    title: "Languages",
    items: [
      {
        name: "TypeScript",
        mark: "typescript",
        note: "Default for everything. I'd rather argue with the compiler for ten minutes than with production at 2am.",
      },
      {
        name: "JavaScript",
        mark: "javascript",
        note: "Where I started. Still what I read when a bundle or a stack trace stops making sense.",
      },
      {
        name: "Python",
        mark: "python",
        note: "My reach for scripts, scraping and anything data-shaped. The fastest path from idea to a thing that runs once.",
      },
      {
        name: "SQL",
        mark: "postgresql",
        note: 'The skill with the best returns per hour spent. Most "we need a cache" problems are a missing index.',
      },
    ],
  },
  {
    title: "Frontend",
    items: [
      {
        name: "React",
        mark: "react",
        note: "The model I think in. Most of my React bugs turn out to be state living in the wrong place.",
      },
      {
        name: "Next.js",
        mark: "nextdotjs",
        note: "Server components made the data-fetching layer mostly disappear, which is the highest praise I have for a framework.",
      },
      {
        name: "Tailwind CSS",
        mark: "tailwindcss",
        note: "Ugly in the file, honest in the diff. I can see exactly what a change touches, and nothing rots in a stylesheet nobody owns.",
      },
      {
        name: "shadcn/ui",
        mark: "shadcnui",
        note: "Components you own rather than depend on. Every file in this site's ui/ folder has been edited.",
      },
      {
        name: "Radix UI",
        mark: "radixui",
        note: "I use it so I never have to hand-roll focus trapping again. Accessibility as a primitive, not a retrofit.",
      },
      {
        name: "Motion",
        mark: "framer",
        note: "For the 150–200ms transitions nobody notices. If an animation is noticeable it's usually too slow.",
      },
      {
        name: "TanStack Query",
        mark: "tanstack",
        note: "Deleted more of my code than any other library. Most global state was just server state waiting to be cached.",
      },
      {
        name: "Rocicorp Zero",
        note: "Queries that stay live and writes that land before the server answers. The first sync engine I've trusted with the read path.",
      },
      {
        name: "Yjs",
        note: "Two cursors in one document with no merge conflicts to resolve. CRDTs are the rare case where the hard theory buys you a simpler product.",
      },
      {
        name: "MUI",
        mark: "mui",
        note: "Fast to a working admin panel, slow to a specific one. Good for internal tools, fought me on everything else.",
      },
    ],
  },
  {
    title: "Backend & Database",
    items: [
      {
        name: "Node.js",
        mark: "nodedotjs",
        note: "One language across the stack. Worth it for the shared types alone.",
      },
      {
        name: "PostgreSQL",
        mark: "postgresql",
        note: 'My default answer to "which database". Constraints in the schema, so bad data can\'t exist rather than being cleaned up later.',
      },
      {
        name: "Prisma",
        mark: "prisma",
        note: "Great migrations and great types. I still drop to raw SQL the moment a query gets interesting.",
      },
      {
        name: "Express",
        mark: "express",
        note: "Boring on purpose. When the interesting part is the pipeline behind the route, the router should have no opinions.",
      },
      {
        name: "Temporal",
        mark: "temporal",
        note: "Durable execution, so a deploy mid-job resumes instead of losing the night. Retries and idempotency stop being my code.",
      },
      {
        name: "pgvector",
        mark: "postgresql",
        note: "Semantic search without a second database to keep in sync. The index lives next to the rows it ranks.",
      },
      {
        name: "GraphQL",
        mark: "graphql",
        note: "Earns its complexity with many clients, and only then. For one frontend I'd rather ship endpoints.",
      },
      {
        name: "Redis",
        mark: "redis",
        note: "Queues, rate limits and sessions. Reaching for it as a cache is usually a sign I skipped the query plan.",
      },
      {
        name: "Supabase",
        mark: "supabase",
        note: "Postgres with the boring parts done. The exit is a connection string, which I know because I've taken it.",
      },
      {
        name: "Payload CMS",
        mark: "payloadcms",
        note: "The CMS I hand to clients without wincing. Config in TypeScript, content in my own database.",
      },
      {
        name: "Better Auth",
        mark: "betterauth",
        note: "Auth I can read end to end, in my tables. Rolling my own is the one thing I'll never talk myself into again.",
      },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      {
        name: "AWS",
        mark: "amazonwebservices",
        note: "Where things go when they outgrow a platform. I use a small, dull corner of it on purpose.",
      },
      {
        name: "Docker",
        mark: "docker",
        note: 'Mostly here so "works on my machine" stops being a sentence anyone says.',
      },
      {
        name: "Vercel",
        mark: "vercel",
        note: "Preview deploys changed how I get feedback, because a link beats a screenshot every time. This site is on it.",
      },
      {
        name: "Cloudflare",
        mark: "cloudflare",
        note: "DNS, edge caching and the odd Worker. The cheapest performance win is usually the request that never reaches my server.",
      },
      {
        name: "Hetzner",
        mark: "hetzner",
        note: "A box I own, behind Cloudflare, for a tenth of the platform bill. Worth learning once, on something whose downtime is mine.",
      },
      {
        name: "Sentry",
        mark: "sentry",
        note: "So users stop being my error reporting. First thing I add, before analytics.",
      },
      {
        name: "PostHog",
        mark: "posthog",
        note: "Session replay is the part that changes my mind. Watching one person miss a button beats a week of guessing at funnels.",
      },
    ],
  },
  {
    title: "Tooling & quality",
    items: [
      {
        name: "pnpm",
        mark: "pnpm",
        note: "Strict by default, so a package I never installed can't be imported. Workspaces are the reason the monorepo is pleasant.",
      },
      {
        name: "Turborepo",
        mark: "turborepo",
        note: "The cache is the feature. Two apps and three packages, and CI still only builds what actually changed.",
      },
      {
        name: "Biome",
        mark: "biome",
        note: "Lint and format in one tool, fast enough to run on save. Ended an argument I was having with my own config.",
      },
      {
        name: "Vitest",
        mark: "vitest",
        note: "I test the parts where being wrong is silent: pipelines, money, permissions. Not the parts a screenshot would catch.",
      },
      {
        name: "Playwright",
        mark: "playwright",
        note: "The last line of defence, kept small. A handful of flows that must never break, run against a real browser.",
      },
      {
        name: "Zod",
        mark: "zod",
        note: "Parse at the boundary so the inside of the app can stop being defensive. Every scraper and model response comes through it.",
      },
    ],
  },
  {
    title: "Workflow & AI",
    items: [
      {
        name: "Git",
        mark: "git",
        note: "Small commits with messages that explain why. The history is documentation that can't drift.",
      },
      {
        name: "GitHub",
        mark: "github",
        note: "PRs and Actions. If a check isn't in CI, it isn't a rule; it's a hope.",
      },
      {
        name: "Claude",
        mark: "claude",
        note: "My default pair for real code. Best on the work I could do myself but would rather not do twice.",
      },
      {
        name: "Cursor",
        mark: "cursor",
        note: "Where the editing happens. The multi-file edits are the part I'd miss.",
      },
      {
        name: "ChatGPT",
        mark: "openai",
        note: "Thinking out loud and second opinions. Rarely the one I ship from.",
      },
      {
        name: "Gemini",
        mark: "googlegemini",
        note: "The long-context one. Whole codebases and long documents in a single pass.",
      },
      {
        name: "MCP",
        mark: "modelcontextprotocol",
        note: "I've shipped a server, not just consumed one. It turns a product's database into something a non-technical user can ask questions of.",
      },
      {
        name: "AI SDK",
        note: "Structured output over messy real-world text, with the provider behind a seam. Swapping models is a config change, not a rewrite.",
      },
    ],
  },
  {
    title: "Design",
    items: [
      {
        name: "Figma",
        mark: "figma",
        note: "I design enough to know what I'm building, then finish in the browser, where the thing actually lives.",
      },
    ],
  },
];

/* How many categories stay visible when the table is collapsed. Two, and
   they are the first two: Languages and Frontend.

   ── Why the table folds at all ───────────────────────────────────────────
   Seven categories and forty-seven pills is the longest section on the
   index, and it is the one written for scanning rather than reading. Open,
   it made the index look like a CV with a skills wall in the middle of it,
   which is the impression this site is otherwise built to avoid: it puts a
   list of tool names between the work and the way to reach me, and a reader
   who has just finished the case studies gets a keyword dump as the thing
   they read last.

   Folding is the cheaper fix than cutting, and the honest one. The names
   still have to be here (a recruiter filtering for "Postgres" is doing a
   lookup, and this is the only page that answers it), but they do not have
   to be the loudest thing in the column. Two categories say what kind of
   table this is; the fade says there is more of it; the rest is one press
   away for the reader who came for exactly that. Nothing is hidden from
   search, because the pills are in the HTML either way.

   Two rather than Resources' four because a category is a whole row of
   pills rather than one line, and Frontend alone wraps to three rows, so
   two of these is already the taller teaser. They are also the right two:
   they answer "what does he write in" and "what does he build the screen
   with", and everything under the fold answers "how does he run it", which
   is a follow-up question. */
const TEASER = 2;

/* A server component, and the table is the reason it can be. It is a
   constant rendered once, so the only things here that ever needed the
   browser were the hover label and the fold, and both have been lifted into
   client components that take their content as props. What the boundary
   buys is that `CATEGORIES` above and `TECH_MARKS` in marks.ts are read
   during the render and then stay behind: the notes reach the reader as
   `data-stack-note` attributes in the HTML, which the delegated listener was
   always reading them from anyway, and the 47 icon paths reach them as drawn
   `<path d>` rather than as a dictionary the client has to be shipped in
   order to look them up. */
export function Stack() {
  const hidden = CATEGORIES.length - TEASER;

  return (
    /* One label for the whole table, and one set of listeners on the
       container that owns it. A second pill after a first is a continued
       read, not a new one: the note moves to it rather than a second
       tooltip opening. See StackNote.

       The listeners stay on this container rather than moving inside the
       fold, which is what keeps the fold free: the handler finds its answer
       with `closest("[data-stack-note]")` from whatever the pointer is over,
       and it does not care that half the pills are now inside a masked div
       that was rendered upstream. */
    <StackNoteLayer className="flex flex-col gap-1">
      <Reveal
        teaser={CATEGORIES.slice(0, TEASER).map((category, i) => (
          <Category key={category.title} category={category} index={i} />
        ))}
        rest={CATEGORIES.slice(TEASER).map((category, i) => (
          <Category key={category.title} category={category} index={i + TEASER} />
        ))}
        /* The reveal's wrapper is a flex child of the gapped column above,
           so without this the four categories inside it would collapse into
           one block with no space between them while every category above
           the fold kept its gap. */
        restClassName="flex flex-col gap-1"
        /* Named, not just counted. "Show 4 more" over a table of pills reads
           as four pills. */
        more={`Show ${hidden} more categories`}
      />
    </StackNoteLayer>
  );
}

/* The ordinal is passed in rather than derived from a map index, because the
   list is rendered in two slices now and a second `map` would restart the
   numbering at 01 halfway down the table. */
function Category({
  category,
  index,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
}) {
  return (
    <div
      /* Label above the pills on narrow screens, beside them from sm up.
         The label column is sized to the longest title so the pills start on
         one line down the whole table. The alignment is what makes it read
         as a table rather than as six stacked lists. */
      className="grid gap-x-6 gap-y-2 rounded-lg px-3 py-3 sm:grid-cols-[10.5rem_1fr]"
    >
      <h3 className="text-meta text-foreground-subtle flex items-baseline gap-2 font-medium">
        {/* Ordinals are a scanning aid and a promise that the list is
            finite. Tabular, so the column of digits stays a column. */}
        <span className="text-foreground-ghost tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        {category.title}
      </h3>

      <ul className="flex flex-wrap gap-1.5">
        {category.items.map((item) => (
          <li key={item.name}>
            <Pill {...item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* A button, not a span, and only when there's something to read. Hover alone
   would hide these notes from keyboard and screen-reader users entirely, and
   focus and Escape only reach a real control. Nothing navigates, so the type
   is `button` and it does nothing on click. The interaction is the reveal.

   `aria-describedby` points at a visually hidden copy of the note rather than
   at the floating label, which is one element shared by every pill and so
   cannot be the description of any of them. It also means the note is
   available to a screen reader without a hover ever happening, where the
   tooltip this replaced only existed while it was open.

   Touch gets nothing here, which is deliberate rather than overlooked: there
   is no hover on a touchscreen, and the workarounds (tap-to-open,
   long-press) put a modal-ish layer between a reader and a table they were
   scanning. The notes are commentary; the pill is the content. */
function Pill({ name, mark, note }: Entry) {
  /* Derived from the name rather than from `useId`, because `useId` is a
     hook and this is a server component now. Deriving it is not a downgrade:
     an `aria-describedby` target only has to be unique in the document, the
     47 names in the table are distinct, and a stable id is one fewer thing
     that can differ between the server's markup and the client's. */
  const noteId = `stack-note-${slugify(name)}`;
  const Tag = note ? "button" : "span";

  return (
    <Tag
      {...(note
        ? {
            type: "button" as const,
            /* The pointer handler on the table reads the note off here, so
               there is one listener for the whole section and adding a pill
               is a data change. See StackNote. */
            "data-stack-note": note,
            "aria-describedby": noteId,
            /* Named explicitly because the description lives inside the
               button: without this the accessible name would be the pill
               plus the whole note, and every pill would announce twice. */
            "aria-label": name,
          }
        : {})}
      className={
        "text-meta bg-wash text-foreground-muted inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2" +
        (note
          ? // The only affordance is the label darkening a step on hover,
            // enough to say "there's more here" without turning the row into
            // a set of buttons competing for a click that doesn't exist. The
            // fill stays `wash`, since changing both would read as a control.
            " hover:text-foreground focus-visible:ring-ring/20 cursor-default transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
          : "")
      }
    >
      {mark ? (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="currentColor"
          /* Held a step lighter than the label. The mark is there to be
             recognised at a glance, not to be the loudest thing in a pill
             whose actual payload is the word. A row of full-contrast logos
             reads as a badge collection. */
          className="text-foreground-faint shrink-0"
          aria-hidden="true"
          focusable="false"
        >
          <path d={TECH_MARKS[mark]} />
        </svg>
      ) : (
        /* Rocicorp Zero, Yjs and the AI SDK reach this: none of the three
           ships a mark in Simple Icons, and the honest answer is a
           placeholder rather than a near-enough glyph borrowed from
           something else. Drawing one myself would be worse again, since a
           logo I invented is a logo that is wrong. A dot holds the same
           optical slot so a markless pill doesn't break the rhythm of the
           row. */
        <span className="bg-foreground-ghost size-1.5 shrink-0 rounded-full" aria-hidden="true" />
      )}
      {name}
      {note && (
        <span id={noteId} className="sr-only">
          {note}
        </span>
      )}
    </Tag>
  );
}
