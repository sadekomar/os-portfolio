import type { Metadata } from "next";
import { Suspense } from "react";

import Link from "next/link";

import {
  GitHubContributions,
  GitHubContributionsFallback,
} from "@/components/contributions/GitHubContributions";
import { LastShipped } from "@/components/contributions/LastShipped";
import { getContributions } from "@/lib/contributions";
import { Credits } from "@/components/index/Credits";
import { Resources } from "@/components/index/Resources";
import { WorkRows, type WorkItem } from "@/components/index/WorkRows";
import { allProjects, type ProjectKeys } from "@/app/work/[project]/projects";
import { DownloadResume } from "@/components/resume/DownloadResume";
import { Stack } from "@/components/stack/Stack";
import { TourO } from "@/components/tour/TourO";
import { MAILTO, contacts } from "@/data/contact";

/* The canonical lives here rather than in the root layout, and that is the
   whole point: metadata merges shallowly from the root down, so a canonical
   declared once in the layout is inherited *verbatim* by every page that
   doesn't override it, and /about and /blog each spent their life telling
   Google they were a duplicate of this page. Declared per-route, it can
   only ever be right. Everything else the index needs (title, description,
   openGraph, twitter) is already correct in the layout default, and
   restating it here would only create a second copy to keep in sync. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* The index is a single column of text in a hierarchy: no thumbnails, no
   logo grid, no photo strip. Depth lives one click down, in the case
   studies. The one graphic is the 20px mark at the head of each row, which
   is a scanning aid rather than decoration; see the note in
   components/logo/Logo.tsx and docs/north-stars.md.

   The Work list has one qualification to that, added deliberately: hovering a
   row floats a preview of its case study. It stays inside the rule because
   none of it is in the layout. The page still loads and prints as a column
   of text, and the image is summoned by a pointer resting on one row rather
   than offered to everyone scanning past. The argument is in full in
   components/index/WorkRows.tsx. */

const GITHUB_USERNAME = "sadekomar";

export default function Home() {
  return (
    /* text-body on the column so `measure` (65ch) resolves against 17px
       type rather than the 16px root, so the column is as wide as 65
       characters of the text actually set in it. */
    <main className="max-w-measure-gutter text-body mx-auto w-full px-6 pt-16 pb-24 md:pt-24">
      <Intro />
      {/* Experience before Work: a short list of employment is the fastest
          answer to "who is this", and the nine-row Work list reads as the
          evidence for it rather than as a wall to get past first. */}
      <Experience />
      <Work />
      <Code />
      {/* Stack sits after the evidence, not before it. It's the one section
          written for scanning rather than reading, and putting a table of
          tool names above the work would answer "what has he used" before
          "what has he built", which is the wrong order for everyone except
          a keyword filter. Low on the page it's still trivially findable by
          the people who came looking for exactly that. */}
      <Section title="Stack">
        <Stack />
      </Section>
      {/* After Stack, and folded. Both for the same reason: it is the other
          section here written for lookup rather than reading, and it is the
          only one whose contents are somebody else's work. A reader who
          wants to know what shaped the pages above will open it; everyone
          else gets one line and carries on to the way to reach me. */}
      <Resources />
      <Elsewhere />
      {/* Last, after the way to reach me, and outside the Section rhythm on
          purpose. It is the only block on this page centred rather than
          flush left, which is how a reader knows the document is over
          before they have read a word of it. See components/index/Credits.tsx
          for what it credits and, more to the point, what it doesn't. */}
      <Credits />
    </main>
  );
}

/* The graph goes after Experience: it's evidence for the two sections above
   it, not a headline of its own. The promise is deliberately not awaited
   here. Passing it down and resolving it inside the client component keeps
   the rest of the index out of the fetch's way. */
