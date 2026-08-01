import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon/Icon";
import { SequenceLineNav, SequenceRail } from "@/components/sequence/LineNav";
import { ComponentShell } from "@/components/showcase/ComponentShell";
import { PageToolbar } from "@/components/showcase/PageToolbar";
import {
  assistantPrompt,
  componentMarkdown,
  githubUrl,
  markdownUrl,
} from "@/components/showcase/markdown";
import { ShowcasePreview, hasShowcaseEntry } from "@/components/showcase/registry";
import { TableOfContents, type TocItem } from "@/components/showcase/TableOfContents";
import { readShowcaseSource } from "@/components/showcase/source";
import {
  componentNeighbours,
  componentSlugs,
  getComponent,
  showcaseComponents,
} from "@/data/components";
import { siteUrl } from "@/lib/site";

type Params = { params: Promise<{ component: string }> };

export function generateStaticParams() {
  return componentSlugs.map((component) => ({ component }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { component: slug } = await params;
  const component = getComponent(slug);
  if (!component) return {};

  /* Bare here, because the root layout's template appends the site name.
     The share cards get the full string, since they travel without it. */
  const shared = `${component.title} | Omar Sadek`;
  const url = `/components/${slug}`;

  /* Neither object names an image, and that is what makes the generated
     card the card: opengraph-image.tsx in this segment is appended to
     whatever `images` is already here, so listing one would ship two
     og:image tags and every scraper takes the first. `twitter.images`
     resolves from openGraph when unset, which also keeps the per-component
     alt text the image route supplies. */
  return {
    title: component.title,
    description: component.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: shared,
      description: component.description,
      siteName: "Omar Sadek",
    },
    twitter: {
      card: "summary_large_image",
      title: shared,
      description: component.description,
      creator: "@omarsadekk",
    },
  };
}

export default async function ComponentPage({ params }: Params) {
  const { component: slug } = await params;
  const component = getComponent(slug);
  if (!component || !hasShowcaseEntry(slug)) notFound();

  const files = await readShowcaseSource(slug, component.files);
  const { prev, next } = componentNeighbours(slug);

  /* Built here rather than in the toolbar so the markdown the Copy button
     writes is byte-identical to the markdown the `/markdown` route serves
     and every assistant fetches. One document, three ways of reaching it. */
  const markdown = componentMarkdown(component, files);

  const url = `${siteUrl}/components/${slug}`;

  /* The middle crumb is a real 200 page, unlike the case studies' Work crumb,
     which has to point at the home page's /#work fragment because there is no
     /work route. /components exists, so the trail is three plain URLs. */
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Components", item: `${siteUrl}/components` },
      { "@type": "ListItem", position: 3, name: component.title, item: url },
    ],
  };

  /* SoftwareSourceCode rather than the CreativeWork the case studies use, and
     the difference is that this page is not a description of something built
     elsewhere: the files listed under Source are on the page in full, read off
     disk from the same paths `codeRepository` links to. Every field below is
     something a reader can check against what is rendered.

     `programmingLanguage` reuses the highlighter's own language tag for each
     file rather than being declared alongside the component, so a component
     that one day ships only CSS cannot end up claiming TypeScript because a
     second table was never updated.

     No `datePublished` and no version. Neither is on the page, and a date
     invented for a schema field is the one kind of error a machine acts on.
     `author` is a reference to the Person the root layout defines, not a
     second copy of it. */
  const languageNames: Record<string, string> = { css: "CSS", ts: "TypeScript", tsx: "TSX" };
  const languages = [
    ...new Set(files.map((file) => languageNames[file.language] ?? file.language)),
  ];

  const sourceJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${url}#source`,
    name: component.title,
    description: component.description,
    url,
    codeRepository: githubUrl(slug, component.files[0]),
    programmingLanguage: languages,
    runtimePlatform: "React",
    image: {
      "@type": "ImageObject",
      url: `${url}/opengraph-image/card`,
      width: 1200,
      height: 630,
    },
    author: { "@id": `${siteUrl}/#person` },
    creator: { "@id": `${siteUrl}/#person` },
    isPartOf: { "@id": `${siteUrl}/components#collection` },
    inLanguage: "en",
  };

  const toc: TocItem[] = [
    { id: "features", label: "Features" },
    { id: "usage", label: "Usage" },
    { id: "source", label: "Source" },
    ...files.map((file): TocItem => ({ id: fileId(file.name), label: file.name, depth: 3 })),
  ];

  return (
    <div className="relative w-full pt-16 pb-24 md:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, sourceJsonLd]),
        }}
      />

      {/* The set, in the left margin. It used to live in a layout wrapping
          both this page and the index, which put it on the index too: a rail
          listing six components down the side of a page whose whole body is
          those same six components, naming them a second time in smaller
          text. A contents rail is for when you are inside one entry and want
          to see the others without leaving; on the index you are already
          looking at the list.

          Here rather than in a layout also means the slug is in hand, so
          `activeHref` is passed and the rail skips reading the path. */}
      <SequenceRail>
        <SequenceLineNav
          label="Components"
          activeHref={`/components/${slug}`}
          items={showcaseComponents.map((entry) => ({
            title: entry.title,
            href: `/components/${entry.slug}`,
          }))}
        />
      </SequenceRail>

      {/* The mirror of that rail: same 1440 breakpoint, reading in the other
          direction. It keeps its own `w-60` where the rail is as wide as its
          longest title, because this one holds file names that can run long
          and a table of contents that reflows as you scroll would be worse
          than one that wraps. */}
      <div className="absolute inset-y-0 right-0 hidden w-60 min-[1440px]:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-8">
          <TableOfContents items={toc} />
        </div>
      </div>

      <article className="flex w-full flex-col">
        <Column>
          <div className="flex items-start justify-between gap-6">
            <Link
              href="/components"
              className="text-meta text-foreground-faint hover:text-foreground focus-visible:ring-ring/20 inline-flex items-center gap-1.5 rounded-sm pt-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Icon name="back" size="micro" />
              Components
            </Link>
            <PageToolbar
              slug={slug}
              title={component.title}
              markdown={markdown}
              markdownUrl={markdownUrl(slug)}
              githubUrl={githubUrl(slug, component.files[0])}
              prompt={assistantPrompt(component)}
              prev={prev && { slug: prev.slug, title: prev.title }}
              next={next && { slug: next.slug, title: next.title }}
            />
          </div>

          <header className="mt-10 mb-8">
            <h1 className="text-headline text-foreground font-medium">{component.title}</h1>
            <p className="max-w-measure text-body text-foreground-muted mt-3">
              {component.description}
            </p>
            <p className="text-meta text-foreground-faint mt-3">
              Built for{" "}
              {component.project.slug ? (
                <Link
                  href={`/work/${component.project.slug}`}
                  className="text-foreground-muted hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  {component.project.name}
                </Link>
              ) : (
                component.project.name
              )}
            </p>
          </header>
        </Column>

        <Stage>
          <ComponentShell
            preview={<ShowcasePreview slug={slug} />}
            files={files}
            stage={component.stage}
          />
        </Stage>

        {/* Stated under the preview rather than in a footnote, because the
            honest version of "here is a component I built" has to say where
            it came from and what changed on the way here. */}
        {component.note && (
          <Column className="mt-4">
            <p className="max-w-measure text-body-sm text-foreground-subtle">{component.note}</p>
          </Column>
        )}

        <Section id="features" title="Features">
          <Column>
            <ul className="max-w-measure text-body text-foreground-muted space-y-3">
              {component.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span aria-hidden="true" className="text-foreground-ghost select-none">
                    &bull;
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Column>
        </Section>

        {/* In the column, not on the plane. Usage is two lines under 80
            characters: given the film plane it is a 1036px box holding one
            import, which reads as a mistake. The plane is for the things
            that genuinely outgrow the column, which is the live component
            and the source. */}
        <Section id="usage" title="Usage">
          <Column>
            <CodeBlock wrap>{component.usage}</CodeBlock>
          </Column>
        </Section>

        <Section id="source" title="Source">
          <Column className="mb-5">
            <p className="max-w-measure text-body-sm text-foreground-subtle">
              The files this component is made of, as they run above. Copy them in, or take the
              whole page as markdown from the toolbar.
            </p>
          </Column>
          <div className="flex flex-col gap-8">
            {files.map((file) => (
              /* The file name rides the film plane rather than the text
                 column: it is the block's own label, and set at the column's
                 left edge it would sit 190px away from the code it names. */
              <Stage key={file.name}>
                <h3
                  id={fileId(file.name)}
                  className="text-meta text-foreground-muted mb-3 scroll-mt-24 pl-1.5 font-mono"
                >
                  {file.name}
                </h3>
                <CodeBlock scroll>{file.code}</CodeBlock>
              </Stage>
            ))}
          </div>
        </Section>

        {/* No rule above it and no hover surface under it, matching the blog
            and case-study pagers: a filled rectangle is a drawn edge. */}
        <Column className="mt-20">
          <nav aria-label="More components" className="flex items-start justify-between gap-8">
            {prev ? <PagerLink component={prev} direction="Previous" /> : <span />}
            {next && <PagerLink component={next} direction="Next" />}
          </nav>
        </Column>
      </article>
    </div>
  );
}

