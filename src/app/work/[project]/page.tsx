import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Icon, iconGap } from "@/components/icon/Icon";

import {
  allProjects,
  projectOrder,
  type Artifact,
  type ProjectKeys,
} from "@/app/work/[project]/projects";
import { CaseStudyFigure } from "@/components/case-study/Figure";
import { CaseStudyStats } from "@/components/case-study/Stats";
import { SequenceLineNav, SequenceRail } from "@/components/sequence/LineNav";
import { SequencePager } from "@/components/sequence/Pager";
import { slugify } from "@/lib/slug";

export const dynamicParams = false;

export async function generateStaticParams() {
  return projectOrder.map((project) => ({ project }));
}

const siteUrl = "https://sadekomar.com";

/* Search results and share cards get the project, not the site default.
   The intro doubles as the description, clipped at a word boundary.

   `openGraph` is deliberately left without `images`. A page's openGraph
   replaces the layout's rather than merging into it, so naming images here
   is what would suppress the generated card. The opengraph-image route in
   this segment only fills in when the field is absent. Same for `twitter`:
   its images resolve from openGraph when unset, and setting them would cost
   the per-project alt text the image route already supplies. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string }>;
}): Promise<Metadata> {
  const { project: key } = await params;
  const project = allProjects[key as ProjectKeys];
  if (!project) return {};

  const description =
    project.intro.length > 155
      ? `${project.intro.slice(0, project.intro.lastIndexOf(" ", 155))}…`
      : project.intro;
  const url = `/work/${key}`;

  return {
    title: project.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${project.title} | Omar Sadek`,
      description,
    },
    twitter: { card: "summary_large_image", title: `${project.title} | Omar Sadek`, description },
  };
}

/* ── Interactive blocks ───────────────────────────────────────────────────
   One entry per `Artifact`, mapped by name and pulled in through
   `next/dynamic` so a block is a leaf of the route rather than something
   every case study imports directly.

   Deliberately *not* `ssr: false`. The block is below the fold, and the
   cheap-looking move (skip it on the server, mount it on the client)
   would have the section reflow the moment hydration lands. Server-rendering
   the resting state means the height is right in the first paint, the input
   is readable with JS still in flight, and the reader never watches the
   article jump.

   Worth being accurate about what the split actually buys, because it is
   less than it looks. All nine case studies are one route, `/work/[project]`,
   so Next emits one client manifest for the set, and the block's chunk is
   requested on every project page rather than only on the one whose data
   names it. It also lands in the same chunk as the contents rail, which
   already pulls `motion` on every case study regardless. The real marginal
   cost of the artifact is therefore its own code and its frozen rows, a few
   KB gzipped, on eight pages that don't render it, which is the price of
   keeping the ninth free of layout shift, and the right way round. */
const artifacts: Record<Artifact, React.ComponentType> = {
  "wholana-decoder": dynamic(() =>
    import("@/components/case-study/WholanaDecoder").then((m) => m.WholanaDecoder),
  ),
  "storefront-carousel": dynamic(() =>
    import("@/components/case-study/StorefrontCarousel").then((m) => m.StorefrontCarousel),
  ),
};


/* ── The case-study page ──────────────────────────────────────────────────
   Two widths and one rhythm, after glenn.me/fueled.

   The widths: prose is a 640px column, centred and identical on every page;
   images are full-bleed, inset 12px from the viewport (see Scroller). There
   is no third width. Nothing is half-bled, nothing is boxed to 1200, and no
   figure is ever the same width as the text, so the whole page reads as a
   still column with film running past it.

   The rhythm is three numbers and it does the work a divider or a card
   would otherwise do:

     80  between blocks: one project moment to the next
     64  inside a block, between the images and the writing about them
     16  between a heading and its paragraph, and between paragraphs

   Nothing is drawn to separate anything. That's the same argument the rest
   of the site makes with tone (see quiet tonal in globals.css); here the
   surface is plain white throughout, so space is all that's left, and 80 vs
   64 has to be legible as a change of level on its own. Compressing them
   toward each other is what would break the page.

   The order inside a block is images → caption → heading → prose, which
   inverts the usual "say it, then show it". A case study is being scrolled
   before it's being read: the image is what stops someone, the caption tells
   them what they're looking at in a line, and the heading and prose are
   there for whoever the image earned. */