function Code() {
  const contributions = getContributions(GITHUB_USERNAME);

  return (
    /* The ids on this and the other sections are scroll targets, and they
       predate nothing: they exist so the guided tour can say "#code" instead
       of counting sections, and so a link to one part of this page is
       possible at all. `scroll-mt-24` on Section already accounts for the
       fixed nav, so an id arrived at from either lands in the same place. */
    <Section title="Code" id="code">
      <Suspense fallback={<GitHubContributionsFallback />}>
        <GitHubContributions
          contributions={contributions}
          githubProfileUrl={`https://github.com/${GITHUB_USERNAME}`}
        />
      </Suspense>
      {/* The same promise, a second consumer, no second request. The graph
          says how much of the year had activity in it, this says whether one
          of those days was today. Together they are a year and a heartbeat;
          the graph alone is a year, and a year read at a glance is history.

          Its own boundary rather than sharing the graph's: two suspending
          reads of one promise under one boundary would hold the whole
          section back on the slower of them, and this one has no work to do
          beyond the fetch. The fallback is an empty 20px line, exactly the
          height this renders at, so nothing moves when it lands, and nothing
          in it says "wait". A spinner would be claiming the reader should
          care about a sentence they haven't been shown yet. */}
      <div className="mt-2">
        <Suspense fallback={<div className="h-[20px]" />}>
          <LastShipped contributions={contributions} />
        </Suspense>
      </div>
    </Section>
  );
}

function Intro() {
  return (
    <section className="mb-16">
      {/* 500, not 600: at 24px Inter's semibold reads as a shout. Weight
          compensates for size: the larger the type, the less of it is
          needed to establish hierarchy. */}
      {/* The O is a button. It is the only control on this page that is also
          part of a sentence, and the tour blooms out of it and returns into
          it: see components/tour/TourO.tsx for why the invitation is one
          breath on a first visit and never again, and why the button's
          accessible name is the letter rather than a description. */}
      <h1 className="text-headline text-foreground mb-6 font-medium">
        Hey, I’m <TourO />
        mar.
      </h1>
      {/* One sentence. This carried three paragraphs of employer, side
          project and hobbies, and every one of them is answered better
          further down: Experience names the job, Work lists what I founded,
          /about has the violin. Repeating them here cost the opening its
          argument and told the reader nothing they weren't about to be told
          anyway.

          The title first, flat and unadorned, then the claim. Two sentences
          rather than one clause doing both jobs: the title is the fact the
          reader needs before anything else here means much, and folding it
          into the second sentence would bury it mid-line. Stated on its own
          it costs nothing and reads as a label rather than a boast, which is
          exactly what a job title should be.

          It says "product engineer" rather than "full-stack software
          engineer", which is a trade made deliberately and against the
          earlier note here. Full-stack is the string a recruiter types, but
          it is also the frame in which Wholana reads as a side project and
          the nightly show reads as a distraction; product engineer is the
          only frame where both are evidence. The search term did not have to
          be given up to make the trade; it still sits in the keywords and in
          every description this page emits, where it does the finding without
          doing the positioning.

          Then the two halves that are actually mine, named separately on
          purpose: the interface and the system under it are what the case
          studies below are evidence for, in that order, and a reader who
          takes only one sentence off this page should leave knowing I claim
          both rather than the usual one.

          "Delightful" is load-bearing and stays. The temptation is to trade
          it for something that sounds more measured, but every neighbouring
          word here is already sober, and a sentence with nothing warm in it
          describes a competent engineer rather than this one. It is also the
          half a hiring manager cannot verify from a repo, so it has to be
          said out loud. Its counterweight is the second half: "hold up in
          production" is checkable, and delight next to an unbacked claim is
          just enthusiasm. */}
      <div className="text-body text-foreground-muted">
        <p>
          I’m a product engineer. I build interfaces that are delightful to use, on
          systems that hold up in production.
        </p>
      </div>
      {/* ── Availability ─────────────────────────────────────────────
          The one fact a hiring reader needs that the work below cannot
          supply. Everything else on this page is evidence they can weigh at
          their own pace; where I am and whether they can employ me is a
          gate, and a gate left unstated is answered with a guess. The guess
          is usually the pessimistic one, which costs the whole page.

          It sits here rather than in Elsewhere because it is only useful
          before the reading, not after it. A visitor who scrolls nine case
          studies deep and then learns the timezone has already spent the
          attention this line was supposed to qualify.

          Small type, same colour rung as the sentence above it. Size does
          the hierarchy so the rung doesn't have to: this is logistics
          rather than the claim, but it is still text a reader has to be
          able to read, not a label beside something.

          Written as facts in the order they get asked: where, what hours,
          what it would take to move. Sponsorship is named outright rather
          than softened into "open to opportunities worldwide", because the
          reader who cares is the one who has to budget for it, and finding
          out late is the version that wastes both sides' time. */}
      <p className="text-body-sm text-foreground-muted mt-4">
        Based in Cairo, Egypt (UTC+2/+3), working remotely, on hours that overlap a full
        European day and most of a US East Coast morning. Open to relocating for the right
        role, which would need visa sponsorship.
      </p>
      {/* Left-aligned to the text column rather than centred or floated:
          it's the next thing after the second paragraph, so it sits where
          the next paragraph would. */}
      <div className="mt-6">
        <DownloadResume />
      </div>
    </section>
  );
}

