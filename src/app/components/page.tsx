import type { Metadata } from "next";
import Link from "next/link";

import { showcaseComponents } from "@/data/components";

const DESCRIPTION =
  "Interface components pulled out of the products they were built for, running here as they shipped.";

export const metadata: Metadata = {
  title: "Components",
  description: DESCRIPTION,
  openGraph: { title: "Components | Omar Sadek", description: DESCRIPTION, type: "website" },
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
