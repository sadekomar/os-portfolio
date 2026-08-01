import Link from "next/link";

/* ── 404 ──────────────────────────────────────────────────────────────────
   Without this file the status code was already correct and the page was
   Next's built-in one: an unstyled line of text on a white sheet, outside
   the layout, with no route back into the site. The status was never the
   problem. The problem is that the most common way to arrive at a 404 here
   is a link that has rotted or a URL someone typed from memory, and in both
   cases the reader wanted a real page and is one click from it.

   No `metadata` export. A not-found page inherits the root title, which is
   the site's name, and that is the right thing for a tab that should not be
   advertising itself as a destination. Next serves this route with a 404
   status, so nothing indexes it regardless.

   The rows are the /blog index's rows: same -mx-3 bleed, same wash on
   hover, same press dip. They are a list of places on this site, which is
   the thing that list already means everywhere else here, and inventing a
   button treatment for the one page nobody meant to land on would be the
   only place on the site that has one. */
export default function NotFound() {
  return (
    <main className="max-w-measure-gutter text-body mx-auto w-full px-6 pt-16 pb-24 md:pt-24">
      <div className="mb-12">
        <h1 className="text-headline text-foreground mb-4 font-medium">Page not found</h1>
        <p className="max-w-measure text-body text-foreground-muted">
          There is nothing at this address. The rest of the site is below.
        </p>
      </div>

      <nav className="-mx-3" aria-label="Site">
        {destinations.map((destination) => (
          <Link
            key={destination.href}
            href={destination.href}
            className="group ease-out-quint hover:bg-wash focus-visible:ring-ring/20 block rounded-lg px-3 py-3 transition-[background-color,scale] duration-150 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
          >
            <span className="text-body text-foreground font-medium">{destination.title}</span>
            <p className="text-body-sm text-foreground-subtle mt-1">{destination.description}</p>
          </Link>
        ))}
      </nav>
    </main>
  );
}

/* Work is the `/#work` fragment rather than `/work`, because `/work` is
   itself a 404: the case studies live under it but the index of them is a
   section of the home page. Sending someone who has just hit a 404 to a
   second one is the one mistake this page exists to avoid. */
const destinations = [
  { href: "/", title: "Home", description: "The index: experience, work, code, and the stack." },
  { href: "/#work", title: "Work", description: "Case studies, in full." },
  {
    href: "/components",
    title: "Components",
    description: "Components taken out of shipped products, one page each.",
  },
  { href: "/blog", title: "Blog", description: "Essays on the parts that took a second attempt." },
  { href: "/about", title: "About", description: "Where I am from and what I read." },
];