/* The list is data rather than JSX children because the hover preview needs
   each row as a value it can hold and anchor a panel to, not as an element
   already committed to the tree. `preview` and `role` are read off the case
   study itself (see below) so the index can't drift from the page it points
   at.

   ── Why it is grouped ────────────────────────────────────────────────────
   These ran as one flat column until now, in exactly this order, and the
   order was doing all of the work: a reader was expected to infer from
   position alone that Wholana is mine and that Little Lads was a client who
   paid an invoice. Nobody infers that. What a flat list actually reads as is
   a set of interchangeable things, three of which say "Argonaut" and
   therefore look like padding rather than like one deep client relationship.

   The grouping is by *kind of relationship*, which is the axis a reader is
   already sorting on and the only one that changes how a row should be
   weighed. Not by technology (a stack is a lookup, and the Stack section
   below is where lookups go), not by year (the dates are already on the
   rows), and not by discipline (every one of these was both design and
   engineering, which is the point of the intro).

   ── Why four rows are missing ────────────────────────────────────────────
   Instatus, Wholana, Loom Cairo and the UN platform are not here because
   they are in Experience, one section up, and a reader who has just read a
   row does not need to meet it again four inches later. Experience is the
   canonical entry for anything with a date range someone else can verify;
   this list is what is left, which is the founded work and the client work.

   That empties the Product group, which held Instatus alone, so it is gone
   rather than kept as an empty heading. `projectOrder` in projects.ts is
   untouched: it still carries every slug, because it drives the routes
   and the prev/next pager, and a case study dropping off this index does
   not make it stop existing. */
/* `logo` is omitted alongside the rest of the derived fields: the mark is
   recorded once on the case study itself, and a row restating it here could
   only ever be a second copy to keep in sync. Title and description stay
   local. They are the index's own editorial line about the project, written
   shorter and for scanning, not the case study's. */
type WorkRow = Omit<WorkItem, "href" | "preview" | "role" | "logo"> & { slug: ProjectKeys };

const workGroups: { title: string; items: WorkRow[] }[] = [
  {
    /* Untitled, and deliberately. The dedupe left one row in here, and a
       heading over a single row is a label doing less work than the row it
       labels: "Founded" above one founded thing tells a reader nothing the
       row's own description does not. Client work below still earns its
       heading at five rows. WorkRows renders a group with no title as bare
       rows, so this costs nothing but the string. */
    title: "",
    items: [
      {
        slug: "tiktok-news-network",
        title: "TikTok News Network",
        description:
          "A nightly satirical broadcast about the Egyptian internet. Founded it, host it, built the site it runs on. 20M+ views, 72K+ followers, 260 stories.",
      },
    ],
  },
  {
    title: "Client work",
    items: [
      {
        slug: "argonaut",
        title: "Argonaut",
        description:
          "Site and custom CMS for an EPC contractor, with the information architecture built around how procurement buyers actually search.",
      },
      {
        slug: "argonaut-crm",
        title: "Argonaut CRM",
        description:
          "The internal quote and RFQ workflows behind multi-million-dollar pipelines: registrations, supplier tracking, and won/lost/pending dashboards.",
      },
      {
        slug: "argotemp",
        title: "Argotemp",
        description:
          "Equipment rental and maintenance operations, where a rental has no status column at all: it is an append-only chain of jobs, reconciled against unit state on every transition and again nightly.",
      },
      {
        slug: "alunaut",
        title: "Alunaut",
        description:
          "The daily site report for an aluminium and facade contractor, filed from a phone in Arabic, signed on the phone, and emailed to management as a PDF.",
      },
      {
        slug: "little-lads",
        title: "Little Lads",
        description:
          "A rebuild of a boys’ apparel brand’s storefront, aimed at brand equity, engagement, and conversion.",
      },
    ],
  },
];

