/* Source of truth for both the static params and the prev/next footer, so a
   new case study can't be added to one and forgotten in the other. Order
   matches the Work list on the index. */
export const projectOrder = [
  "instatus",
  "wholana",
  "tiktok-news-network",
  "loom-cairo",
  "argonaut",
  "argonaut-crm",
  "argotemp",
  "alunaut",
  "activity-management-platform",
  "little-lads",
] as const;

export type ProjectKeys = (typeof projectOrder)[number];

import loomPreview from "./(loom)/loom-preview.png";
import loomAPI from "./(loom)/loom-api.png";
import loomWebApp from "./(loom)/loom-web-app.png";
import loomBrands from "./(loom)/loom-brands.png";
import loomDb from "./(loom)/loom-db.png";

import ladsNavigation from "./(lads)/ll-navigation.png";
import ladsPreview from "./(lads)/ll-preview.png";
import ladsProblem from "./(lads)/ll-problem.png";
import ladsTestimonials from "./(lads)/ll-testimonials.png";

/* Captured off the live sites at 1440x900 and deviceScaleFactor 2, so a 2880px
   master feeds the 1036px tile at 2x with room to spare. WebP rather than PNG
   because these are photographs of real pages, not the flat Figma exports the
   other case studies ship: the shots carrying photography are lossy, and the
   three that are mostly type and rules are lossless, which for flat UI came
   out both smaller than the PNG and pixel-exact. */
import tnnPreview from "./(tnn)/tnn-preview.webp";
import tnnBriefings from "./(tnn)/tnn-briefings.webp";
import tnnBureaus from "./(tnn)/tnn-bureaus.webp";
import tnnArchive from "./(tnn)/tnn-archive.webp";
import tnnWholana from "./(tnn)/tnn-wholana.webp";

/* Captured out of the running app at 1440x900 and deviceScaleFactor 2, same
   spec as the TNN shots, on a seeded workspace rather than a mock: the
   corpus, the counts and the Arabic captions are the real thing. The cursors
   and name flags belonging to other members are live presence caught in
   frame, not drawn on afterwards. Lossy WebP for the shots carrying video
   thumbnails, which is nearly all of them; the collaborative script page is
   flat type and came out smaller lossless. */
import wholanaExplore from "./(wholana)/wholana-explore.webp";
import wholanaCraft from "./(wholana)/wholana-craft.webp";
import wholanaDashboard from "./(wholana)/wholana-dashboard.webp";
import wholanaFilterBuilder from "./(wholana)/wholana-filter-builder.webp";
import wholanaSwipeFile from "./(wholana)/wholana-swipe-file.webp";
import wholanaCreator from "./(wholana)/wholana-creator.webp";
import wholanaSubjects from "./(wholana)/wholana-subjects.webp";
import wholanaYourVideos from "./(wholana)/wholana-your-videos.webp";
import wholanaAsk from "./(wholana)/wholana-ask.webp";
import wholanaScript from "./(wholana)/wholana-script.webp";
import wholanaScriptsBoard from "./(wholana)/wholana-scripts-board.webp";
import wholanaMembers from "./(wholana)/wholana-members.webp";
import wholanaNotifications from "./(wholana)/wholana-notifications.webp";

import argoPreview from "./(argonaut)/argo-preview.webp";
import argoPartnerships from "./(argonaut)/argo-partnerships.webp";
import argoExpertise from "./(argonaut)/argo-expertise.webp";
import argoArms from "./(argonaut)/argo-arms.webp";

import unPreview from "./(un)/un-preview.png";
import unActions from "./(un)/un-actions.png";
import unDoubleDiamond from "./(un)/un-double-diamond.png";
import unWebApp from "./(un)/un-web-app.png";

import type { Figure } from "@/components/case-study/Figure";
import type { MarkName } from "@/components/logo/marks";

export type Project = {
  title: string;
  /* Opening sentence. Mentions the project by name, since the page sets that
     name solid and the rest of the line lighter, in place of a title slab. */
  intro: string;
  /* Quiet meta line under the intro, in place of a tech-stack chip grid. */
  role: string;
  period?: string;
  link?: string;
  /* The organisation's mark, by name in components/logo/marks.ts. It lives
     here rather than only in the Work list on the index because the share
     card needs it too, and a second copy of "which logo belongs to this
     case study" is a second place for it to go stale. The card would keep
     showing Argonaut's knot next to Argotemp's title long after anyone
     noticed. `import type` so this file takes the union without pulling the
     image imports in behind it.

     Optional, and currently every case study sets one. It stays optional
     because the mark has to be the organisation's, and a client who never
     had a usable symbol is a real possibility rather than an oversight.
     Those cards fall back to the site's own monogram. */
  mark?: MarkName;
  /* Outcome figures, pulled up out of the prose where they were buried.
     Optional and deliberately sparse: only projects with numbers that can
     be defended in a room get a row, and no row runs past three. Where the
     figure is the product's scale rather than mine, the label says so
     rather than letting the page imply otherwise. */
  stats?: { value: string; label: string }[];
  technologies: {
    backend: string[];
    frontend: string[];
  };
  /* Optional opening scroller, sitting between the header and the first
     section. The page's first full-bleed moment.

     Every `Figure` here is a track, so a block is free to carry three or
     five images rather than one; a single image is just a track that
     doesn't overflow. Most blocks below still hold one, which is a gap in
     the material rather than in the layout. */
  hero?: Figure;
  sections: {
    title?: string;
    content: string[];
    figure?: Figure;
    /* An interactive block, rendered after the section's prose.
       Named rather than passed as a node because this file is imported by
       the metadata and sitemap routes as well as the page. Keeping it
       serialisable data means a case study can carry a live artifact
       without dragging a client bundle into every route that reads a
       title. The page maps the name to a dynamic import. */
    artifact?: Artifact;
  }[];
};

/** The interactive blocks a case study can embed. */
export type Artifact = "wholana-decoder" | "storefront-carousel";

