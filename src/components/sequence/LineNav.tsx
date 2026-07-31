"use client";

import { memo, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/* ── The line rail ────────────────────────────────────────────────────────
   A whole sequence parked in the page's left margin, with the current entry
   marked by a longer line rather than a filled row. One component for the
   case studies, the components and the posts.

   It was two: the case studies' rail and the components' rail, the second
   one built later with a comment saying it was "the same idea" as the first
   "so the two rails read as one device rather than two". They then drifted
   in ways nobody chose. The spring was a CSS transition on one, the ruled
   ticks between entries were missing, the markup was a column of anchors
   rather than a list, and only one of them knew how to get out of the way of
   a full-bleed image. Each had something the other lacked, which is the
   usual shape of a duplicate. This is both of them.

   Every title is set, so the rail is a contents page rather than a position
   indicator: someone landing on one entry from search can see what else
   there is without going back to the index. What keeps it from reading as a
   second column of prose beside the first is tone and size: 13px at 40%
   black against 16px at 66%, and a measure a third the width. It recedes; it
   doesn't compete.

   The marks are lines and not dots or bullets for the same reason the rest
   of the site has no boxes or rules: length is the only thing that has to
   change, and a line can say it without a container.

   24 → 40px is the only movement. It's enough to spot from the corner of the
   eye at a glance down the rail, and small enough that a hover doesn't shove
   anything.

   A real `nav` with a list inside it rather than a column of anchors,
   because a screen reader should be able to say how many entries there are
   and skip the lot in one gesture.

   Hidden below the breakpoint where the margin actually exists: cramming it
   above the header would turn a peripheral aid into a wall of links between
   the reader and the page. The header's arrows and J/K cover the same ground
   there.

   ── Yielding to the images ──
   A case study's images are full-bleed by design. They run to 12px of the
   viewport, which is the same margin the rail is standing in. Somebody has
   to give, and it isn't the images: they're the case study, the rail is an
   aid. So the rail fades out for exactly as long as a bleed track is beside
   it, and comes back over the prose. Pages with nothing marked
   `data-case-bleed` never pay for this.

   The alternative was to reserve the rail's width as page padding at this
   breakpoint, which reads as the safer fix and is the worse one: it insets
   every image by ~350px on both sides to keep one column of 13px labels
   permanently on screen, and a page whose whole argument is a still column
   with film running past it loses the film. Fading costs the rail nothing:
   it's back within 200ms, and it was never the thing being read. */

const lineVariants = {
  normal: { width: 24 },
  active: { width: 40 },
  hover: { width: 40 },
};

export type LineNavItem = {
  title: string;
  href: string;
};

export function SequenceLineNav({
  className,
  label,
  items,
  activeHref,
}: {
  className?: string;
  /** Names the sequence: "Case studies", "Components", "Writing". */
  label: string;
  items: LineNavItem[];
  /** Omit it and the current route is the answer, which is what a rail
      rendered from a layout has to do: a layout is a server component and
      cannot read the path, and passing the slug down through one would mean
      making the layout dynamic to tell the rail something it can see for
      itself. Pages that already hold the slug pass it and skip the
      comparison. */
  activeHref?: string;
}) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;
  const navRef = useRef<HTMLElement>(null);
  const obscured = useObscuredByMedia(navRef);
  useRevealActive(navRef);

  return (
    <nav
      ref={navRef}
      aria-label={label}
      /* aria-hidden and not `hidden`/unmounted while faded: the rail is a
         visual aid yielding to a picture, and none of that is a reason for a
         screen reader or the tab order to lose the list halfway down the
         page. The state is purely optical, so only opacity carries it,
         `inert` keeps the invisible links from taking a click. */
      inert={obscured}
      className={cn(
        "py-5 transition-opacity duration-200 ease-out",
        obscured && "opacity-0",
        className,
      )}
      style={{ "--line-nav-width": `${lineVariants.normal.width}px` } as React.CSSProperties}
    >
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <NavItem
            key={item.href}
            title={item.title}
            href={item.href}
            active={item.href === current}
            isLast={index === items.length - 1}
          />
        ))}
      </ul>
    </nav>
  );
}

