/* The one place the site's own origin is written down.

   It used to be a `const siteUrl` copied into five files: the root layout,
   robots, the sitemap, and both dynamic page segments. Five copies of a
   hostname is four chances for a canonical, a sitemap entry and a schema
   @id to disagree about which host the site actually lives on, and that
   disagreement is invisible locally: every one of them still builds, still
   renders, and only ever misreports itself to a crawler.

   Apex, no `www`, no trailing slash. The trailing slash matters because
   every use site appends a path to this string. */
export const siteUrl = "https://sadekomar.com";
