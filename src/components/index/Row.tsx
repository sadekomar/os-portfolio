import Link from "next/link";

import { Icon, iconGap } from "@/components/icon/Icon";
import { LogoSlot } from "@/components/logo/Logo";
import type { MarkName } from "@/components/logo/marks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* One row per artifact. The hover surface bleeds 12px outside the text
   column so the text itself never shifts; only the background arrives.

   Lifted out of app/page.tsx when the Work list gained previews: the
   list became a client component and Experience did not, so the row markup
   had to stop belonging to either of them. Nothing about the rendering
   changed in the move.

   ── Why the link no longer wraps the row ────────────────────────────────
   It used to, and that was the obvious shape right up until one row needed a
   second destination in it: the Loom row carries a V-Lab credential that
   should open the pitch on /talks while the row itself still goes to the
   case study. An <a> inside an <a> is not a thing HTML has: the parser
   closes the first one at the second's start tag, so the row would have
   silently become two sibling links with the layout falling apart between
   them.

   So the anchor is now a transparent overlay pinned to the row's box
   (`absolute inset-0`) and the content is its sibling underneath. Everything
   the row already promised survives that move: the overlay is what the
   pointer hits, so `closest("[data-row-index]")` in WorkRows still resolves
   from any event over the row; it is the focusable element, so the roving
   tabindex and `el.focus()` still address it; and `inset-0` means its
   bounding box is the wrapper's, so the preview panel anchors exactly where
   it did. A badge, being a real sibling with a z-index, sits above the
   overlay and takes its own clicks.

   The one real change is the link's accessible name. It used to be the whole
   row read out (title, description and date range in one breath) and it is
   now the title alone, because the description is no longer inside it. That
   is the better answer anyway: a screen reader's link list should say
   "Wholana", not "Wholana Founder and engineer Mar 2026 – Present". The
   description has not gone anywhere; it is still in the reading order,
   directly after the link, where it reads as the sentence it is. */

/* The visual surface, on the wrapper rather than on the anchor.

   The press dip is 1%, not the 3% a button gets: this row is the full width
   of the column, and the same percentage across that much surface reads as
   the page flinching rather than as a control responding. It is enough to
   confirm the click landed, which is the only job.

   `transition-[background-color,scale]` rather than `transition-colors` plus
   a second utility, and never `all`: `all` would also animate the focus ring,
   and a focus ring that fades in is a focus ring that is late for the one
   reader who needs it.

   `:hover` and `:active` on the wrapper still describe the anchor's state,
   because both match ancestors of the element the pointer is on. The focus
   ring cannot be written that way, because `:focus-visible` matches only
   the focused element, so it is keyed off the overlay specifically with
   `has-*`. Keying it off a bare `a` instead would light the whole row when
   the badge inside it takes focus, which would say the wrong thing about
   where Enter goes. */
const surface =
  "group relative rounded-lg px-3 py-3 transition-[background-color,scale] duration-150 ease-out-quint hover:bg-wash active:scale-[0.99] has-[[data-row-link]:focus-visible]:ring-2 has-[[data-row-link]:focus-visible]:ring-ring/20";

/* The overlay itself draws nothing. `rounded-lg` is still worth carrying so
   that a browser painting its own focus ring (forced-colours mode, where the
   `has-*` ring above is dropped) traces the row's corners rather than a
   rectangle over them. */
const overlay = "absolute inset-0 rounded-lg focus-visible:outline-none";

/* A credential hung off the row's title: small, quiet, and a link of its own.

   It reads as an annotation on the title rather than as a second row action,
   which is why it takes the meta size and the wash fill rather than anything
   that looks pressable. The tooltip is what says it goes somewhere; the chip
   only says the credential exists. */
export type RowBadge = {
  label: string;
  /* The credential's own home, and the chip goes there: a badge that claims
     an accelerator should link to the accelerator. */
  href: string;
  /* The tooltip's copy, and the second destination. The chip can only have
     one href, and there are two things a reader might want from a
     credential: the institution that granted it, and the evidence that it
     was granted. The chip is the first; this is the second. */
  tooltip: { text: string; link: { label: string; href: string } };
};