function Work() {
  /* Resolved on the server: `hero` holds StaticImageData, so the blur
     placeholder and the dimensions are known at build time and the panel
     paints without a layout shift on first hover. */
  const groups = workGroups.map((group) => ({
    title: group.title,
    items: group.items.map(({ slug, ...row }): WorkItem => ({
      ...row,
      href: `/work/${slug}`,
      logo: allProjects[slug].mark,
      preview: allProjects[slug].hero?.images[0]?.src,
      role: allProjects[slug].role,
      /* Year ranges rather than the month precision Experience carries: a
         job has a start date, a project has a span. Absent where the case
         study has no period yet, so the column is ragged rather than
         invented. */
      meta: allProjects[slug].period,
    })),
  }));

  return (
    <Section title="Work" id="work">
      <WorkRows groups={groups} />
    </Section>
  );
}

/* The employment list, and since the dedupe the canonical entry for anything
   with a date range: four of these five rows are the only place their case
   study is linked from the index.

   ── Why it renders through WorkRows ──────────────────────────────────────
   It used to be a plain column of Rows in this server component, and the
   preview panel was Work's alone. That split stopped making sense the moment
   the four case-study rows moved up here: the affordance that says "rest on a
   row and see what you're about to click" was left pointing at the client
   work while the rows most worth previewing had none.

   So both lists now run through the same component. It is one group with no
   title, which WorkRows already renders headingless, so nothing about this
   section's appearance changes except that a hover now opens a panel. The
   roving tabindex, the arrow keys and the last-input-wins selection come
   along with it, which this list wanted anyway and never had.

   Every row here now points at a case study, Dell included. It was the one
   exception for a long time, linking out to dell.com because there was
   nothing of my own to link to; the Summer Academy write-up closed that.
   dell.com is still reachable, as the Site field on the case study, which
   is the right place for it: a reader clicking a row on my site is asking
   what I did there, not for Dell's front door. */
function Experience() {
  const rows: WorkItem[] = [
    {
      href: "/work/instatus",
      title: "Instatus",
      logo: allProjects.instatus.mark,
      preview: allProjects.instatus.hero?.images[0]?.src,
      role: allProjects.instatus.role,
      meta: "Dec 2024 – Present",
      description:
        "Full-stack software engineer. Status pages serving 10M+ visits a month for Sketch, Harvard, Siemens, and Yum! Brands, plus the Slack and Teams integrations.",
      /* Where the tour's video parks. It is the Instatus row rather than the
         section because the bubble is aimed at a thing, not at a heading: it
         comes out of the O, arcs down the column and settles in the gutter
         beside the row the first spoken line is about. See TourBubble. */
      dock: true,
    },
    {
      href: "/work/wholana",
      title: "Wholana",
      logo: allProjects.wholana.mark,
      preview: allProjects.wholana.hero?.images[0]?.src,
      role: allProjects.wholana.role,
      meta: "Mar 2026 – Present",
      description:
        "Founder and engineer. AI content system for TikTok. It enriches videos with a shared subject and craft vocabulary. $100+ MRR and growing!",
    },
    {
      href: "/work/activity-management-platform",
      title: "UNITAR (UN agency)",
      logo: allProjects["activity-management-platform"].mark,
      preview: allProjects["activity-management-platform"].hero?.images[0]?.src,
      role: allProjects["activity-management-platform"].role,
      meta: "Sep 2024 – Nov 2024",
      description:
        "Software engineering contract. Coordination for a UN agency across regions, scales, and stakeholders.",
    },
    {
      href: "/work/loom-cairo",
      title: "Loom Cairo",
      logo: allProjects["loom-cairo"].mark,
      preview: allProjects["loom-cairo"].hero?.images[0]?.src,
      role: allProjects["loom-cairo"].role,
      meta: "Jun 2023 – Oct 2025",
      description:
        "Founding engineer. A search engine for local fashion aggregating 300+ Egyptian brand sites. 40,000+ users, 70+ brand partnerships.",
      /* The one badge on the page, and it is here because this is the one row
         a reader is most likely to discount. "Founding engineer" at a company
         that shut down reads, without help, as a side project that ran long.
         Accepted into AUC Venture Lab is the third-party fact that says
         otherwise, and it is the kind of claim that has to be checkable to be
         worth making, so the chip is a link to the recording of the pitch
         rather than a word next to the title.

         The chip goes to V-Lab itself, because that is where a claim about a
         credential should point and because a reader checking it wants the
         granting institution rather than my account of it. The tooltip
         carries the second destination: the recording of the pitch, on
         /talks, which is the answer to "what did he actually do there" that
         an accelerator's homepage cannot give. */
      badge: {
        label: "V-Lab ’25",
        href: "https://business.aucegypt.edu/research/centers/vlab",
        tooltip: {
          text: "AUC Venture Lab.",
          link: { label: "Watch the demo", href: "/talks#loom-cairo-auc-venture-lab" },
        },
      },
    },
    {
      href: "/work/dell-summer-academy",
      title: "Dell Technologies",
      logo: allProjects["dell-summer-academy"].mark,
      /* No preview: the case study carries no imagery, because there are no
         captures of the project left to carry. WorkRows already renders a
         panel without one, so the row degrades to its text rather than to a
         hole. */
      preview: allProjects["dell-summer-academy"].hero?.images[0]?.src,
      role: allProjects["dell-summer-academy"].role,
      meta: "Aug 2022 – Sep 2022",
      description:
        "Solutions architecture internship at the Egypt Center of Excellence. Six weeks, 38 students, ending in a pitch for Gnosis, a lecture engine built around pedagogy.",
    },
  ];

  return (
    /* Employment first, then everything else by start date, newest first.

       The list used to be sorted by start date alone, and the note here
       argued for it on the grounds that it was the only rule that survived
       the overlaps (Wholana runs alongside Instatus, Instatus started while
       Loom Cairo was still going) and that "current first" would need a
       second rule the moment two rows were current. Both halves of that are
       still true. What changed is which question the list is being asked.

       A reader arriving from a job application is looking for the row where
       somebody else made the hiring decision, and that row was second. So the
       partition is now employment vs. work I started myself: Instatus is the
       only current employer, so it leads, and the rest follow on the old rule
       untouched. It is one rule plus one partition, and the partition has no
       ties to break: Wholana and Loom Cairo are things I founded, and the
       date order inside each half is unchanged. */
    <Section title="Experience" id="experience">
      <WorkRows groups={[{ title: "", items: rows }]} />
    </Section>
  );
}

