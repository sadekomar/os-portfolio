import type { MetadataRoute } from "next";

import { componentSlugs } from "@/data/components";
import { LAST_MODIFIED_FALLBACK, lastModified } from "@/data/lastModified";
import { posts } from "@/data/posts";
import { resolveLastModified } from "@/lib/lastmod";
import { siteUrl } from "@/lib/site";
/* The same list the routes are generated from, rather than a second copy of
   it. projects.ts already calls itself the source of truth for the static
   params and the prev/next pager; a hand-maintained array here was a third
   place to remember, and the one whose omission is silent: a case study
   left out of the sitemap still builds, still renders, and simply never
   gets submitted. */
import { projectOrder } from "@/app/work/[project]/projects";

/* Every date in this file is a real one. It used to be `new Date()` for
   thirteen of the twenty URLs, which meant a crawler reading the sitemap
   after any deploy was told that the homepage, every case study and every
   component page had all changed at the same instant. Do that a few times
   and the field stops being read: lastmod is a claim a crawler verifies
   for free, by comparing what it refetches against what it already had, so
   a host that overstates it is quickly and permanently discounted.

   The dates now come from git, via scripts/generate-last-modified.mjs,
   which resolves each route to the files it is rendered from and records
   the last commit that touched them. See that script for why the lookup
   happens at build rather than here.

   `changeFrequency` and `priority` below are decoration. Google dropped
   both years ago and Bing only nominally reads priority. They are kept
   because they cost nothing and describe the site accurately, but nothing
   should be reasoned about on their basis. */
/* A route absent from the generated map, or a map written by a build that
   could not reach git, must not produce `Invalid Date`: Next serialises that
   to an empty `<lastmod>` element and the whole sitemap fails schema
   validation, taking the nineteen good URLs with it. The guard itself lives in
   lib/lastmod.ts, where both failure modes are pinned by tests. */
function modified(route: string): Date {
  return resolveLastModified(lastModified, route, LAST_MODIFIED_FALLBACK);
}

export default function sitemap(): MetadataRoute.Sitemap {
  /* Every case study lives in one module, so they genuinely do change
     together: an edit to any of them rewrites the file the rest are
     read from. One shared date is the honest answer here, not a
     simplification. */
  const workModified = modified("/work");

  return [
    { url: siteUrl, lastModified: modified("/"), changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteUrl}/about`,
      lastModified: modified("/about"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    /* /blog was omitted alongside /talks while both were noindex, because
       submitting a URL you have asked not to be indexed is a contradictory
       signal. Both are back: /blog when it had posts, /talks now that the
       placeholder line in data/talks.ts is filled in and its `noindex` has
       come off. The rule those two omissions encoded is the one to keep:
       this list and the routes' own `robots` have to agree, and the sitemap
       is the copy that gets noticed last.

       /blog is also the one route here with a `changeFrequency` faster than
       monthly, because it is the only part of the site that gains a page
       rather than being revised. */
    {
      url: `${siteUrl}/blog`,
      lastModified: modified("/blog"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    /* Each post carries its own publication date rather than a build time.
       These are the one set of dates that never needed git: a post's date
       is content, written down in data/posts.ts, and it is what the page
       itself displays. */
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...projectOrder.map((slug) => ({
      url: `${siteUrl}/work/${slug}`,
      lastModified: workModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    /* Same reasoning as the work pages: one list, read from the registry
       the routes are generated from, so a component added there is in the
       sitemap without anyone remembering to put it here. */
    {
      url: `${siteUrl}/components`,
      lastModified: modified("/components"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    /* These do differ per page, because each component owns a directory
       under src/components/showcase. A component page's date moves when
       that component's source moves, or when the shared route shell or the
       registry entry that describes it does, which is exactly the set of
       changes a visitor to that URL would see. */
    ...componentSlugs.map((slug) => ({
      url: `${siteUrl}/components/${slug}`,
      lastModified: modified(`/components/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    /* `yearly`, and the only route here that gets it: a talk is a fixed event
       that happened on a date, so this page changes when a new one is added
       and essentially never otherwise. Overstating it would be the same
       mistake as the build-time dates this file was written to remove.

       Priority above the component pages and below /blog. It is third-party
       evidence (someone else's stage, someone else's invitation), which is a
       different kind of claim from anything self-published here. */
    {
      url: `${siteUrl}/talks`,
      lastModified: modified("/talks"),
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];
}
