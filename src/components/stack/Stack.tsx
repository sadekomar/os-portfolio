"use client";

import type * as React from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { TECH_MARKS, type TechMarkName } from "./marks";

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

export function Stack() {
  return (
    /* One provider for the whole table, so moving between pills skips the
       open delay. A second pill after a first is a continued read, not a new
       one, and re-charging 80ms each time makes scanning feel sticky. */
    <TooltipProvider>
      <div className="flex flex-col gap-1">
        {CATEGORIES.map((category, i) => (
          <div
            key={category.title}
            /* Label above the pills on narrow screens, beside them from sm up.
             The label column is sized to the longest title so the pills
             start on one line down the whole table. The alignment is what
             makes it read as a table rather than as six stacked lists. */
            className="grid gap-x-6 gap-y-2 rounded-lg px-3 py-3 sm:grid-cols-[10.5rem_1fr]"
          >
            <h3 className="text-meta text-foreground-subtle flex items-baseline gap-2 font-medium">
              {/* Ordinals are a scanning aid and a promise that the list is
                finite. Tabular, so the column of digits stays a column. */}
              <span className="text-foreground-ghost tabular-nums">
                {String(i + 1).padStart(2, "0")}
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
        ))}
      </div>
    </TooltipProvider>
  );
}

function Pill({ name, mark, note }: Entry) {
  const pill = <PillBody name={name} mark={mark} note={note} />;

  if (!note) return pill;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{pill}</TooltipTrigger>
      {/* Above by default: the pills wrap into rows, and a tooltip below one
          covers the row it belongs next to. */}
      <TooltipContent side="top">{note}</TooltipContent>
    </Tooltip>
  );
}

/* A button, not a span, and only when there's something to read. Hover alone
   would hide these notes from keyboard and screen-reader users entirely, and
   Radix only wires focus and Escape to a real control. Nothing navigates, so
   the type is `button` and it does nothing on click. The interaction is the
   reveal.

   Touch gets nothing here, which is deliberate rather than overlooked: Radix
   doesn't open tooltips on tap, and the workarounds (tap-to-open, long-press)
   put a modal-ish layer between a reader and a table they were scanning. The
   notes are commentary; the pill is the content. */
function PillBody({ name, mark, note, ...props }: Entry & React.ComponentProps<"button">) {
  const Tag = note ? "button" : "span";

  return (
    <Tag
      {...(note ? { type: "button" as const } : {})}
      {...props}
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
    </Tag>
  );
}
