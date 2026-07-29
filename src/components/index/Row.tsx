import Link from "next/link";

import { Icon, iconGap } from "@/components/icon/Icon";
import { LogoSlot } from "@/components/logo/Logo";
import type { MarkName } from "@/components/logo/marks";

/* One row per artifact. The hover surface bleeds 12px outside the text
   column so the text itself never shifts; only the background arrives.

   Lifted out of app/page.tsx when the Work list gained previews: the
   list became a client component and Experience did not, so the row markup
   had to stop belonging to either of them. Nothing about the rendering
   changed in the move. */
export function Row({
  href,
  title,
  description,
  meta,
  logo,
  external = false,
  index,
  tabIndex,
}: {
  href: string;
  title: string;
  description: string;
  meta?: string;
  logo?: MarkName;
  external?: boolean;
  /* Position in the list that owns this row, published to the DOM as
     `data-row-index`. A data attribute rather than a callback prop because
     the surface above needs to find rows it did not receive an event from,
     the row two below the focused one, the row the pointer happens to be
     over, and a set of callbacks can only ever report the row that fired.
     Absent on rows that belong to no navigable list, which is how a keydown
     handler knows those rows aren't its business. */
  index?: number;
  /* Roving tabindex. The owning list keeps exactly one row at 0 and the rest
     at -1, so Tab enters and leaves the list in one press and the arrows do
     the moving inside it. Undefined leaves the link in the natural tab order,
     which is right for a row standing on its own. */
  tabIndex?: number;
}) {
  const className =
    "group block rounded-lg px-3 py-3 transition-colors duration-150 ease-out hover:bg-wash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

  const content = (
    /* The mark is a gutter beside the whole row, not a glyph inline with the
       title: the description hangs off the same left edge as the title
       rather than running back under the logo, so the text block stays a
       block and the marks stay a column. */
    <div className="flex gap-3">
      <LogoSlot name={logo} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <span
            className={`flex items-center ${iconGap("inline")} text-body font-medium text-foreground`}
          >
            {title}
            {/* `inline` is the 17px-body size, and the gap comes with it,
                gap-1 was 4px, close enough to the glyph to read as a
                collision rather than a pairing. */}
            {external && (
              <Icon
                name="external"
                className="text-foreground-faint transition-transform duration-150 ease-out group-hover:translate-x-px group-hover:-translate-y-px"
              />
            )}
          </span>
          {/* Date ranges stack vertically down the Experience list, so the
              digits are a column and want equal advance widths. */}
          {meta && <span className="text-meta shrink-0 text-foreground-faint tabular-nums">{meta}</span>}
        </div>
        <p className="text-body-sm mt-1 text-foreground-subtle">{description}</p>
      </div>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        data-row-index={index}
        tabIndex={tabIndex}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className} data-row-index={index} tabIndex={tabIndex}>
      {content}
    </Link>
  );
}
