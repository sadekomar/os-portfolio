import type { ReactNode } from "react";

import { SequenceLineNav, SequenceRail } from "@/components/sequence/LineNav";
import { showcaseComponents } from "@/data/components";

/* One column at the site's measure, with the set parked in the left margin.

   This was a three column flex shell at `max-w-7xl`, which gave these two
   pages a width nothing else here has. The navbar, the footer, the index,
   the blog and the case studies all resolve to the same 640px column, so a
   page running to 1280 read as a different site wearing the same header:
   its h1 started ~300px left of the wordmark directly above it.

   The rail is the case studies' rail, not a second one shaped like it, and
   everything about where it stands (absolute rather than a flex sibling, the
   1440 breakpoint, the scroll box) now lives in SequenceRail. See LineNav.

   `align="top"` is the one thing this page asks for that a case study
   doesn't: there is a table of contents anchored at the top of the right
   margin, and a centred rail against it reads as one of the two having
   slipped.

   The pager's TooltipProvider used to sit here, so its two tooltips would
   share one open delay. It moved into the pager itself, which is where it
   belongs: the requirement was never about this page, it was about that
   pair, and the posts and case studies need it too. */
export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full">
      <SequenceRail align="top">
        <SequenceLineNav
          label="Components"
          items={showcaseComponents.map((component) => ({
            title: component.title,
            href: `/components/${component.slug}`,
          }))}
        />
      </SequenceRail>

      {children}
    </div>
  );
}
