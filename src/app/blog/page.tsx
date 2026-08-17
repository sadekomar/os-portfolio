import type { Metadata } from "next";

import Link from "next/link";

import { formatDate, posts } from "@/data/posts";
import { siteUrl } from "@/lib/site";

/* This page spent its life as two sentences of placeholder behind a
   `noindex`, which was the right call while there was nothing here: a thin
   page that ranks for nothing still spends crawl budget, and "Blog is coming
   soon." indexed under the name of the site is a worse first impression than
   no result at all.

   There are posts now, so the robots directive comes off and /blog goes back
   into sitemap.ts alongside every post. */
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Essays by Omar Sadek on design engineering: typography and layout shift in Next.js, and building a UI system with no borders and no shadows.",
  /* The feed's discovery tag is declared here rather than in the root
     layout, and not only because the layout would then advertise a blog
     feed from every page of the site. `alternates` is inherited verbatim by
     any page that doesn't override it, so a `types` entry at the root would
     also arrive on /about and each case study carrying the layout's
     canonical with it, which is the bug the note in layout.tsx describes.
     The page that owns the feed is the one that lists what is in it. */
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/feed.xml" },
  },
  /* `openGraph` and `twitter` are declared rather than inherited, and that
     is not belt-and-braces: metadata merges shallowly, so without these two
     objects the index page's card would be inherited *whole*, and a link to
     /blog would unfurl as "Omar Sadek | Product Engineer & Founder" with
     the homepage's description under it, and nothing about it would say
     the reader was being sent to a list of essays.

     No `images` key on either, on purpose. There is an opengraph-image.tsx
     in this segment and Next appends it to whatever is listed here; naming
     an image as well would emit two og:image tags and every scraper takes
     the first one. See the same note in about/page.tsx. */
  openGraph: {
    type: "website",
    url: "/blog",
    /* Suffixed with the name, matching the twitter title. og:title is
       the bold line of the unfurl and "Writing" on its own is a word, not
       a destination, and og:site_name is only rendered by some clients. */
    title: "Writing | Omar Sadek",
    description:
      "Essays on design engineering: typography and layout shift in Next.js, and building a UI system with no borders and no shadows.",
    siteName: "Omar Sadek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing | Omar Sadek",
    description:
      "Essays on design engineering: typography and layout shift in Next.js, and building a UI system with no borders and no shadows.",
    creator: "@omarsadekk",
  },
};

/* The index is the site's index in miniature: a column of text, one row per
   artifact, the date right-aligned in the same 13px tabular figures the Work
   and Experience lists use. No excerpts beyond the one-line description, no
   read-time estimate (a read time is a claim about the reader) and no
   thumbnails. Depth lives one click down. */
export default function Blog() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
    ],
  };

  /* `Blog` with a `blogPost` array, not `ItemList`. ItemList is the right
     type for an ordering that exists only on the listing page: a top ten, a
     set of search results, a carousel. This list is not that. It is every
     post there is, in publication order, on the page the posts belong to,
     and `Blog` is the type schema.org defines for exactly that relationship.
     ItemList would have described the ordering and said nothing about what
     was ordered, which is the half a crawler already has from the sitemap.

     Each entry reuses the `@id` the post's own page declares, `<url>#post`,
     so the two documents describe one node rather than two. That is the
     reason the entries are deliberately thin: headline, description, url,
     date, and nothing else. The post page is where that node is defined in
     full, with its image, its author reference and its dateModified, and a
     second partial copy under the same id is not extra information, it is
     an invitation to reconcile two versions of the same thing. */
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteUrl}/blog#blog`,
    name: "Writing",
    description:
      "Essays by Omar Sadek on design engineering: typography and layout shift in Next.js, and building a UI system with no borders and no shadows.",
    url: `${siteUrl}/blog`,
    mainEntityOfPage: `${siteUrl}/blog`,
    author: { "@id": `${siteUrl}/#person` },
    publisher: { "@id": `${siteUrl}/#person` },
    isPartOf: { "@id": `${siteUrl}/#website` },
    inLanguage: "en",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${siteUrl}/blog/${post.slug}#post`,
      headline: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  };

  return (
    <main className="max-w-measure-gutter text-body mx-auto w-full px-6 pt-16 pb-24 md:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, blogJsonLd]) }}
      />

      <div className="mb-12">
        <h1 className="text-headline text-foreground mb-4 font-medium">Writing</h1>
        <p className="max-w-measure text-body text-foreground-muted">
          Notes on the parts of the work that took a second attempt. Most of these started as a
          comment in a codebase, at the point where the decision was actually made.
        </p>
      </div>

      {/* -mx-3 so the hover fill on a row bleeds past the text column
          without the text itself moving, the same trick the index uses.

          `reveal`: each post arrives with 8px of travel as it enters, on the
          scroll timeline defined in globals.css. Posts already on screen at
          load are past their range and simply render, so the top of the list
          never animates at the reader. */}
      <div className="reveal -mx-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            /* Same press dip and same curve as components/index/Row: this
               list is that list, minus the logo gutter. */
            className="group ease-out-quint hover:bg-wash focus-visible:ring-ring/20 block rounded-lg px-3 py-3 transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-body text-foreground font-medium">{post.title}</span>
              <time
                dateTime={post.date}
                className="text-meta text-foreground-faint shrink-0 tabular-nums"
              >
                {formatDate(post.date)}
              </time>
            </div>
            <p className="text-body-sm text-foreground-subtle mt-1">{post.description}</p>
          </Link>
        ))}
      </div>

      {/* Under the list rather than beside the heading, and set in the same
          13px the dates are: a feed is for the reader who has already
          decided there is something here worth following, and they reach
          that decision at the bottom of the list, not above it.

          A plain anchor, not `next/link`. /feed.xml is a route handler
          rather than a page, so there is nothing for the router to
          prefetch, and a client navigation to it would only ever end in the
          browser handing the document straight back to the network. `px-3`
          lines it up with the text of the rows above, whose own padding the
          -mx-3 wrapper cancels. */}
      <p className="text-meta text-foreground-faint mt-8 px-3">
        <a
          href="/feed.xml"
          className="decoration-foreground-ghost hover:text-foreground-subtle hover:decoration-foreground-faint focus-visible:ring-ring/20 rounded-sm underline underline-offset-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
        >
          RSS
        </a>
      </p>
    </main>
  );
}