/* The site's column, at the width the navbar, the footer, the index, the
   blog and the case studies all resolve to. Everything that is read sits
   in it. */
function Column({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-measure-gutter mx-auto w-full px-6 ${className ?? ""}`}>{children}</div>
  );
}

/* The film plane, for the two things on this page that are looked at rather
   than read: the live component and the source. It is the width a case
   study's figures and artifacts already resolve to, so it is not a third
   measure being invented here.

   `relative z-30` is the same fix the case-study artifacts carry, and it
   goes on the 1036px box rather than the full-width wrapper around it. The
   rails are absolutely positioned at z-20 and as tall as the article, so at
   >=1440 they cover the outer ~40px of anything this wide. A screenshot
   passing under a rail is fine; a live component is not, because the rail's
   links sit on top of it and take the clicks meant for it. 30 puts the stage
   back on top for exactly the width it occupies.

   On the wrapper, which is where this started, the raise reached further
   than the stage did, and it looked equivalent because the wrapper is
   transparent. It isn't: a box takes pointer events across its whole width
   whether or not anything is painted there, so a full-width sheet covered
   the left margin the rail stands in for the height of every stage on the
   page, and the rail went quiet. Keeping the raise on the inner box leaves
   the margins to the rail. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-3">
      <div className="relative z-30 mx-auto w-full max-w-[1036px]">{children}</div>
    </div>
  );
}

/* `scroll-mt` on the heading rather than padding on the section: the site
   header is sticky, so an anchor that lands the heading at the top of the
   viewport lands it underneath the header. Margin on the scroll target is
   the one property that moves where an anchor stops without moving where
   the heading sits. */
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <Column className="mb-4">
        <h2 id={id} className="text-headline text-foreground scroll-mt-24 font-medium">
          {title}
        </h2>
      </Column>
      {children}
    </section>
  );
}

/* Label over title, the shape both the case-study and blog pagers use. The
   title is body rather than the 15px it was: it is the link, and the label
   above it is the caption. */
function PagerLink({
  component,
  direction,
}: {
  component: { slug: string; title: string };
  direction: string;
}) {
  const alignment = direction === "Next" ? "items-end text-right" : "items-start";

  return (
    <Link
      href={`/components/${component.slug}`}
      className={`group focus-visible:ring-ring/20 flex min-w-0 flex-col gap-1 rounded-sm focus-visible:ring-2 focus-visible:outline-none ${alignment}`}
    >
      <span className="text-meta text-foreground-faint">{direction}</span>
      <span className="text-body text-foreground-muted group-hover:text-foreground truncate transition-colors">
        {component.title}
      </span>
    </Link>
  );
}

/* `wrap` for the block that lives in the text column: an import path is
   longer than 640px and a two line snippet that has to be scrolled
   sideways to be read is worse than one that turns. The source blocks are
   the other case, where a wrap would reflow real indentation, so they keep
   the horizontal scroll their width earns them. */
function CodeBlock({
  children,
  scroll,
  wrap,
}: {
  children: string;
  scroll?: boolean;
  wrap?: boolean;
}) {
  return (
    <div className="bg-surface-sunken rounded-xl p-1.5">
      <pre
        className={`text-meta bg-surface-raised overflow-auto rounded-lg p-5 font-mono leading-relaxed [tab-size:2] ${
          scroll ? "max-h-[32rem]" : ""
        } ${wrap ? "whitespace-pre-wrap" : ""}`}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

/* File names carry dots and the anchor has to survive being put in a URL
   fragment and read back by `getElementById`. */
function fileId(name: string) {
  return `file-${name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}
