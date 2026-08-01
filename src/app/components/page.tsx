import type { Metadata } from "next";
import Link from "next/link";

import { showcaseComponents } from "@/data/components";
import { siteUrl } from "@/lib/site";

const DESCRIPTION =
  "Interface components pulled out of the products they were built for, running here as they shipped.";

export const metadata: Metadata = {
  title: "Components",
  description: DESCRIPTION,
  /* Relative, resolved against the `metadataBase` in the root layout. This
     page had no canonical at all, which on a URL that is reachable as
     /components and /components/ and with any tracking parameter appended is
     an invitation to a crawler to treat each of those as its own page. */
  alternates: { canonical: "/components" },
  openGraph: {
    type: "website",
    url: "/components",
    title: "Components | Omar Sadek",
    description: DESCRIPTION,
    siteName: "Omar Sadek",
  },
  /* Declared rather than inherited, for the reason spelled out on /blog:
     metadata merges shallowly, so with no `twitter` object of its own this
     page was unfurling on X with the *homepage's* title and description,
     which said nothing about components to anyone who saw the card. The
     card image itself comes from opengraph-image.tsx in this segment and is
     deliberately not named here, since Next appends the file-convention
     image and a second one would emit two tags. */
  twitter: {
    card: "summary_large_image",
    title: "Components | Omar Sadek",
    description: DESCRIPTION,
    creator: "@omarsadekk",
  },
};

/* The index as an entity, so the six pages under it are read as a set rather
   than as six unrelated URLs that happen to share a path prefix. The
   `isPartOf` reference ties it to the WebSite node the root layout defines,
   the same way the essays and the case studies tie themselves in.

   The list carries only what the page itself renders: each component's name,
   its one-line description and its URL. Nothing about how it was built, and
   no ratings or counts, because none of that is on the page to corroborate
   it. */
const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${siteUrl}/components#collection`,
  url: `${siteUrl}/components`,
  name: "Components",
  description: DESCRIPTION,
  isPartOf: { "@id": `${siteUrl}/#website` },
  author: { "@id": `${siteUrl}/#person` },
  inLanguage: "en",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: showcaseComponents.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: showcaseComponents.map((component, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: component.title,
      description: component.description,
      url: `${siteUrl}/components/${component.slug}`,
    })),
  },
};

/* The index is the blog index with a project name where the date goes: one
   column at the site's measure, a 24px heading, one row per artifact, no
   thumbnails. It used to open at 32px over a 19px lede, which is a register
   nothing else here uses, and separated its rows with a hairline rule, which
   is a drawn edge in a system that has none. Both are gone: the rows are
   told apart by the same hover wash the rest of the site's lists use. */
export default function ComponentsIndex() {
  return (
    <main className="max-w-measure-gutter text-body mx-auto w-full px-6 pt-16 pb-24 md:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <div className="mb-12">
        <h1 className="text-headline text-foreground mb-4 font-medium">Components</h1>
        <p className="max-w-measure text-body text-foreground-muted">{DESCRIPTION}</p>
        <p className="max-w-measure text-body-sm text-foreground-subtle mt-3">
          Each one is the real file, lifted out of a shipped product with its data frozen and its
          network calls removed, not a demo rebuilt to look like it. Where something had to change
          to run here, the page for it says so.
        </p>
      </div>

      {/* -mx-3 so the hover fill bleeds past the text column without the
          text itself moving, and `reveal` for the 8px of entry travel, both
          the same as the blog index. A list of components is that list. */}
      <ul className="reveal -mx-3">
        {showcaseComponents.map((component) => (
          <li key={component.slug}>
            {/* The guided tour's handle on this list, the same shape the Work
                rows carry (`row:<href>` there, `component:<slug>` here): one
                per row rather than a marker on whichever row the tour happens
                to want, so reordering `showcaseComponents` cannot silently
                move the hook onto a different component. See
                components/tour/script.ts. */}
            <Link
              href={`/components/${component.slug}`}
              data-tour={`component:${component.slug}`}
              className="group ease-out-quint hover:bg-wash focus-visible:ring-ring/20 block rounded-lg px-3 py-3 transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-body text-foreground font-medium">{component.title}</h2>
                <span className="text-meta text-foreground-faint shrink-0">
                  {component.project.name}
                </span>
              </div>
              <p className="text-body-sm text-foreground-subtle mt-1">{component.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