function Elsewhere() {
  return (
    <Section title="Elsewhere" id="elsewhere">
      <p className="text-body-sm text-foreground-muted px-3 pb-3">
        More <Prose href="/about">about me</Prose>, some <Prose href="/blog">writing</Prose>, or the{" "}
        <Prose href="/resume.pdf" download="resume-omar-sadek.pdf">
          résumé
        </Prose>
        . The quickest way to reach me is <Prose href={MAILTO}>email</Prose>.
      </p>
      <ul className="text-body-sm flex flex-wrap gap-x-5 gap-y-2 px-3">
        {contacts.map((contact) => (
          <li key={contact.url}>
            <a
              href={contact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-subtle decoration-foreground-ghost hover:text-foreground hover:decoration-foreground-subtle focus-visible:ring-ring/20 rounded-sm underline underline-offset-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
            >
              {contact.name}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      {/* Inverse of the h1: 13px needs 500 to hold its own against the
          body copy beneath it, where 24px did not. */}
      {/* `muted` rather than the `faint` these headings started on. Faint is
          the rung for labels beside a thing, and it reads as one at 13px,
          but it is 2.5:1 on this canvas and a section heading is text. The
          hierarchy is unchanged, it just moves up a rung with the group
          headings under it: muted here, subtle for the h3s below. */}
      {/* No px-3. The rows below live in a -mx-3 wrapper that cancels their
          own padding, so their marks sit on the column edge; padding here
          would push the heading 12px inboard of the thing it labels, which
          is the one alignment on the page a reader can see going wrong. */}
      <h2 className="text-meta text-foreground-muted mb-2 font-medium">{title}</h2>
      <div className="-mx-3">{children}</div>
    </section>
  );
}

function Prose({
  href,
  children,
  download,
}: {
  href: string;
  children: React.ReactNode;
  download?: string;
}) {
  const className =
    "rounded-sm text-foreground underline decoration-foreground-ghost underline-offset-[3px] transition-colors duration-150 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

  if (href.startsWith("/") && !download) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      download={download}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