export function Row({
  href,
  title,
  description,
  meta,
  logo,
  external = false,
  badge,
  index,
  tabIndex,
  tourId,
}: {
  href: string;
  title: string;
  description: string;
  meta?: string;
  logo?: MarkName;
  external?: boolean;
  /* Optional second destination, rendered beside the title. See RowBadge. */
  badge?: RowBadge;
  /* Position in the list that owns this row, published to the DOM as
     `data-row-index`. A data attribute rather than a callback prop because
     the surface above needs to find rows it did not receive an event from,
     the row two below the focused one, the row the pointer happens to be
     over, and a set of callbacks can only ever report the row that fired.
     Absent on rows that belong to no navigable list, which is how a keydown
     handler knows those rows aren't its business. */
  index?: number;
  /* A stable name for this row, published as `data-tour`, so the guided tour
     can aim at "the Wholana row" rather than at a position in a list. It is
     the href because the href is the one thing about a row that is already
     unique and already can't drift: a slug repeated here would be a second
     copy to keep in sync, and an index would silently point at a different
     project the day the list is reordered. See components/tour/script.ts. */
  tourId?: string;
  /* Roving tabindex. The owning list keeps exactly one row at 0 and the rest
     at -1, so Tab enters and leaves the list in one press and the arrows do
     the moving inside it. Undefined leaves the link in the natural tab order,
     which is right for a row standing on its own. */
  tabIndex?: number;
}) {
  const linkProps = {
    className: overlay,
    /* The name the link carries now that the row's text is outside it. */
    "aria-label": title,
    /* The hook the focus ring above is keyed off, and the one thing that
       distinguishes the row's own link from a badge inside it. */
    "data-row-link": "",
    "data-row-index": index,
    "data-tour": tourId,
    tabIndex,
  };

  return (
    <div className={surface}>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" {...linkProps} />
      ) : (
        <Link href={href} {...linkProps} />
      )}

      {/* The mark is a gutter beside the whole row, not a glyph inline with the
          title: the description hangs off the same left edge as the title
          rather than running back under the logo, so the text block stays a
          block and the marks stay a column. */}
      <div className="flex gap-3">
        <LogoSlot name={logo} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <span
              className={`flex items-center ${iconGap("inline")} text-body text-foreground font-medium${
                badge ? " flex-wrap" : ""
              }`}
            >
              {title}
              {/* `inline` is the 17px-body size, and the gap comes with it,
                  gap-1 was 4px, close enough to the glyph to read as a
                  collision rather than a pairing. */}
              {external && (
                <Icon
                  name="external"
                  className="text-foreground-faint ease-out-quint transition-transform duration-150 group-hover:translate-x-px group-hover:-translate-y-px"
                />
              )}
              {badge && <Badge {...badge} />}
            </span>
            {/* Date ranges stack vertically down the Experience list, so the
                digits are a column and want equal advance widths. */}
            {meta && (
              <span className="text-meta text-foreground-subtle shrink-0 tabular-nums">{meta}</span>
            )}
          </div>
          <p className="text-body-sm text-foreground-subtle mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* `relative z-10` is the whole trick: the overlay is a positioned sibling
   earlier in the DOM, so without a stacking context of its own this chip
   would paint under it and every click would go to the row.

   `shrink-0` so a narrow column eats the title before it eats the
   credential: a truncated "V-Lab ’2" is worse than a wrapped title. */
function Badge({ label, href, tooltip }: RowBadge) {
  return (
    /* `disableHoverableContent={false}`, against the provider's own default.

       That default is there because the tooltips on this site hold a line of
       text with nothing to reach for, and keeping the grace region costs a
       pointermove-time polygon test per move, which is real money on the
       Stack table, where the next trigger is two pixels away and the cursor
       is permanently inside the previous tooltip's hull.

       Neither half of that applies here. This tooltip holds a link, so the
       cursor has to be able to cross the 8px gap without it closing, and
       there is exactly one trigger on the page rather than a row of sixty,
       so the hull is tested against nothing. The default is right and this
       exception is right; they are answering different questions. */
    <TooltipProvider disableHoverableContent={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-meta text-foreground-subtle bg-wash hover:text-foreground focus-visible:ring-ring/20 relative z-10 ml-0.5 shrink-0 rounded-full px-2 py-0.5 font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
          >
            {label}
          </a>
        </TooltipTrigger>
        {/* The one link on this site that is only reachable with a pointer.
            Radix renders tooltip content in a portal and outside the tab
            order, which is what a tooltip is, so a keyboard or a touchscreen
            never gets to this anchor.

            That is acceptable here and would not be everywhere: /talks is in
            the primary nav, the Loom case study links to the pitch, and the
            pitch is on the talks page under its own heading. Nothing becomes
            unreachable; a shortcut exists for the readers who happen to
            hover. If this were the only route to the recording it would have
            to be a popover with a real focus trap, and the chip would have to
            stop being a link to open it. */}
        <TooltipContent side="top" className="gap-1">
          {tooltip.text}{" "}
          <Link
            href={tooltip.link.href}
            className="decoration-foreground-ghost hover:decoration-foreground underline underline-offset-[3px] transition-colors duration-150"
          >
            {tooltip.link.label}
          </Link>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
