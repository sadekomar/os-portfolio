import type { MetadataRoute } from "next";

import { posts } from "@/data/posts";
/* The same list the routes are generated from, rather than a second copy of
   it. projects.ts already calls itself the source of truth for the static
   params and the prev/next pager; a hand-maintained array here was a third
   place to remember, and the one whose omission is silent: a case study
   left out of the sitemap still builds, still renders, and simply never
   gets submitted. */
import { projectOrder } from "@/app/work/[project]/projects";

const siteUrl = "https://sadekomar.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    /* /blog was omitted alongside /talks while both were noindex,
       submitting a URL you have asked not to be indexed is a contradictory
       signal. There are posts now, so /blog is back and its `noindex` is
       gone. /talks stays out until the TODO dates and titles in
       data/talks.ts are real.

       /blog is also the one route here with a `changeFrequency` faster than
       monthly, because it is the only part of the site that gains a page
       rather than being revised. */
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    /* Each post carries its own publication date rather than `now`. A
       lastModified that moves on every rebuild tells a crawler the entire
       archive changed, and after a few of those it stops believing any of
       them. */
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...projectOrder.map((slug) => ({
      url: `${siteUrl}/work/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