export default async function Project({ params }: { params: Promise<{ project: string }> }) {
  const { project: key } = await params;
  const project = allProjects[key as ProjectKeys];

  const stack = [...project.technologies.backend, ...project.technologies.frontend];

  const index = projectOrder.indexOf(key as ProjectKeys);
  const previous = index > 0 ? projectOrder[index - 1] : undefined;
  const next = index < projectOrder.length - 1 ? projectOrder[index + 1] : undefined;

  const url = `${siteUrl}/work/${key}`;

  /* The middle crumb points at the home page's Work section because that is
     genuinely where the index lives; there is no /work route. Naming a URL
     that would 404 is worse than a fragment that resolves. */
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Work", item: `${siteUrl}/#work` },
      { "@type": "ListItem", position: 3, name: project.title, item: url },
    ],
  };

  /* CreativeWork rather than Article: the page documents something that was
     built, not something that was published. Article expects a headline and
     a datePublished/dateModified pair, and none of the nine case studies
     carry a publication date, only the period the work ran. Choosing
     Article would mean inventing those dates, which is the one way a case
     study can be wrong in a way a machine acts on.

     `author` is a reference, not a second Person. The root layout already
     defines the node at /#person with the sameAs links that do the entity
     work; repeating a bare copy here would give a crawler two Omar Sadeks
     to reconcile instead of one to reinforce. */
  const caseStudyJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#case-study`,
    name: project.title,
    headline: project.title,
    description: project.intro,
    url,
    /* Stable path, not the hashed og:image URL. Same reasoning as the
       essays. CreativeWork isn't eligible for a rich result the way Article
       is, so this is entity description rather than a thumbnail: it gives
       the node a depiction, which is what lets a knowledge panel or an AI
       summary show the work rather than only name it. */
    image: {
      "@type": "ImageObject",
      url: `${url}/opengraph-image/card`,
      width: 1200,
      height: 630,
    },
    author: { "@id": `${siteUrl}/#person` },
    creator: { "@id": `${siteUrl}/#person` },
    isPartOf: { "@id": `${siteUrl}/#website` },
    inLanguage: "en",
    ...(project.period && { temporalCoverage: project.period }),
    ...(stack.length > 0 && {
      keywords: stack.join(", "),
      about: stack.map((technology) => ({ "@type": "Thing", name: technology })),
    }),
  };

  return (
    /* `surface-paper`, not the `--surface` the rest of the site sits on: one
       step *away* from the canvas rather than on it. In light that step is
       toward white, and the reason is the imagery: the screenshots in the
       scroller are mostly light UI running to their own edges with no frame
       around them, and a page tinted a couple of percent below white turns
       every one of those into a faint grey rectangle.

       In dark the step is the same 2% and the argument inverts with it: the
       screenshots are still light UI, so they are now the brightest thing on
       the page by a wide margin. Nothing here tries to soften that. Dimming
       a screenshot to make it sit politely on a dark page is showing the
       reader a picture of the product that the product never looked like,
       and the honest version of "this shipped light" is a bright rectangle.
       See docs/north-stars.md on genuine light/dark pairs. The real fix,
       when it comes, is dark captures, not a filter. */
    <article className="relative flex w-full flex-col gap-20 bg-surface-paper py-20 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, caseStudyJsonLd]),
        }}
      />

      {/* Sticky rather than fixed so it belongs to the article's own
          coordinate space: it starts on the header's line and then holds
          itself at eye height for the rest of the scroll. The breakpoint and
          the positioning live in SequenceRail now, shared with the
          components and the posts. */}
      <SequenceRail>
        <SequenceLineNav
          label="Case studies"
          items={projectOrder.map((slug) => ({
            title: allProjects[slug].title,
            href: `/work/${slug}`,
          }))}
          activeHref={`/work/${key}`}
        />
      </SequenceRail>

      <header className="mx-auto flex w-full max-w-measure-gutter px-6 flex-col gap-16">
        {/* Out of the sequence on the left, along it on the right. Both
            movements sit on the same line so the page opens by saying where
            you are in the work, not just that you can leave it. */}
        <div className="flex items-center justify-between">
          <Link
            href="/#work"
            className="inline-flex w-fit items-center gap-1.5 rounded-sm text-case-caption text-foreground-faint transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
          >
            <Icon name="back" size="micro" />
            Work
          </Link>

          <SequencePager
            previous={previous && { slug: previous, title: allProjects[previous].title }}
            next={next && { slug: next, title: allProjects[next].title }}
            basePath="/work"
            indexPath="/#work"
            labels={{ previous: "Previous case study", next: "Next case study" }}
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* The one place the serif runs larger than 24px. It's the same
              voice as every section heading below, which is what ties the
              title to the page rather than crowning it. */}
          <h1 className="font-serif text-case-title italic text-foreground">{project.title}</h1>

          <p className="text-case text-foreground-muted">{project.intro}</p>
        </div>

        {/* Above the meta, not below it: the outcome is the reason to keep
            reading, where Role and Stack are what you check afterwards. */}
        {project.stats && <CaseStudyStats stats={project.stats} />}

        {/* Meta as a labelled list rather than a comma-run. The stack is
            reference material, so it reads as a field, not as body copy. */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-case-caption">
          <MetaRow label="Role" value={project.role} />
          {project.period && <MetaRow label="Period" value={project.period} numeric />}
          {stack.length > 0 && <MetaRow label="Stack" value={stack.join(", ")} />}
          {project.link && (
            <>
              <dt className="text-foreground-faint">Site</dt>
              <dd>
                <a
                  className={`case-link inline-flex items-center ${iconGap("micro")}`}
                  href={`https://${project.link}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {project.link}
                  <Icon name="external" size="micro" className="text-foreground-faint" />
                </a>
              </dd>
            </>
          )}
        </dl>
      </header>

      {project.hero && <CaseStudyFigure figure={project.hero} />}

      {project.sections.map((section, i) => {
        const id = section.title ? slugify(section.title) : undefined;

        return (
          <section key={i} id={id} className="flex w-full scroll-mt-24 flex-col gap-16">
            {section.figure && <CaseStudyFigure figure={section.figure} />}

            <div className="mx-auto flex w-full max-w-measure-gutter px-6 flex-col gap-4">
              {section.title && (
                /* Serif italic at 24/30 against 16/30.4 roman prose. The two
                   sizes are close enough that the change of level is carried
                   by the face, not by scale, which is why the heading can be
                   this quiet and still never be mistaken for a first line. */
                <h2 className="group font-serif text-case-heading italic text-foreground">
                  {section.title}
                  {id && (
                    <a
                      href={`#${id}`}
                      aria-label={`Link to ${section.title}`}
                      className="ml-2 font-sans not-italic text-foreground-ghost opacity-0 transition-opacity duration-150 focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                    >
                      #
                    </a>
                  )}
                </h2>
              )}
              {section.content.map((paragraph) => (
                <p key={paragraph} className="text-case text-foreground-muted">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* After the prose, not before it. The block is a demonstration
                of a claim the paragraphs have just made. Put it above them
                and it is a widget the reader has to reverse-engineer. */}
            {section.artifact && <Artifacts name={section.artifact} />}
          </section>
        );
      })}

      {/* Onward motion instead of a dead end. The index is one click away in
          the header, so the footer is for the next case study. */}
      <nav aria-label="More work" className="mx-auto w-full max-w-measure-gutter px-6">
        <div className="flex items-start justify-between gap-8">
          {previous ? <AdjacentProject slug={previous} direction="Previous" /> : <span />}
          {next && <AdjacentProject slug={next} direction="Next" />}
        </div>
      </nav>
    </article>
  );
}

