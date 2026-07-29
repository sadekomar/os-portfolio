import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PostBody } from "@/components/blog/Prose";
import { Icon } from "@/components/icon/Icon";
import { formatDate, getPost, posts } from "@/data/posts";

export const dynamicParams = false;

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

const siteUrl = "https://sadekomar.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    /* `openGraph` replaces the layout's rather than merging into it, so
       everything but the image is restated here.

       The image is no longer among them: the per-post generated card this
       comment used to call for now exists at ./opengraph-image.tsx, and
       Next appends a file-convention image to whatever `images` this object
       lists rather than replacing it. Naming /me.png as well would emit two
       og:image tags and every scraper takes the first, so the portrait
       would win and the card would never be seen. */
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      siteName: "Omar Sadek",
      publishedTime: post.date,
      authors: ["Omar Sadek"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: "@omarsadekk",
    },
  };
}

/* ── The post page ────────────────────────────────────────────────────────
   The case study's voice at the index's width. It borrows the work pages'
   type scale (16/30.4 prose under a 24px serif italic heading) because
   both are long-form reading and the site only needs one register for that.
   What it doesn't borrow is the geometry: a case study has a second, full-
   bleed width for imagery, and a post has no imagery, so there is one
   column and nothing reaches past it.

   `surface-paper` rather than the canvas, matching the work pages. The
   argument there was screenshots; here it is simply that a long read wants
   the sheet it is printed on to be the brightest thing in the window. */
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const index = posts.findIndex((entry) => entry.slug === slug);
  /* `posts` is newest first, so the *next* entry in the array is the older
     post. Only one direction is offered, and it is backwards: at the end of
     a post the useful move is further into the archive, not back toward
     something the reader has already scrolled past on the index. */
  const older = posts[index + 1];

  const url = `${siteUrl}/blog/${post.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  /* BlogPosting, where the case studies are a CreativeWork. The difference
     is the date: a case study has a period the work ran and no publication
     date, so Article would have meant inventing one. A post genuinely has a
     day it went up, which is the field this type exists for.

     `author` is a reference rather than a second Person. The root layout
     already defines the node at /#person with the sameAs links that do the
     entity work, and a bare copy here would give a crawler two Omar Sadeks
     to reconcile instead of one to reinforce. */
  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.date,
    dateModified: post.date,
    /* The same card the share tags point at, named by its stable path rather
       than the hashed URL Next puts in og:image. The `?hash` there is a
       cache-buster that changes whenever the card's content does, and a
       structured-data field is read by crawlers that revisit on their own
       schedule. Article rich results take their thumbnail from this; without
       it the post is eligible for the result and has no image to show. */
    image: {
      "@type": "ImageObject",
      url: `${url}/opengraph-image/card`,
      width: 1200,
      height: 630,
    },
    author: { "@id": `${siteUrl}/#person` },
    publisher: { "@id": `${siteUrl}/#person` },
    isPartOf: { "@id": `${siteUrl}/#website` },
    inLanguage: "en",
  };

  return (
    <article className="bg-surface-paper py-20 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, postJsonLd]) }}
      />

      <div className="max-w-measure-gutter mx-auto flex w-full flex-col px-6">
        <Link
          href="/blog"
          className="text-case-caption inline-flex w-fit items-center gap-1.5 rounded-sm text-foreground-faint transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none"
        >
          <Icon name="back" size="micro" />
          Writing
        </Link>

        <header className="mt-16 flex flex-col gap-3">
          {/* The one place on a post the serif runs past 24px, the same
              40px italic that titles a case study, so a post and a project
              open in the same voice. */}
          <h1 className="text-case-title font-serif italic text-foreground">{post.title}</h1>
          <time dateTime={post.date} className="text-case-caption text-foreground-faint">
            {formatDate(post.date)}
          </time>
        </header>

        {/* 64 between the header and the body, 16 between blocks. The two
            inner numbers from the case-study rhythm. The 80 that separates
            one project moment from the next has no equivalent here: a post
            is continuous prose, and its section breaks are carried by the
            serif headings rather than by space. */}
        <div className="mt-16 flex flex-col gap-4">
          <PostBody blocks={post.blocks} />
        </div>

        {older && (
          <nav aria-label="More writing" className="mt-20">
            <Link
              href={`/blog/${older.slug}`}
              className="group flex flex-col gap-1 rounded-sm focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none"
            >
              <span className="text-case-caption text-foreground-faint">Previously</span>
              {/* No hover surface, matching the case-study pager: a filled
                  rectangle is a drawn edge, and these pages don't have any.
                  The wave under the title is the hit state. */}
              <span className="case-link text-case-heading font-serif italic decoration-transparent group-hover:decoration-wave">
                {older.title}
              </span>
            </Link>
          </nav>
        )}
      </div>
    </article>
  );
}
