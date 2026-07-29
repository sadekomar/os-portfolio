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
  "activity-management-platform",
  "little-lads",
] as const;

export type ProjectKeys = (typeof projectOrder)[number];

import loomPreview from "./(loom)/loom-preview.png";
import loomAPI from "./(loom)/loom-api.png";
import loomWebApp from "./(loom)/loom-web-app.png";
import loomBooks from "./(loom)/loom-books.png";
import loomBrands from "./(loom)/loom-brands.png";
import loomDb from "./(loom)/loom-db.png";

import ladsBooks from "./(lads)/ll-books.png";
import ladsNavigation from "./(lads)/ll-navigation.png";
import ladsPreview from "./(lads)/ll-preview.png";
import ladsProblem from "./(lads)/ll-problem.png";
import ladsTestimonials from "./(lads)/ll-testimonials.png";

import unPreview from "./(un)/un-preview.png";
import unActions from "./(un)/un-actions.png";
import unBooks from "./(un)/un-books.png";
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
     eight image imports in behind it.

     Optional, because one case study has no mark: Little Lads was a client
     with a wordmark and no symbol, and a logotype squeezed into the tile is
     a worse copy of the title already sitting beside it. Those cards fall
     back to the site's own monogram. */
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

/** The interactive blocks a case study can embed. One so far. */
export type Artifact = "wholana-decoder";

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
      "Wholana is a research and ideation platform for short-form video creators. It surfaces high-performing TikToks, decodes their structure, and helps creators generate new ideas grounded in real data. Solo build, pre-launch, with six substantive releases in the first two months.",
    role: "Solo: design and engineering",
    period: "2026 – Present",
    stats: [
      { value: "2,000", label: "Creators tracked" },
      { value: "6", label: "Releases in two months" },
    ],
    technologies: {
      backend: [
        "Node.js",
        "Postgres",
        "Supabase",
        "Prisma",
        "Better Auth",
        "Apify",
        "Gemini",
        "Cloudflare R2",
        "Polar",
        "Sentry",
      ],
      frontend: ["TypeScript", "Next.js", "React", "Figma"],
    },
    sections: [
      {
        title: "Context",
        content: [
          "Wholana helps short-form video creators study what is working on TikTok and ideate from real data instead of vibes. The product surfaces high-performing videos, decodes their structure (hook, beat sheet, logline, stop-scroll, stakes-value), and turns that into research and ideation tools. I designed and built the entire product solo.",
        ],
      },
      {
        title: "The Wholana Decoder",
        content: [
          "The Decoder is the technical heart of the product. The pipeline ingests TikTok videos through Apify scrapers, downloads and parses subtitles, runs Gemini-powered AI summarization, and outputs structured artifacts: beat sheets, a category taxonomy, and an outlier score that flags videos overperforming for their context.",
          "Getting structured output reliably out of an LLM over messy real-world inputs is the hard part. The pipeline is designed so that scraping, parsing, summarization, and scoring fail independently and can be retried in isolation.",
        ],
        artifact: "wholana-decoder",
      },
      {
        title: "Product surface",
        content: [
          "Designed and shipped the full surface solo: Explore with analytics and server-side filtering, video detail, Lists, a Creators directory with per-creator analytics, Ideas Studio, Settings, Billing, plus an admin Control Room and Newsroom. The API surface was migrated to REST for faster data access where it mattered.",
        ],
      },
      {
        title: "Infrastructure and operations",
        content: [
          "Cloudflare R2 for media behind a dedicated CDN, native TikTok embed playback, Sentry for observability, scheduled pg_dump backups, and cron-staleness alerting. Auth runs on Better Auth with Google OAuth and One-Tap. Subscriptions run on Polar.",
        ],
      },
      {
        title: "Brand and editorial direction",
        content: [
          "Designed the marketing site and in-app brand in an editorial, serif-led style. The product is for people who care about craft in writing and pacing, and the surface signals that.",
        ],
      },
      {
        title: "Shipping in public",
        content: [
          "Wholana ships in public. Six substantive releases in the first two months are documented on the public changelog at wholana.com/changelog, which is the single best place to see the work moving.",
        ],
      },
    ],
  },
  "tiktok-news-network": {
    title: "TikTok News Network",
    mark: "tnn",
    link: "tiktoknewsnetwork.com",
    intro:
      "TNN is a nightly satirical news broadcast about the Egyptian internet. I founded it, host it, and built the site it lives on. It runs on Wholana's data pipeline, and has grown to 12M+ views, 52K+ followers, and 260 stories covered across five recurring formats.",
    role: "Founder, anchor and engineer",
    period: "2026 – Present",
    stats: [
      { value: "12M+", label: "Views" },
      { value: "52K+", label: "Followers" },
      { value: "260", label: "Stories covered" },
    ],
    technologies: {
      backend: ["Node.js", "Payload CMS", "Postgres", "Wholana API"],
      frontend: ["TypeScript", "Next.js", "React", "Tailwind", "Figma"],
    },
    sections: [
      {
        title: "Context",
        content: [
          "TNN treats Egyptian TikTok culture with the deadpan gravitas of a broadcast news desk. The tagline is “Where high-stakes journalism meets low-stakes internet beef.” It airs nightly at 21:00 Cairo time, and I founded it, anchor it, and built the platform behind it.",
          "It started in March 2026 with no studio and no crew. It has since grown into five recurring formats (The Nightly, The Debates, Field Reports, TNN Stocks, and On the Record) with a team of correspondents and co-anchors, 260 stories covered, 12M+ views, and 52K+ followers.",
        ],
      },
      {
        title: "The distribution problem, solved with software",
        content: [
          "A nightly show is a nightly deadline. The hard constraint is not production, it is knowing what actually happened on the Egyptian internet that day before the rest of the internet does, every single day, without spending the whole day scrolling.",
          "TNN runs on Wholana, the research platform I built. It aggregates posts from Egypt's 2,000 most popular TikTok creators and lets me filter by engagement and date window, so the show's rundown is a query rather than a scroll. Curation becomes a data problem with a repeatable answer, which is the only reason a nightly cadence is sustainable solo.",
        ],
      },
      {
        title: "The website",
        content: [
          "The site is the show's archive and its front door: every episode gets a written briefing, so the coverage is searchable and linkable long after the video scrolls past. It is built on Next.js with Payload as the CMS, which matters because the editorial workflow has to be fast enough to publish a recap right after air without a deploy.",
          "The design carries the same joke as the show. Broadcast typography, a rigid grid, stat lines and desk names presented straight. The visual seriousness is what makes the subject matter funny, so the design had to commit fully rather than wink.",
        ],
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
    title: "Loom Cairo (later Univyr)",
    mark: "loom",
    intro:
      "Loom Cairo, later rebranded as Univyr, was a search engine for local fashion that aggregated over 300 Egyptian brand websites into a single platform. Operated 2023 to 2025. Grew to 40,000+ users and 70+ brand partnerships, and was accepted into AUC Venture Lab.",
    role: "Founder: solo design and engineering",
    period: "2023 – 2025",
    stats: [
      { value: "40,000+", label: "Users" },
      { value: "300+", label: "Brand sites aggregated" },
      { value: "70+", label: "Brand partnerships" },
    ],
    technologies: {
      backend: ["Python", "Postgres", "Prisma", "Redis", "TensorFlow"],
      frontend: ["TypeScript", "Next.js", "React", "Figma"],
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
          "Operated 2023 to 2025. Grew to 40,000+ users and 70+ brand partnerships. Accepted into AUC Venture Lab (V-Lab). I architected and shipped the full system solo.",
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
          "To enable the filters and improved search, I created an algorithm that labels the items. The loom database is quite large with about 17,000 items and 65,000 unique colors/sizes. I started out with cleaning and preprocessing the data such as fixing spelling inconsistencies, such as blue and bluee.  Then, I did data normalization by grouping together synonyms of colors such sky and blue into a single parent color.",
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
          "As scale grew, the early SQLite and Flask stack was rebuilt on Postgres with Prisma and Redis caching. The Python scrapers were restructured around SOLID principles, with custom context managers handling DB locks, exception handling, and logging. Search moved to vector embeddings to handle the heterogeneity of Egyptian brand catalogs. TensorFlow drove ML data labeling and image classification to enrich the product catalog.",
          "Auth moved to a session-based model. The product was rebranded as Univyr and the surface was redesigned end to end in Figma.",
        ],
      },
      {
        title: "Outcome",
        content: [
          "40,000+ users, 70+ brand partnerships, accepted into AUC Venture Lab. Operated 2023 to 2025.",
        ],
      },
      {
        title: "Books I read that were relevant to this project",
        content: [
          "Clean Code by Robert C Martin came in especially handy for structuring code and laying out everything when it came to OOP.",
          "Thoughts on Design by Paul Rand talks about well-renowned designer Paul Rand’s approach to design and how he tackles everything.",
        ],
        figure: {
          images: [
            {
              src: loomBooks,
              alt: "Covers of Clean Code by Robert C. Martin and Thoughts on Design by Paul Rand",
            },
          ],
        },
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
      backend: ["Node.js", "Postgres", "Prisma"],
      frontend: ["TypeScript", "Next.js", "React", "Tailwind", "Figma"],
    },
    sections: [
      {
        title: "Context",
        content: [
          "Argonaut runs two integrated arms: trading, which supplies equipment and handles supplier coordination and commissioning, and services, which covers engineering, procurement, construction, and maintenance. They work across oil and gas, defense, healthcare, marine, and infrastructure, and partner with manufacturers including Halton, Trane, Aironn, and Gonair.",
          "The site had to do a specific job: convince a procurement engineer or consultant that this firm can be trusted with a large scope of work, then get them to a quote request quickly.",
        ],
      },
      {
        title: "SEO and information architecture",
        content: [
          "I led SEO strategy and information architecture for the site. The structure is built around how procurement buyers actually search, which is rarely by company name. They search by capability, by sector, and by manufacturer.",
          "So the IA is cut along those axes: expertise domains (electrical, fire safety, HVAC, mechanical, plumbing), capabilities (engineering and design, procurement, installation, maintenance, trading), and sectors served. That gives real content depth on the terms that matter while keeping every page a short path to a quote request.",
        ],
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
          "Argonaut's commercial process runs on quotes. An RFQ comes in, equipment gets specced, suppliers get approached, a consultant signs off, and a number goes out that may be worth millions. Before the CRM, that lifecycle lived across spreadsheets and inboxes, which is workable right up until someone needs to answer a question about a quote nobody remembers.",
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
      backend: ["Node.js", "Postgres", "Prisma"],
      frontend: ["TypeScript", "Next.js", "React", "Tailwind"],
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
          "The product models rental units as small state machines covering availability, in-use, maintenance, and out-of-service transitions. The maintenance flow is its own state machine on top, with the two reconciled so that a unit in maintenance is never accidentally rentable.",
        ],
      },
      {
        title: "Billing lifecycle",
        content: [
          "Monthly invoicing, job extensions, and renewals are modeled as first-class events on the rental, so the billing view is a projection of the lifecycle rather than a parallel spreadsheet the operators have to keep in sync.",
        ],
      },
    ],
  },
  "little-lads": {
    title: "Little Lads",
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
      {
        title: "Books I read that were relevant to this project",
        content: [
          "Thinking With Type By Ellen Lupton was such an interesting read and it was really instrumental in changing the way I perceive typography and its immense importance, paying attention to concepts such as modulation, line height, weight, x-height, and so much more...",
        ],
        figure: {
          images: [
            {
              src: ladsBooks,
              alt: "Cover of Thinking with Type by Ellen Lupton, second edition",
            },
          ],
        },
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
    period: "2023",
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
      {
        title: "Books I read that were relevant to this project",
        content: [
          "Change by Design By Tim Brown was an awesome read to learn more about design thinking and how the whole process works.",
        ],
        figure: {
          images: [
            {
              src: unBooks,
              alt: "Cover of Change by Design by Tim Brown, revised and updated edition",
            },
          ],
        },
      },
    ],
  },
};