export const allProjects: Record<ProjectKeys, Project> = {
  instatus: {
    title: "Instatus",
    mark: "instatus",
    link: "instatus.com",
    intro:
      "Instatus is a status page product serving over 10 million visits per month. Customers include Sketch, T2, Harvard University, Siemens, and Yum! Brands. I joined as a full-stack engineer working across product design, frontend, backend, database, and AWS infrastructure, and I own the chat integrations: Slack shipped, Microsoft Teams in progress.",
    role: "Full-stack engineer",
    period: "2024 – Present",
    stats: [
      { value: "10M+", label: "Monthly visits, product-wide" },
      { value: "2", label: "Chat integrations owned" },
    ],
    technologies: {
      backend: [
        "Node.js",
        "Postgres",
        "Prisma",
        "GraphQL",
        "Redis",
        "AWS",
        "AWS S3",
        "Docker",
        "Sentry",
      ],
      frontend: ["TypeScript", "Next.js", "React", "Figma"],
    },
    sections: [
      {
        title: "Context",
        content: [
          "Instatus is the status page product engineering teams use to communicate uptime and incidents to their customers. It serves over 10 million visits per month, with customers including Sketch, T2, Harvard University, Siemens, and Yum! Brands. I work across the full stack, with scope that touches product design, frontend, backend, database, and AWS cloud infrastructure.",
        ],
      },
      {
        title: "Owning the Slack integration",
        content: [
          "I oversaw the Instatus for Slack integration end to end, from Figma design through to shipped implementation. The rebuild added AI features for incident workflows and shipped a meaningful set of UX improvements on top of a redesigned surface.",
          "Owning the full slice meant making product calls on the design side, carrying them through to the integration code, and then making sure they held up under real customer use. Chat is where incident response actually happens, so the bar is that a responder never has to leave the channel to run the incident.",
        ],
      },
      {
        title: "Microsoft Teams",
        content: [
          "I am currently overseeing the Microsoft Teams integration, bringing the same incident workflows to the platform where a large share of enterprise customers already work.",
          "Teams is not a reskin of Slack. The app model, message surfaces, and permission story are different enough that the interesting work is deciding what to keep identical for consistency and what to rebuild to feel native. The Slack rebuild gave us a clear picture of which parts of the workflow actually carry weight, which is what the Teams version is built around.",
        ],
      },
      {
        title: "Reliability: uptime and incidents",
        content: [
          "I reworked core systems including uptime percentage calculations and incident handling. Customer trust stakes a lot on these numbers being right, so the goal was correctness, predictable behavior under load, and clear handling of edge cases in time-series aggregation.",
        ],
      },
      {
        title: "On-call, monitoring, and templating",
        content: [
          "Shipped improvements across on-call scheduling, monitoring, incident channel creation, and templating. The work spans GraphQL APIs, Redis-backed caching layers, and AWS S3 for media and asset storage.",
        ],
      },
      {
        title: "Testing and reliability patterns",
        content: [
          "Established Prisma-based unit, integration, and end-to-end testing patterns across the codebase, and contributed to backend reliability and performance optimization. The throughline is making changes safe to ship in a product where every visible inconsistency erodes trust.",
        ],
      },
    ],
  },
  wholana: {
    title: "Wholana",
    mark: "wholana",
    link: "wholana.com",
    intro:
      "Wholana is an AI content system for TikTok. It ingests 1k creators every night, decodes every high performer into a shared craft and subject vocabulary, turning the research into scripts. I designed and built it: the product, the pipeline, the infrastructure it runs on, and the brand.",
    role: "Solo: design and engineering",
    period: "2026 – Present",
    stats: [
      { value: "50K+", label: "Videos in the corpus" },
      { value: "1000+", label: "Creators swept nightly" },
      { value: "$100", label: "MRR, from 20 paying users" },
    ],
    technologies: {
      backend: [
        "Node.js",
        "Express",
        "Postgres",
        "pgvector",
        "Prisma",
        "Temporal",
        "Rocicorp Zero",
        "Yjs",
        "Hocuspocus",
        "Better Auth",
        "Polar",
        "MCP",
        "Vercel AI SDK",
        "OpenRouter",
        "Apify",
        "Cloudflare R2",
        "Docker",
        "Dokploy",
        "Hetzner",
        "Sentry",
        "PostHog",
      ],
      frontend: [
        "TypeScript",
        "Next.js",
        "React",
        "Tailwind",
        "Radix UI",
        "shadcn/ui",
        "Motion",
        "TanStack Query",
        "Tiptap",
        "Figma",
      ],
    },
    hero: {
      images: [
        {
          src: wholanaExplore,
          alt: "The Wholana Explore feed: a row of saved lenses across the top, an active filter set reading hook archetype is any of “Relatable observation, Relatable s…”, shareability driver is any of “Humor tag friend, Relatable mirror”, views is over 100K and likes is over 1%, then 100 videos sorted by outlier score as a grid of Arabic TikTok thumbnails, each card carrying views, likes, comments, saves and its outlier multiple",
        },
        {
          src: wholanaCraft,
          alt: "A video page: the TikTok clip playing on the left, the creator's stats across the top (319.7K views, 18.7K likes, 21.3× outlier), and the Craft panel reading the video beat by beat, opening with the hook quoted in translation at 0:00 to 0:03, labelled a relatable observation with high specificity, and the video's own comments listed down the right",
        },
        {
          src: wholanaDashboard,
          alt: "The personal dashboard: a results row for hit rate, views earned, posts in the last 30 days and followers gained, then “Where your videos win and lose” scoring stop-scroll, retention, stakes and engagement with engagement flagged as a weak spot, a production pipeline count from swipe ideas to posted, and a follower growth chart since joining",
        },
      ],
      caption: "The Explore feed, a decoded video, and the personal dashboard.",
    },
    sections: [
      {
        title: "Context",
        content: [
          "Wholana helps Egyptian and MENA creators study what is working on TikTok and make their own version of it. Every video is read through three axes: Craft (how the video works), Subject (what it is about), and Creator equity (who is behind it). The point is legibility rather than data volume, so the user closes a video page able to say exactly why it hit.",
          "The corpus is Arabic-first, in Egyptian dialect. Wholana is a monorepo of 7 first-party deployables that run as 11 services in production around one Postgres, plus the marketing site and the brand.",
        ],
      },
      {
        title: "Decoding a video",
        content: [
          "The craft pass is the technical heart of the product. Ingest ends when a video's subtitles are downloaded and stored; everything after that is enrichment. The pass reads the transcript, plus the video's own outlier comments as audience ground truth, and returns a structured decomposition across five axes: hook archetype, narrative structure, stake type, shareability driver, and format. Those five are a closed vocabulary.",
          "Getting structured output reliably out of a model, over messy real-world Arabic speech, is the hard part. The prompt is primed with the creator's own knowledge subgraph so it knows who the recurring characters are.",
          "The ranking signal sits underneath all of it: a video's outlier score is its views over its own creator's median, so a large account posting normally never reads as a breakout, and a small account with a real hit does.",
        ],
        artifact: "wholana-decoder",
      },
      {
        title: "The product surface",
        content: [
          "Explore is the home surface: natural-language search over the corpus, a filter builder across subject, craft, creator and video metrics, sorting by outlier score, and saved filter sets called lens tabs. Around it sit the swipe file (collections of saved videos with notes), Scripts, creator profiles with a craft signature, the five craft vocabularies as browsable libraries, a personal dashboard that benchmarks the user's own account against their niche, and Your Videos, which grades their posted work and loops them back into research.",
          "Ask Wholana is the conversational layer over all of it: an in-app agent that searches videos, pulls a video's craft analysis, and can drive the Explore filters on the user's behalf.",
        ],
        figure: {
          images: [
            {
              src: wholanaFilterBuilder,
              alt: "The filter builder open over the Explore feed: a searchable menu grouped into Subject, Creator, Craft and Stats, with the five craft vocabularies listed as hook archetype, narrative structure, stake type, shareability driver and video format, and a count badge on each facet already filtered",
            },
            {
              src: wholanaSwipeFile,
              alt: "The swipe file: a column of collections down the left including Inbox, “winning hooks” and “Built to be shared” with counts, the 126 saved videos in the middle, and a saved video on the right showing its views, likes, comments and shares over a notes field and a “Turn into script” button",
            },
            {
              src: wholanaCreator,
              alt: "A creator profile for Shimaa Sharaf: 1.5M followers up 36.4%, 46M likes, 44K median views described as 0.6× the reader's own baseline, 197 tracked videos, then a Hits row of her best performing videos with outlier multiples from 36.2× down to 16.2×",
            },
            {
              src: wholanaSubjects,
              alt: "The Subjects index: 77 reviewed topics grouped into cards for Home & Lifestyle, Food & Drink, Beauty & Grooming, Comedy & Skits and Relationships & Family, each row carrying a trend multiple, a heat count and a video count",
            },
            {
              src: wholanaYourVideos,
              alt: "The Your Videos page: a 26% hit rate against a 77.2K baseline, a posting cadence heatmap marking each day a hit, a watch or a miss, and a “Your craft” panel reading the user's own pattern back as a sentence, with hook archetypes ranked by hit rate underneath",
            },
            {
              src: wholanaAsk,
              alt: "The Ask Wholana panel open beside the feed, offering starting searches such as “Beauty videos with personal-identity stakes”, “Comment-bait sorted by engagement” and “Lifestyle videos punching above their size”",
            },
          ],
          caption:
            "The filter builder, the swipe file, a creator profile, the subject index, Your Videos, and Ask Wholana.",
        },
      },
      {
        title: "Ingestion as durable workflows",
        content: [
          "The nightly sweep is a fan-out then fan-in pipeline: scrape and ingest each record in one transaction, fan out per video for comments, subtitles and the enrichment chain, then fan in across the whole corpus for entity resolution, rollups, a freshness watermark (Unstable metrics), and notifications.",
          "All of it runs on Temporal. Workflow code is deterministic and every piece of I/O is an activity, which buys two things that mattered more than they sound: a deploy in the middle of a sweep resumes rather than losing the night, and exactly-one-sweep-at-a-time is enforced by the workflow engine instead of a global boolean that only holds within one process.",
          "The same machinery runs the paths a user waits on. Onboarding and shared links are multiplexed by batcher workflows that hold a short window so near-simultaneous requests become one scrape run, then process the bundle newest-first, so a new user gets a tailored reveal in minutes while the rest of their backlog fills in behind it.",
        ],
        figure: {
          images: [
            {
              src: wholanaNotifications,
              alt: "The notifications panel open over the feed, listing workspace invitations alongside “41 new videos in your niches”, broken down as Storytelling 14, Creator & Internet Culture 10, Fitness & Health 8 and 3 more",
            },
          ],
          caption: "What a finished sweep looks like from the reader's side.",
        },
      },
      {
        title: "Writing our own scraper",
        content: [
          "The pipeline started on a paid third-party actor (apify). It now runs mostly on a scraper I wrote, deployed as its own service that knows nothing about Wholana: usernames in over HTTP, generic posts and authors out, no database and no domain types. Comments are the one path still on the paid provider, which the design accounts for rather than hides.",
          "Both live behind one seam. A Scraper knows how to start a run and how to fetch the binaries it produced, and no module, route or type is allowed to bake a vendor's name into its identifiers, so swapping providers touches the adapter and nothing downstream.",
          "My own scraper goes out on stock HTTP: no proxy, no browser, no challenge solver, and zod as its only runtime dependency. The last full sweep measured 860 clean responses out of 860 handles. A canary endpoint watches for the day the upstream's bot cohort changes underneath us, and the answer if it ever does is to move egress rather than to start bolting on a solver.",
        ],
      },
      {
        title: "Local-first reads",
        content: [
          "The dashboard's reads and writes use Rocicorp Zero. The browser holds a replicated subset of the database, queries stay live rather than being re-fetched, and writes apply optimistically on the client before landing authoritatively in a Postgres transaction. Read permissions are resolved in exactly one place, server-side, so a client cannot ask for rows it should not see by rewriting a query.",
          "The cost is real and worth stating: a schema change becomes a four-step lockstep of migration, replication publication, replica resync and client deploy. I paid for that with a written runbook and a check in the build that fails when the publication drifts from the schema, because the failure mode is a table that silently stops syncing rather than an error anybody sees.",
        ],
      },
      {
        title: "Real-time collaboration",
        content: [
          "Scripts are collaborative: two people in the same draft, with live cursors. That runs on a small standalone Hocuspocus server, Yjs documents over WebSockets, deployed on its own so the collaboration path does not carry the weight of the ingestion backend.",
          "The constraint I set was that presence must never touch Postgres. Cursors and the workspace facepile ride the Yjs awareness protocol and live only in memory; the only database writes are debounced document snapshots, which is strictly less load than the autosave it replaced. A script's body is deliberately stored twice: the Yjs binary as the rich source of truth, and a flattened text projection that lists, search, the MCP tools and the WhatsApp bot all keep reading unchanged. None of them had to learn what a CRDT is.",
        ],
        figure: {
          images: [
            {
              src: wholanaScript,
              alt: "A script open in the editor with two other members' cursors and name flags sitting live in the text, the draft reading “How I grew my account from 2,000 followers to 65,000 followers”, a word count and spoken runtime under it, and a Script check panel on the right grading the draft's subject, structure and stakes",
            },
            {
              src: wholanaScriptsBoard,
              alt: "The Scripts board: counts for drafts, ready to shoot, posted and average references per script, then a grid of draft cards each showing its opening hook, its status, its reference count and when it was last touched",
            },
          ],
          caption:
            "A shared draft with two other members' cursors in it, and the Scripts board.",
        },
      },
      {
        title: "Search over Arabic speech",
        content: [
          "Search is hybrid: vector similarity over transcript embeddings combined with full-text search, so a query in plain Egyptian Arabic finds the video even when it shares no keyword with the caption. The embeddings live in Postgres with pgvector, stored as half-precision vectors behind an HNSW index.",
          "They are also what forced the database move. A gigabyte of embeddings did not fit the managed free tier's storage cap and the index could not be built there at all, so the system of record moved to Postgres I run. Rebuilding that index in a container taught me more about shared memory limits than I wanted to know.",
        ],
      },
      {
        title: "A knowledge graph per creator",
        content: [
          "Alongside the craft pass, a second pass builds a knowledge graph per creator: nodes for the people, places, organizations and moments a creator keeps returning to, and edges that carry the facts connecting them. Facts live on edges, never on nodes, so a claim always has both of its ends.",
          "It has four verbs and they are the vocabulary the code uses. Match resolves a surface form to an existing node. Mint creates a new one. Dream settles the parked pile of unresolved nodes on its own schedule. Prime feeds a creator's subgraph back in as grounding, which is what makes the craft pass read a video the way someone who watches that creator would.",
        ],
      },
      {
        title: "Shipping an MCP server",
        content: [
          "Wholana exposes its corpus to ChatGPT, Claude and other MCP clients as read tools plus one mutation, over two transports: stdio locally, and streamable HTTP with a bearer token remotely. The user asks a question in their own assistant and it searches the corpus, reads back why a video worked, and saves results into their swipe file.",
          "It is gated to the paid tiers, and the gate is enforced at both ends: the app mints the token, the backend validates it, and both read the same entitlement predicate from a shared package rather than each keeping a copy. That is written up as an architecture decision record, because two copies of a billing rule is exactly how a customer ends up with access they did not pay for.",
        ],
      },
      {
        title: "Owning the infrastructure",
        content: [
          "The stack started on railway but that was too expensive. I moved production onto two Hetzner boxes: Postgres with pgvector, PgBouncer, the sync engine, the ingestion API, the MCP server, Temporal and the app itself, all Docker Swarm services managed through Dokploy, behind a single Traefik ingress with Cloudflare in front. Images are built in CI and pushed to a private registry on the box rather than built on it.",
          "The cutover happened in one night: a final dump restored, the replica re-replicated, and a scripted DNS flip. The rollback path was written down before the flip rather than improvised after it, which is the only reason a one-person migration of a live system is a reasonable thing to attempt.",
          "What runs on top of it is the unglamorous half: nightly database backups to R2, a watchdog cron that alerts by email and to Sentry if a night's ingestion never happened, per-pull-request preview environments on their own subdomains, and a habit of diffing stored configuration against what the running services actually have, which is a lesson a six-hour outage taught me rather than a practice I arrived with.",
        ],
      },
      {
        title: "Workspaces, auth and billing",
        content: [
          "Billing went in early, and it went in for a reason: the last product I founded reached 40,000 unique visitors with nowhere to charge any of them, and no amount of pipeline engineering was going to fix that after the fact. Wholana is properly multi-tenant: a personal workspace per user, a switcher, invitations, and seat-based team billing through Polar with three live plans. Collections, lenses and scripts belong to the workspace rather than to a person, so research done by one member compounds for everyone else instead of being trapped in their account.",
          "Auth runs on Better Auth with Google OAuth and One Tap. The session cookie is scoped across subdomains on purpose: it is what lets the app's session authorise the sync engine on a different host, which is the sort of detail that is invisible when it works and a login loop when it does not.",
        ],
        figure: {
          images: [
            {
              src: wholanaMembers,
              alt: "The workspace members screen: a header reading “6 members · $120/mo”, an invite field with a role selector, and the member list with one owner and five members, under a line explaining that each invite adds $20 a month prorated from the day they accept",
            },
          ],
          caption:
            "Seats are the billing unit, so the invite screen quotes the bill. This is my own workspace on the team plan, not a customer: the real revenue is on the row above, and a screenshot of a six-seat team at $120 a month would be describing one that does not exist.",
        },
      },
      {
        title: "The product in WhatsApp",
        content: [
          "Users live in WhatsApp, so part of the product does too. Send the bot a TikTok link and it is ingested, decoded, and filed into an inbox collection for triage later. Send a typed idea or a voice note, in Arabic or English, and it comes back as a draft script.",
          "Notifications ride the same producers as the in-app ones and are dispatched best-effort, so a WhatsApp failure can never take down the pipeline that generated the notification.",
        ],
      },
      {
        title: "Keeping a solo codebase honest",
        content: [
          "Nobody reviews my pull requests, so the review has to be mechanical. The monorepo is split into bounded contexts, each with its own context document and decision records, and a written glossary that code, file names and discussion are all held to. Decisions two contexts share are recorded once at the root instead of twice.",
          "The rest is gates: dead-code detection, dependency version drift, an enforced module layering, and type coverage held above 98.9% in the app and 99.9% in the backend. New package versions have to age for a week before an install will take them, so a compromised release has time to be caught before it reaches my machine. None of this is impressive on its own. Together it is what lets one person keep moving fast on a system this size without breaking it quietly.",
        ],
      },
      {
        title: "Brand and editorial direction",
        content: [
          "I designed the marketing site and the in-app brand: confident typography, tabular numbers, calm density, one accent colour doing real work rather than decorating everything. It should read as built in Cairo rather than translated in from San Francisco, and that shows up in the copy and the defaults instead of in tokenistic flags.",
        ],
      },
      {
        title: "Shipping in public",
        content: [
          "Wholana ships in public. Fourteen releases since March 2026 are written up on the changelog at wholana.com/changelog, which is the single best place to watch the work move.",
        ],
      },
    ],
  },
  "tiktok-news-network": {
    title: "TikTok News Network",
    mark: "tnn",
    link: "tiktoknewsnetwork.com",
    intro:
      "TNN is a nightly satirical news broadcast about the Egyptian internet. I founded it, host it, and built the site it lives on. It runs on Wholana's data pipeline, and has grown to 20M+ views, 72K+ followers, and 260 stories covered across five recurring formats.",
    role: "Founder, anchor and engineer",
    period: "2026 – Present",
    stats: [
      { value: "20M+", label: "Views" },
      { value: "72K+", label: "Followers" },
      { value: "260", label: "Stories covered" },
    ],
    technologies: {
      backend: ["Node.js", "Payload CMS", "Postgres", "Wholana API"],
      frontend: ["TypeScript", "Next.js", "React", "Tailwind", "Figma"],
    },
    hero: {
      images: [
        {
          src: tnnPreview,
          alt: "The TNN home page: a red breaking-news bar reading “TNN is live on TikTok, new episode every night”, the headline “The Cure for Brain Rot” with “Brain Rot” struck through in yellow highlighter, and a row of stats for on-air date, stories covered, and straight faces broken",
        },
        {
          src: tnnBriefings,
          alt: "The “This week's briefings” row on the TNN home page: six episode cards numbered EP. 061 down to EP. 055, each with a dated header, a black-and-white still from the broadcast carrying a lower-third caption, and an episode title such as “TNN61: The Match In China”",
        },
        {
          src: tnnBureaus,
          alt: "The Bureaus section, “Five desks. One network.”: a flagship panel for The Nightly showing cadence, beat and an ON AIR status, above a four-column row for The Debates, Field Reports, TNN Stocks and On the Record, each with its own status chip",
        },
      ],
      caption: "The front page, the week's briefings, and the five nightly desks.",
    },
    sections: [
      {
        title: "Context",
        content: [
          "TNN treats Egyptian TikTok culture with the deadpan gravitas of a broadcast news desk. The tagline is “Where high-stakes journalism meets low-stakes internet beef.” It airs nightly at 21:00 Cairo time, and I founded it, anchor it, and built the platform behind it.",
          "It started in March 2026 with no studio and no crew. It has since grown into five recurring formats (The Nightly, The Debates, Field Reports, TNN Stocks, and On the Record) with a team of correspondents and co-anchors, 260 stories covered, 20M+ views, and 72K+ followers.",
        ],
      },
      {
        title: "The distribution problem, solved with software",
        content: [
          "A nightly show is a nightly deadline. The hard constraint is not production, it is knowing what actually happened on the Egyptian internet that day before the rest of the internet does, every single day, without spending the whole day scrolling.",
          "TNN runs on Wholana, the research platform I built. It aggregates posts from Egypt's 900+ most popular TikTok creators and lets me filter by engagement and date window, so the show's rundown is a query rather than a scroll. Curation becomes a data problem with a repeatable answer, which is the only reason a nightly cadence is sustainable solo.",
        ],
        figure: {
          images: [
            {
              src: tnnWholana,
              alt: "The “Engineering behind TNN: Wholana” section, pairing a research, signals and output summary with a screenshot of the Wholana explore feed: a sidebar of research and creator tools beside a grid of TikTok posts, each showing views, likes, comments, shares and an outlier multiplier",
            },
          ],
          caption:
            "The site says the quiet part out loud: the show's rundown is a filtered feed, not a scroll.",
        },
      },
      {
        title: "The website",
        content: [
          "The site is the show's archive and its front door: every episode gets a written briefing, so the coverage is searchable and linkable long after the video scrolls past. It is built on Next.js with Payload as the CMS, which matters because the editorial workflow has to be fast enough to publish a recap right after air without a deploy.",
          "The design carries the same joke as the show. Broadcast typography, a rigid grid, stat lines and desk names presented straight. The visual seriousness is what makes the subject matter funny, so the design had to commit fully rather than wink.",
        ],
        figure: {
          images: [
            {
              src: tnnArchive,
              alt: "The TNN articles index: an ARCHIVE bar reading “full text articles for shipped broadcasts”, the heading “Article briefings”, and an archive-file panel headed “Every published briefing, latest first” with a count of 54 briefings on file",
            },
          ],
          caption: "Every episode gets a written briefing, so the coverage stays searchable.",
        },
      },
      {
        title: "Why it matters as engineering work",
        content: [
          "TNN is the proof that Wholana's pipeline works. Building a research tool and then betting a daily publishing obligation on it is a much harder test than a demo: if the ingestion, scoring, or filtering is wrong, the show is wrong that night and the audience notices.",
          "Running both sides also feeds the product. Every friction point in the nightly rundown becomes a Wholana feature request from the most demanding possible user, which is a fast and honest loop.",
        ],
      },
    ],
  },
  "loom-cairo": {
    title: "Loom Cairo",
    mark: "loom",
    intro:
      "Loom Cairo, later rebranded as Univyr, was a search engine for local fashion that aggregated over 300 Egyptian brand websites into a single platform. Operated 2023 to 2025, reached 70+ brand partnerships and 40,000+ unique visitors at its peak, and was accepted into AUC Venture Lab. It shut down because it never had a place to charge anybody, which is the part of it worth reading.",
    role: "Founder: solo design and engineering",
    period: "2023 – 2025",
    stats: [
      { value: "40,000+", label: "Unique visitors, post-TechTalk peak" },
      { value: "300+", label: "Brand sites aggregated" },
      { value: "70+", label: "Brand partnerships" },
    ],
    technologies: {
      backend: ["Python", "Scrapy", "Postgres", "Prisma", "ZenStack", "Redis", "Better Auth", "AWS S3"],
      frontend: ["TypeScript", "Next.js", "React", "Tailwind", "Radix UI", "Motion", "TanStack Query", "Figma"],
    },
    hero: {
      images: [
        {
          src: loomPreview,
          alt: "Loom Cairo mobile landing screens: “Egypt's first fashion search engine” over a tiled brand pattern, a “300+ local brands in one place” panel, and a shop-by-gender section",
        },
        {
          src: loomBrands,
          alt: "Four Loom Cairo brand pages (Horra, Antikka, Cielo and Illusion) each with a hero shot, a Follow button, an about blurb, previous/next brand controls, and the brand's item grid below",
        },
        {
          src: loomWebApp,
          alt: "Loom Cairo app screens: an A-to-Z All Brands directory, a T-shirts category filtered to 547 items by colour and sort, search autocomplete for “blue t-shirts”, and a browsing history list with prices",
        },
      ],
      caption: "The search engine, a brand page, and the item grid.",
    },
    sections: [
      {
        title: "Context",
        content: [
          "The Egyptian local fashion scene exploded over the last several years, but buying anything still meant clicking through dozens of brand sites. There was no unified place to discover and filter local fashion. I founded Loom Cairo to solve that, then rebranded as Univyr.",
          "Operated 2023 to 2025. Grew to 70+ brand partnerships and, at its peak, 40,000+ unique visitors. Accepted into AUC Venture Lab (V-Lab). I architected and shipped the full system solo.",
        ],
      },
      {
        title: "The Problem",
        content: [
          "The Egyptian Local fashion scene has seen a meteoric rise in recent years. However,  users face the cumbersome process of browsing multiple brand websites just to find a single item like a shirt or crewneck. There is currently no unified platform that offers a seamless shopping experience for discovering new fashion pieces, leaving a significant gap in this expanding market.",
        ],
      },
      {
        title: "Web Scraping",
        content: [
          "There is a huge variety of brand websites out there: shopify, sllr, elementor, zammit... etc. ",
          "I created a web scraper that works with all those different types of websites regardless of their differences. I used bs4 and selenium to do this. This scraper needs to handle a variety of scenarios such as websites that are entirely javascript rendered and others that are server-rendered and return HTML with a simple get request.",
          "To manage this complexity, I fell back to the principles of OOP. I broke down the problem to its simplest parts. I created a class that’s only responsible for an item’s data given its link and a brand’s dictionary (object). This class had to do exception handling to handle the various things that could go wrong and log them. The second part of the problem is discovering the items that exist for each website and interacting with the database.",
          "This taught me a lot about exception handling, abstract methods, class methods, custom exceptions, context manager.",
          "I also read Clean Code during this period which was immensely helpful. I picked a few things such as function cohesion, coupling, abstraction levels, private methods, and the value of unit tests... etc.",
        ],
      },
      {
        title: "Labelling Algorithm & Data Analysis",
        content: [
          "To enable the filters and improved search, I created an algorithm that labels the items. The loom database is quite large: 20,000 items, 92,000 images, and 8,059 distinct raw size strings, because every brand writes its sizes its own way. That is the catalogue Loom kept live across its partner brands, not what a crawl moves; after the Univyr rebuild below, a single run reads far more than it retains. I started out with cleaning and preprocessing the data such as fixing spelling inconsistencies, such as blue and bluee. Then, I did data normalization by grouping together synonyms of colors such sky and blue into a single parent color. All of it collapses down to 19 canonical colours, 19 materials and 48 categories, which is what makes a filter panel possible at all.",
          "Based on the uncovered synonyms, inconsistencies, and data gathered from the original websites, I created a labeler that works really well on new items from new brands. It enables very rich filters and search all automatically.",
          "Try to go on other platforms and search for White Shirt and see which one has the most relevant results!!",
        ],
      },
      {
        title: "Database Schema Design and Optimization",
        content: [
          "I used SQLite to create my database. It started with the database schema. I created a database that was performant and scalable. To achieve this, I ensured that my database was normalized by using lookup tables for values that are repeated such as brands (this way i could have a single source of truth) and relating the various things using many-to-many relationships.",
          "I also used constraints to ensure data integrity at the database level. I also implemented triggers to ensure data is synced across related tables. Indices were used to speed up the performance of certain queries by orders of magnitude. A de-normalized view was created to simplify interaction with the database in the API.",
        ],
        figure: {
          images: [{ src: loomDb, alt: "Loom Cairo database schema" }],
          caption:
            "The normalised schema: lookup tables for repeated values, many-to-many joins, and a de-normalised view the API reads from.",
        },
      },
      {
        title: "API",
        content: [
          "I created the API with flask. There are various endpoints. The search endpoint parses out words to detect if filters exist for those words otherwise it does a Full-Text Search. Other endpoints fetch metadata that’s needed for filters. The SQL queries are quite optimized as I have deep knowledge of the database schema, using the proper indices (based on B Trees).",
          "The explain query plan and timer come in really handy for optimization in those scenarios. I was able to get most queries down to sub 50ms response, especially the ones that do a lot of heavy lifting.",
        ],
        figure: {
          images: [
            {
              src: loomAPI,
              alt: "A spreadsheet working out the search parser's synonym rules: item synonyms (tshirt, t-shirt, tee) and colour patterns mapped to their replacements, with notes on which loops the query needs",
            },
          ],
        },
      },
      {
        title: "UX/UI Design with Figma",
        content: [
          "Because the majority of users will be on mobile, and it’s easier to add complexity rather than it is to simplify a complex thing. A mobile-first approach was the apparent way to go for design.",
          "I researched the patterns that users are used to. I picked the brand colors, typography, a typescale and created the main layouts. I also created a design system to ensure consistency of design throughout the app using figma components. The designs respected the rules of hierarchy, consistency, white space, contrast, alignment, and balance.",
        ],
      },
      {
        title: "React Web App",
        content: [
          "For the web app, I used React, vite, react-router, radix-ui, and vanilla CSS. I made use of CSS resets. global variables to ensure consistency of styles, and a typescale system. The website displays the items in a really unique way and has a bunch of cool stuff. Reusable components and pages of course, and a bunch of steps to ensure optimal performance. There’s search with autofill. History, likes, followed brands and a cart they can all keep track without the user having to login.",
          "This web app received praise from numerous users.",
        ],
      },
      {
        title: "Migration to Univyr",
        content: [
          "As scale grew, the early SQLite and Flask stack was rebuilt on Postgres with Prisma, ZenStack and Redis caching. ZenStack owns the schema language, which means row-level access policies are declared next to the models and enforced by one enhanced client rather than re-checked in every handler.",
          "Search was rebuilt rather than replaced. A weighted tsvector ranks the item name above its URL slug above its description, behind a GIN index, with two custom Postgres functions doing the unglamorous work: one masks the tokens the English stemmer would mangle, so tee and polos and half the brand names survive, and one mines the last path segment out of the product URL. In front of that sits an n-gram parser that slides 4-grams down to 1-grams across the query and matches each against five hand-built synonym dictionaries, largest first so the long matches win. It strips what it matched out of the query and only full-text-searches the leftovers, so “blue linen shirt from antikka” arrives at the database as four structured facets and an empty text search.",
          "The scraper was rewritten from BeautifulSoup and Selenium onto Scrapy, and stopped parsing HTML at all: most Egyptian brands run Shopify, so it reads the products JSON endpoint directly and validates every response against a Pydantic model, which turns a brand silently changing its catalog shape into a logged error attributed to that brand. Writes go in as bulk upserts through a four-stage dependency order inside one transaction per brand. Fifty requests run in parallel across brands but only one at a time per domain. A full run reads about 43,000 brand sites and lands roughly a million items and four million variants in about twenty minutes.",
          "Labelling stayed deterministic. The synonym dictionaries do the work, and the vision classifier that would replace them is still a prototype rather than a shipped system.",
          "Auth moved from a signed session cookie to Better Auth, with organisations for multi-tenancy, two-factor, Google One Tap, and Apple, Google and TikTok sign-in. The product was rebranded as Univyr and the surface was redesigned end to end in Figma.",
          "The storefront was rebuilt in Next.js. The block below is its product gallery, running here as it shipped.",
        ],
        artifact: "storefront-carousel",
      },
      /* This section used to be titled "Outcome" and was one line long: the
         three headline numbers restated, plus the operating dates. A company
         that ran for two years, rebuilt itself end to end, pitched for money
         and then stopped does not have an outcome consisting of its own stats
         row. The ending was the outcome, and it was missing. */
      {
        title: "Why it ended",
        content: [
          "In June 2025 I pitched Univyr at AUC Venture Lab: $150K for 10%. The traction slide was honest and, for its size, good: 4,700 monthly active users, 76% of them returning, 3.5 minutes of average retention against a market average of two. It did not close. The objection was not the growth and not the engineering; it was that nobody could point at the moment money changed hands. An aggregator that sends free traffic to brands it does not take a cut from has 300 suppliers and no customers.",
          "Then the demand showed up anyway. A TechTalk appearance put the product in front of a national audience and traffic went to 40,000+ unique visitors, roughly eight times the base it had been growing off. I do not have retention data from that window (the analytics went with the product), so I will not claim the spike stuck. What I can say is the thing that matters: the biggest audience Univyr ever had arrived after the raise had already failed, and there was still no toll booth for them to walk through. The investors had been right, and the traffic proved it rather than rescuing it.",
          "The mistake was not the scraper or the search or the two years. It was sequencing: I built a supply-side pipeline of real technical difficulty for a market where I had never established who pays, and by the time the answer mattered the only lever left was a raise. The rule I took out of it is unglamorous and I have applied it since: find the point where money changes hands before building the thing that depends on it. Wholana has seat billing in it, and paying users on it, because this one did not.",
        ],
      },
    ],
  },
  argonaut: {
    title: "Argonaut Website & CMS",
    mark: "argonaut",
    link: "argonaut.com.eg",
    intro:
      "Argonaut is an Egyptian EPC contractor and equipment trader working across HVAC, MEP, and fire safety. I designed and built their public site and the CMS behind it, so a non-technical team can run their own content without a developer in the loop.",
    role: "Design and engineering",
    period: "2025 – 2026",
    technologies: {
      backend: ["Node.js", "Postgres", "Prisma", "Better Auth", "AWS S3", "Resend", "Turborepo", "Vercel"],
      frontend: ["TypeScript", "Next.js", "React", "Tailwind", "Radix UI", "Motion", "Tiptap", "TanStack Query", "Figma"],
    },
    hero: {
      images: [
        {
          src: argoPreview,
          alt: "The Argonaut home page: a pill-shaped navigation bar over an aerial photograph of a tanker moored alongside a jetty, with the headline “HVAC, MEP & Fire Safety Specialists in Egypt” and a “Discover our services” button",
        },
        {
          src: argoArms,
          alt: "The “Business arms” section in two columns: Supply network under a TRADING label and Project delivery under a SERVICES label, each with a photograph and a scope strip, listing equipment supply, supplier coordination and commissioning on one side, and engineering, procurement and construction, and maintenance on the other",
        },
        {
          src: argoPartnerships,
          alt: "The strategic partnerships section, “Trading partners with industry leaders”: a row of manufacturer wordmarks including Halton, Gonair, Aironn, Trane, Red Shield, Volute, Gerpaas and Enposs, above a numbered capabilities list for energy optimization, cost savings and sustainability, and a featured-partner panel",
        },
      ],
      caption: "The home page, the two business arms, and the manufacturer partnerships.",
    },
    sections: [
      {
        title: "Context",
        content: [
          "Argonaut supplies equipment and delivers the engineering around it, across oil and gas, defense, healthcare, marine, and infrastructure, partnering with manufacturers including Halton, Trane, Aironn, and Gonair.",
          "The site had to do a specific job: convince a procurement engineer or consultant that this firm can be trusted with a large scope of work, then get them to a quote request quickly.",
        ],
      },
      {
        title: "SEO and information architecture",
        content: [
          "I led SEO strategy and information architecture for the site. The structure is built around how procurement buyers actually search, which is rarely by company name. They search by capability, by sector, and by manufacturer.",
          "So the IA is cut along those axes: expertise domains (electrical, fire safety, HVAC, mechanical, plumbing), capabilities (engineering and design, procurement, installation, maintenance, trading), and sectors served. That gives real content depth on the terms that matter while keeping every page a short path to a quote request.",
        ],
        figure: {
          images: [
            {
              src: argoExpertise,
              alt: "The Argonaut expertise page: a dark header reading “What we engineer” with a “Domains · 05” marker, above cards for Electrical, Fire Safety, HVAC, Mechanical and Plumbing, each carrying a one-line technical scope",
            },
          ],
          caption:
            "One axis of the IA as its own page: the five expertise domains, each addressable.",
        },
      },
      {
        title: "The CMS",
        content: [
          "The site is backed by a custom CMS the Argonaut team uses directly. Projects, articles, suppliers, clients, and the partner manufacturer list are all editable content rather than hardcoded pages, which is what keeps a portfolio site from going stale six months after launch.",
          "The design constraint was that the editors are engineers and commercial staff, not content people. Every field had to be obvious enough that nobody needs a manual, and structured enough that the published page stays on-brand no matter who filled it in.",
        ],
      },
      {
        title: "Design",
        content: [
          "Designed end to end in Figma. The visual language is deliberately restrained and technical: the audience is evaluating competence, not being sold to, so the site reads closer to a capability statement than to a brochure.",
        ],
      },
    ],
  },
  "argonaut-crm": {
    title: "Argonaut CRM",
    mark: "argonaut",
    intro:
      "An internal CRM for Argonaut that runs the quote and RFQ workflows behind multi-million-dollar pipelines: registrations, supplier and consultant tracking, and dashboards for quotation value across won, lost, and pending.",
    role: "Design and engineering",
    period: "2025",
    technologies: {
      backend: ["Node.js", "Postgres", "Prisma"],
      frontend: ["TypeScript", "Next.js", "React", "Tailwind", "Figma"],
    },
    sections: [
      {
        title: "Context",
        content: [
          "Argonaut's commercial process runs on quotes. An RFQ goes out to suppliers, equipment gets specced, a price comes back, and a number goes out to the client with consultants and contractors tracked as counterparties alongside it. Before the CRM, that lifecycle lived across spreadsheets and inboxes, which is workable right up until someone needs to answer a question about a quote nobody remembers.",
          "I designed and built the system the team now uses every day to run that pipeline.",
        ],
      },
      {
        title: "Modeling a noisy, relational process",
        content: [
          "The core design problem is that quote data is inherently relational and inherently messy. Many parties touch a single quote over its life: the client, one or more suppliers, a consultant, an internal owner. Any of them can change mid-flight, and the same supplier shows up across hundreds of unrelated quotes.",
          "Modeling that properly in the database is the easy half. The hard half is making it legible in the interface without burying an operator in a hundred fields. The resolution was to make the quote the spine and treat every other party as a relationship hung off it, surfaced only at the point in the flow where it becomes relevant.",
        ],
      },
      {
        title: "Registrations and supplier tracking",
        content: [
          "In this industry, being registered with a client and having a supplier relationship approved are gates that sit upstream of any quote. The CRM tracks both as first-class records, so the team can see which opportunities are actually reachable rather than discovering a blocker after the specification work is done.",
        ],
      },
      {
        title: "Pipeline dashboards",
        content: [
          "Dashboards aggregate quotation value across won, lost, and pending. The metric that matters to management is not the count of quotes but the value distribution and where it stalls, so the reporting is built as a projection over the quote lifecycle rather than a set of manually maintained totals.",
        ],
      },
    ],
  },
  argotemp: {
    title: "Argotemp",
    mark: "argotemp",
    intro:
      "Argotemp is an equipment rental and maintenance operations platform. I designed and built the end-to-end system: rental availability, maintenance state machines, monthly invoicing, and job extensions.",
    role: "Design and engineering",
    period: "2025",
    technologies: {
      backend: ["Node.js", "Neon Postgres", "Prisma", "Server Actions", "Vercel Cron", "JWT", "bcrypt"],
      frontend: ["TypeScript", "Next.js", "React", "Tailwind", "Radix UI", "TanStack Query", "Recharts"],
    },
    sections: [
      {
        title: "Context",
        content: [
          "Argotemp runs equipment rentals and the maintenance that comes with them. The operations team needs to know what is out, what is coming back, what is broken, and what to bill, all without a fragile spreadsheet seam between any of those questions.",
        ],
      },
      {
        title: "Operations and state machines",
        content: [
          "A unit is a small state machine with three states: available, hired, in maintenance. A rental is not. Rentals have no status column at all. A job is an append-only linked list, where each row points at the one it superseded and two booleans say whether it has been retired and whether it has a successor. Renewing a job creates a new row carrying the same job number, client, location and attached units, starting exactly where the old one ended, and retires its predecessor in the same transaction. Nothing is ever mutated in place, so the whole rental history stays readable back to the first hire.",
          "The two machines have to agree, because the expensive failure is a unit sitting in the workshop that the system still thinks is rentable. Ending a job, and ending a maintenance record, are each a single transaction that closes the record and returns the unit to available in the same commit. A nightly job sweeps for rentals whose end date has passed, retires them, and frees their units, so the reconciliation happens eagerly on every transition and lazily once a day as a backstop.",
        ],
      },
      {
        title: "Billing lifecycle",
        content: [
          "Invoices hang off the rental as first-class records rather than a parallel spreadsheet, each carrying its expected collection date beside its actual one, so how late the money arrives is a query rather than a memory. Rental duration is derived from the job's own dates instead of being stored, which means an extension or a renewal cannot leave a stale number behind it.",
        ],
      },
    ],
  },
  "little-lads": {
    title: "Little Lads",
    mark: "little-lads",
    link: "littleladseg.com",
    intro:
      "Little Lads is a growing fashion brand focused on boys’ apparel. I rebuilt their Shopify storefront (navigation, landing page, and a set of custom Liquid components) to lift engagement and conversion.",
    role: "Design and front-end",
    period: "2023",
    technologies: {
      backend: [],
      frontend: ["Figma", "HTML/CSS", "JavaScript", "Shopify Liquid"],
    },
    hero: {
      images: [
        {
          src: ladsPreview,
          alt: "The rebuilt Little Lads storefront: a hero of boys in striped polos and shorts, a horizontally scrolling Best Sellers row with prices in EGP, a “Made To Last” brand statement, and a Shop by Category grid",
        },
        {
          src: ladsNavigation,
          alt: "The Little Lads mega menu open under Shop, listing Shop All, T-Shirts & Polos, Shirts, Pants and Shorts beside a photo tile for each category, with the rich footer behind it",
        },
        {
          src: ladsTestimonials,
          alt: "The custom Customer Reviews marquee, a looping row of quote cards from named customers praising fit, fabric and price",
        },
      ],
      caption: "The landing page, the mega menu, and the reviews marquee.",
    },
    sections: [
      {
        title: "The Problem",
        content: [
          "LittleLads is a growing fashion brand focused on boys’ apparel. They were facing several issues with their website:",
          "Navigation was cluttered and not intuitive, causing users to struggle when browsing products.",
          "The site lacked interactivity, resulting in low engagement rates.",
          "Limited mobile optimization, negatively impacting the user experience on mobile devices.",
          "The product pages were lacking essential features like product videos and customer testimonials, which are key drivers for conversion",
          "I was tasked with revitalizing their Shopify website to improve brand equity, increase engagement and boost conversions.",
        ],
        figure: {
          images: [
            {
              src: ladsProblem,
              alt: "The old Little Lads homepage printed out and marked up by hand, with circles around the header, hero, product cards and footer and handwritten notes on typography, hierarchy and navigation",
            },
          ],
        },
      },
      {
        title: "Figma Design",
        content: [
          "I started by analyzing the old website and annotating any problems that popped out to me. Then, I proceeded to brainstorm the possibilities for the landing page. The goal was to take the user on a journey that will elicit a specific response in the user so that they take a desired action at the end.",
          "By social proof (testimonials, best sellers), building a narrative (behind the name), and showing the quality of the items the users will ultimately start to trust the brand.",
          "Also, navigation is very important and it was shown in various AB tests to increase traffic by a substantial amount. Thus, I designed a mega menu and created a rich footer with links to the various categories and items.",
        ],
      },
      {
        title: "Shopify Components",
        content: [
          "Since certain components were either locked behind expensive themes, not available in the exact styles I was going for, or not available at all, I created custom components. I created a customer reviews marquee, autoplaying video, mega menu, and hotspots component. Shopify Liquid uses plain HTML, CSS, and JavaScript and it has an object to expose certain variables so that the Shopify admin can interface with the component without having to change the source code, making it much more maintainable.",
        ],
      },
    ],
  },
  alunaut: {
    title: "Alunaut",
    mark: "alunaut",
    link: "alunaut.com.eg",
    intro:
      "Alunaut is an Egyptian aluminium and facade contractor. I designed and built the two internal apps their sites and their technical office run on: a daily site report filed from a phone in Arabic, signed on the phone by both the engineer and the manager, and a submittals and takeoff tracker for the drawings office behind it.",
    role: "Design and engineering",
    period: "2026",
    stats: [
      { value: "22", label: "Trade categories per report" },
      { value: "124", label: "End-to-end tests, WebKit only" },
    ],
    technologies: {
      backend: [
        "Node.js",
        "Postgres",
        "Supabase",
        "Prisma",
        "Better Auth",
        "AWS S3",
        "Resend",
        "Turborepo",
        "Vercel",
      ],
      frontend: [
        "TypeScript",
        "Next.js",
        "React",
        "Tailwind",
        "Radix UI",
        "shadcn/ui",
        "TanStack Query",
        "TanStack Table",
        "React Hook Form",
        "Zod",
        "React PDF",
        "Playwright",
        "Vitest",
      ],
    },
    sections: [
      {
        title: "Context",
        content: [
          "Alunaut fabricate and install cladding, louvers, glass, sheet metal, marble and insulation. Two groups of people needed software and they needed different software. Site engineers file the day's record standing on a site, on a phone, in Arabic. The technical office tracks shop drawings out to the consultant and back, material takeoffs against the bill of quantities, and fabrication orders, at a desk, in English.",
          "So it is two apps in one monorepo, sharing conventions and sharing nothing else. Separate databases, separate deployments, separate session cookies. The field app is the finished half and the one this case study is mostly about.",
        ],
      },
      {
        title: "Building for one phone, in one language, in one direction",
        content: [
          "The field app is Arabic, right to left, and mobile first, and none of those are a theme applied at the end. Arabic pluralisation is a grammar problem before it is a formatting one: one and two have their own words, three to ten take the plural, and eleven upward returns to the singular. Thirty-six lines handle it, because a list header reading “3 تقرير” is visibly broken to the site managers these screens are for.",
          "Numerals inside that Arabic copy are Latin on purpose, because that is what site paperwork and the printed reports already use. Every date formatter is pinned to UTC, because a report's date is a calendar day stored at UTC midnight and a device-zone formatter renders the day before for anyone west of the line. The PDF gets a hyphenation callback that refuses to break words at all, because breaking an Arabic word mid-word destroys the letter joining and the output stops being readable.",
        ],
      },
      {
        title: "A report is a document, not a row",
        content: [
          "Every report gets a human serial, allocated once when it is created and never rewritten, so editing a draft's date does not renumber it. A correction gets a revision suffix rather than a new number: the base serial stays the handle for that day and the suffix says which take it is.",
          "Submitting renders the Arabic A4 PDF, puts it in S3, and emails it to management with the bytes already in hand rather than reading them back out of the bucket. A failed email is not fatal and a failed PDF is. The send is idempotent against the PDF's version stamp, so a retried submit never double-sends but a genuinely new version always goes out. That stamp is written only when the upload succeeded, which makes “this report has a downloadable PDF” exactly one null check instead of a guess.",
        ],
      },
      {
        title: "One report per project per day, enforced in Postgres",
        content: [
          "The client checks for an existing report before letting an engineer start a new one, and routes them to it instead. That check is racy and cannot be anything else, so the constraint in the database is what actually holds the line and the duplicate-key error is mapped to a clean message rather than a stack trace.",
          "The interesting part is the shape of it. The uniqueness covers project, date, and an archive sequence that is zero while a report is live and unique once it is archived, which frees the day for a corrected report while any number of archived ones coexist. Postgres could express that as a partial unique index instead, and it would be cleaner. It is a column because Prisma's schema language cannot describe a partial index, so the database would drift from the schema file on every migration, and a constraint the schema does not know about is a constraint that will eventually be dropped by accident.",
        ],
      },
      {
        title: "Archiving instead of deleting",
        content: [
          "Reports cascade from their author and their project, so deleting an engineer who has ever filed anything would take his entire report history, its PDFs and its site photos with it. The app refuses outright. People and projects are archived, and every read path adds the archived filter through one function per entity, so archiving stays invisible to queries written later by someone who has forgotten it exists.",
          "There is one deliberate exception: audit lookups still resolve archived names, because a report names its author and an archived engineer's name has to keep rendering on the reports he filed. Archiving also has to stop the account signing in, which a filter cannot do, so it bans the account and drops its sessions in the same operation. The stamp recording who archived a record is a plain column rather than a foreign key, specifically so it survives that admin's own removal.",
          "Project codes are retired on archive rather than released back into the pool. The code is the leading segment of every report serial that project ever produced, and those serials are printed on PDFs already sitting in management inboxes. Releasing the code would let a future project mint serials indistinguishable from them, permanently.",
        ],
      },
      {
        title: "The date is the server's to decide",
        content: [
          "A report's date is not a field the engineer fills in. It is the day the work happened, resolved server side in Cairo time, and whatever the client sent is discarded. Cairo is three hours ahead of UTC, so a UTC-derived date files every report written between midnight and three in the morning under the previous day, and a device clock is trivially wrong or wrong on purpose.",
          "The one carve-out is a backdating permission, which exists so that the date is an editable input at all, for the single role trusted to correct the record after the fact. Work weeks start on Saturday, and are keyed in URLs by their start date rather than an ISO week number, which sidesteps the trap where the first days of January belong to the previous year's week fifty-three.",
        ],
      },
      {
        title: "Photos, downscaled on the phone",
        content: [
          "Downscaling is the feature, not an optimisation. A site phone hands you an eight to twelve megabyte photo and the engineer is on whatever cellular signal the site has. Resizing to 1600px on the long edge in the browser is more than the A4 PDF needs and lands around 300KB. Honouring the image's own orientation flag is load-bearing on iOS: without it every portrait site photo uploads on its side. Re-encoding also strips the EXIF block, GPS included.",
          "Uploads go straight from the browser to S3 with a presigned URL, because the hosting platform caps server action bodies well below what a photo needs. A presigned PUT is a capability handed to a browser, so the server checks the object's real size and type afterwards before it writes any row, and only ever presigns the file extensions the app itself produces, which is what keeps report PDFs stored under the same prefix out of the photo paths. A report has no id until its first save, so uploads land in a drafts prefix and are re-homed server side once it does, which is what makes an expiry rule on that prefix a safe way to collect the abandoned ones.",
        ],
      },
      {
        title: "Roles as capabilities, not a switch statement",
        content: [
          "Three roles, thirteen permission statements. Deleting and archiving a report are separate capabilities because they do different things to the data: a draft really goes, a submitted report only hides. A site engineer may delete his own draft and may never archive a submitted report, because once submitted it has been emailed to management and stopped being his.",
          "On projects the same split exists for a different reason. Deleting a project cascades to every report ever filed against it and is unrecoverable, so it stays with the admin. Archiving is reversible bookkeeping and the normal end of a project's life, so it also goes to the project manager, who created it and knows when it has finished. Row-level scoping lives in one function per entity so it cannot be sidestepped by guessing an id, and the project picker hiding unassigned projects is convenience: the server checks again.",
        ],
      },
      {
        title: "Testing on the browser the workers actually use",
        content: [
          "Every browser test runs WebKit on an iPhone profile, deliberately, because Chrome's rendering hides the bugs this app actually has: safe-area insets, native date and time controls, sticky elements over backdrop filters, and the difference between viewport height and dynamic viewport height. There are 124 of them across thirteen specs.",
          "The suite builds and serves the app rather than running the dev server, which compiles routes on demand and took minutes to settle under parallel WebKit contexts. Specs are partitioned into readers and writers, with the writers quarantined to run after every reader finishes, because otherwise the aggregate counts read a report another spec is halfway through creating and the failure looks exactly like a scoping bug it is not. CI verifies that the migration history reproduces the schema file from an empty database, and deliberately leaves the mail and storage credentials unset so it cannot write to the real bucket, with the suite asserting the unconfigured behaviour rather than skipping past it.",
        ],
      },
    ],
  },
  "activity-management-platform": {
    title: "Activity Management Platform (UN Agency)",
    mark: "unitar",
    link: undefined,
    intro:
      "A dashboard created to help a UN Agency manage and coordinate activities across different regions, varying scales, and various stakeholders.",
    role: "Product design and front-end",
    period: "Sep 2024 – Nov 2024",
    technologies: {
      backend: [],
      frontend: ["Figma", "React", "TypeScript", "Tailwind", "HTML", "MUI"],
    },
    hero: {
      images: [
        {
          src: unPreview,
          alt: "Screens from the UN agency dashboard: an All Activities view of activity cards listing users, location and type, a Users table with roles and edit/delete actions, a permission builder, and a delete-activity confirmation",
        },
        {
          src: unActions,
          alt: "A handwritten sketch working out the permission action selects: how a chosen action is added back to the available array and the newly selected one removed, so no action can be picked twice",
        },
        {
          src: unWebApp,
          alt: "The shipped React app across four screens: the activities grid, the users table, the new-permission modal with role, resource and action fields, and the delete confirmation over a dimmed page",
        },
      ],
      caption: "The dashboard, the activity actions, and the shipped web app.",
    },
    sections: [
      {
        title: "The Problem",
        content: [
          "Traditional methods to keep track of activities involve fragmented tools, leading to inefficiencies in communication and decision-making.",
          "The client needed a centralized platform to streamline oversight of these activities, ensuring transparency and effective decision-making. This platform needed to be user-friendly and robust.",
        ],
      },
      {
        title: "Information Architecture",
        content: [
          "I conducted an in-depth analysis of the client’s requirements to understand how the information should be laid out.",

          "The goal was to transform complex data into an intuitive, user-friendly interface. The main aim to get a sense of what users will expect and layout the information in a structure that aligns with those expectations. For instance, how administrators would add certain things and improve them. The design should be as intuitive as possible.",
        ],
        figure: {
          images: [
            {
              src: unDoubleDiamond,
              alt: "The double diamond design thinking diagram: problem to solution through Discover, Explore/Define, Develop/Test and Deliver/Listen, with the first diamond labelled research and the second design",
            },
          ],
        },
      },
      {
        title: "Figma Design",
        content: [
          "Then, I started out by designing a low-fidelity layout to establish the foundation for the upcoming designs. Throughout the process, there were multiple decision points where I had to choose between various layouts or structures, weighing in which option would be more intuitive, user-friendly, and streamlined.  For instance, I had to choose between a card layout and a table layout, taking into consideration the trade-offs between information density and visual separation.",

          "Good design is about iteration and constant improvement. I worked in Figma to test out various colors, logos and typefaces, striving to get an aesthetically pleasing yet efficient, functional look and feel.",
          "Ultimately, this translates into much better user satisfaction, conversion rates, and because we catch usability issues early on in the development cycle, development costs are reduced.",
        ],
      },
      {
        title: "React Web App",
        content: [
          "In this project, I utilized React/TS, Tailwind, MUI, and TanStack Query to build a React web app. The codebase was very well-structured, with a clear separation of concerns and a robust architecture centered around reusable components.",
          "From the app initialization – handling login tokens and route guards – to the services and custom hooks that maintain best practices, every aspect was designed with flexibility and maintainability. A really neat trick was the use of a single state variable in the AppContext to manage modals app-wide. This minimized memory usage by eliminating the need to store a state variable for each edit, view, or add modal.  The upshot is a much more performant and efficient app.",
          "Overall, this project was an eye-opening experience that deepened my understanding of advanced React patterns, state management, and optimizing component architecture.",
        ],
      },
      {
        title: "Result",
        content: [
          "On a final note, working in a collaborate Git environment is valuable, but it has its own set of challenges. It’s important to adhere to commit naming conventions, utilize feature branches to maintain organization. It’s important to maintain a clean commit history, ensuring a smoother dev process and less errors.",
          "This project was well received by the client and will be utilized to streamline their management process and inform better decision-making.",
        ],
      },
    ],
  },
};