/* The artifact sits on the film plane, not in the prose column: same 12px
   viewport inset the scroller uses, and the same `min(1036px, 100%)` tile
   inside it. That is not a third width; it is the width every figure on
   this page already resolves to, which is the point. A block that ran to
   640 would be a widget wedged into the text; one that ran edge to edge
   would be wider than any screenshot above it. */
function Artifacts({ name }: { name: Artifact }) {
  const Block = artifacts[name];

  /* `relative z-10` is the one thing here that isn't about width. The
     contents rail is absolutely positioned, 336px wide and as tall as the
     article, so at ≥1440 it paints over the left ~134px of anything this
     wide, and being positioned, it wins the paint order against a static
     sibling. A screenshot passing under it is the page's existing language
     and reads as film behind an index. A block with radio buttons and a
     submit in it cannot: the rail's links sit on top of the picker and take
     the clicks meant for it. Raising the artifact makes the opaque card
     occlude the rail for the height of the block and take its own hits
     back, which is the correct precedence: an index you can consult later
     yields to a control you are using now. */
  return (
    <div className="relative z-10 w-full px-3">
      <div className="mx-auto w-full max-w-[1036px]">
        <Block />
      </div>
    </div>
  );
}

/* `numeric` opts a row into tabular figures, correct for the year ranges
   in Period, wrong for anything running as prose, where proportional
   digits sit better in the line. */
function MetaRow({ label, value, numeric }: { label: string; value: string; numeric?: boolean }) {
  return (
    <>
      <dt className="text-foreground-faint">{label}</dt>
      <dd className={`text-foreground-muted ${numeric ? "tabular-nums" : ""}`}>{value}</dd>
    </>
  );
}

function AdjacentProject({ slug, direction }: { slug: ProjectKeys; direction: string }) {
  const alignment = direction === "Next" ? "items-end text-right" : "items-start";

  return (
    /* No hover surface, unlike the rest of the site: a filled rectangle is a
       drawn edge, and this page doesn't have any. The title picks up the
       same wavy underline an inline link carries, so the hit state is the
       page's own vocabulary rather than a button appearing under the cursor. */
    <Link
      href={`/work/${slug}`}
      className={`group flex flex-col gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 ${alignment}`}
    >
      <span className="text-case-caption text-foreground-faint">{direction}</span>
      <span className="case-link font-serif text-case-heading italic decoration-transparent group-hover:decoration-wave">
        {allProjects[slug].title}
      </span>
    </Link>
  );
}