/* True while any full-bleed track is level with the rail *and* wide enough
   to reach it.

   Both halves matter. Vertically, the observer's root is shrunk by
   rootMargin to exactly the rail's own band (the rail is sticky, so that
   band is a constant) and anything intersecting it is beside the rail.
   Horizontally, the track's own left edge is compared against the rail's
   right edge, because a single image caps at 1036px and centres: on a 2560px
   display it clears the rail entirely, and there's no reason to fade for it
   there.

   An observer rather than a scroll listener because this asks a question
   about geometry, not about scrolling, so it costs nothing while the page is
   still, and it doesn't fire on frames where the answer can't have changed. */
function useObscuredByMedia(navRef: React.RefObject<HTMLElement | null>) {
  const [obscured, setObscured] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const media = document.querySelectorAll<HTMLElement>("[data-case-bleed]");
    if (media.length === 0) return;

    let observer: IntersectionObserver | undefined;

    const observe = () => {
      observer?.disconnect();

      const rail = nav.getBoundingClientRect();
      /* Measured, not assumed: the rail's height is however many titles at
         whatever the reader's font size resolves to, which isn't a number to
         hardcode. */
      const above = Math.max(0, rail.top);
      const below = Math.max(0, window.innerHeight - rail.bottom);

      observer = new IntersectionObserver(
        () => {
          /* The entries say *something crossed*; the answer is then read off
             every track, because an entry only speaks for its own element and
             one leaving the band can't clear the one entering it. */
          setObscured(
            [...media].some((element) => {
              const box = element.getBoundingClientRect();
              return box.left < rail.right && box.bottom > rail.top && box.top < rail.bottom;
            }),
          );
        },
        { rootMargin: `-${above}px 0px -${below}px 0px` },
      );

      media.forEach((element) => observer?.observe(element));
    };

    observe();

    /* The band moves with the viewport, and the horizontal test moves with
       it too, so both are rebuilt on resize. */
    window.addEventListener("resize", observe);
    return () => {
      window.removeEventListener("resize", observe);
      observer?.disconnect();
    };
  }, [navRef]);

  return obscured;
}

/* Brings the current entry into view when the rail is taller than the box
   holding it. A rail parked at the top of a long list would otherwise show
   its first entries with no sign that the page you are on is further down.

   It scrolls the rail's own scroll box and never the window, which is why
   this is written out rather than left to `scrollIntoView({ block:
   "nearest" })`: that method walks *every* scrollable ancestor, and on the
   pages where the rail is vertically centred and has no box of its own, the
   ancestor it would find is the document. Landing on a case study would
   scroll the reader down the page to meet the rail. */
function useRevealActive(navRef: React.RefObject<HTMLElement | null>) {
  const pathname = usePathname();

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current='page']");
    if (!nav || !active) return;

    const box = scrollBoxOf(nav);
    if (!box) return;

    const item = active.getBoundingClientRect();
    const frame = box.getBoundingClientRect();
    /* Half the rail's own gap, so the entry that gets pulled in doesn't sit
       flush against the edge it just came from. */
    const air = 16;

    if (item.top < frame.top + air) {
      box.scrollTop -= frame.top + air - item.top;
    } else if (item.bottom > frame.bottom - air) {
      box.scrollTop += item.bottom - (frame.bottom - air);
    }
  }, [navRef, pathname]);
}

function scrollBoxOf(element: HTMLElement) {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return null;
}

const MotionLink = motion.create(Link);

const NavItem = memo(function NavItem({
  title,
  href,
  active = false,
  isLast = false,
}: {
  title: string;
  href: string;
  active?: boolean;
  isLast?: boolean;
}) {
  return (
    /* The row and its two trailing ticks are one list item on the same 8px
       rhythm as the list itself, so the rail is a flat ruled column
       optically and a real list structurally. `display: contents` would
       have been the tidier way to say that and is not safe on an `li`:
       several engines drop the item out of the accessibility tree with it,
       which is the one thing the list was added for. */
    <li className="flex flex-col gap-2">
      {/* The row is a 1px line; the `after` pseudo-element pads the hit area
          back out to a comfortable target without giving the mark any height
          of its own. */}
      <MotionLink
        href={href}
        aria-current={active ? "page" : undefined}
        prefetch
        className="group focus-visible:ring-ring/20 relative flex h-px items-center gap-3 rounded-sm after:absolute after:top-1/2 after:left-0 after:size-full after:-translate-y-1/2 after:p-3.5 focus-visible:ring-2 focus-visible:outline-none"
        initial={false}
        animate={active ? "active" : "normal"}
        whileHover="hover"
      >
        <motion.span
          className="bg-foreground/15 group-hover:bg-foreground group-aria-[current=page]:bg-foreground block h-px shrink-0 transition-colors duration-150 ease-out"
          variants={lineVariants}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
        {/* Every title is legible at rest. The rail names the whole sequence,
            not just the entry you're on. Only tone separates them: the
            current one solid, the rest at 40%, the same two weights the meta
            list under a case study's intro uses for label vs value. */}
        <span className="text-case-caption text-foreground-faint group-hover:text-foreground group-aria-[current=page]:text-foreground whitespace-nowrap transition-colors duration-150 ease-out">
          {title}
        </span>
      </MotionLink>

      {/* Two spacer ticks between entries, so the rail reads as a continuous
          ruled measure rather than a column of separate dashes. */}
      {!isLast && (
        <>
          <span className="bg-foreground/15 block h-px w-[var(--line-nav-width)]" />
          <span className="bg-foreground/15 block h-px w-[var(--line-nav-width)]" />
        </>
      )}
    </li>
  );
});

/* ── Where the rail stands ────────────────────────────────────────────────
   Absolutely positioned rather than a flex sibling, because a sibling takes
   its width out of the row, which pushes the reading column off centre. The
   navbar, the footer, the index, the blog, the components and the case
   studies all resolve to the same 640px column, and the rail is not allowed
   to be the one thing that breaks that alignment. Positioned, it costs the
   column nothing and simply isn't there below the width where the margin
   exists.

   `min-[1440px]` is that width, and it is one number for all three pages:
   the widest title plus a clear 48px of air before the column starts is the
   arithmetic, and it lands between xl and 2xl. Below it the index is one
   click away in the navbar and the header's pager and keys cover the same
   ground.

   Every page centres the rail: it holds itself at eye height for the whole
   scroll, and a sequence that fits the viewport needs no scroll box. The
   components pages were the exception and parked theirs at the top, to line
   up with the table of contents in the opposite margin; that turned out to
   read as six lines stranded at the top of a long page, and they now centre
   with the rest. See app/components/layout.tsx.

   `align="top"` survives that change because the reason for it will come
   back the moment a sequence outgrows the viewport: it is the alignment that
   gets a scroll box, and a centred rail has nowhere to put one. Nothing
   passes it today. */
export function SequenceRail({
  side = "left",
  align = "center",
  children,
}: {
  side?: "left" | "right";
  align?: "center" | "top";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 hidden min-[1440px]:block",
        side === "left" ? "left-0" : "right-0",
      )}
    >
      <div
        className={cn(
          "sticky",
          side === "left" ? "pl-8" : "pr-8",
          align === "center"
            ? "top-1/2 -translate-y-1/2"
            : "top-24 max-h-[calc(100vh-8rem)] overflow-y-auto",
        )}
      >
        {children}
      </div>
    </div>
  );
}
