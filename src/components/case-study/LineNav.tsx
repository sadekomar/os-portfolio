"use client";

import { memo, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/* ── Case-study line nav ──────────────────────────────────────────────────
   The whole sequence of work, parked in the left margin, with the current
   study marked by a longer line rather than a filled row.

   Every title is set, so the rail is a contents page for the work rather
   than a position indicator: someone landing on one study from search can
   see what else there is without going back to the index. What keeps it
   from reading as a second column of prose beside the first is tone and
   size: 13px at 40% black against 16px at 66%, and a measure a third the
   width. It recedes; it doesn't compete.

   The marks are lines and not dots or bullets for the same reason the rest
   of the page has no boxes or rules: length is the only thing that has to
   change, and a line can say it without a container.

   24 → 40px is the only movement. It's enough to spot from the corner of
   the eye at a glance down the rail, and small enough that a hover doesn't
   shove anything.

   Hidden below the breakpoint where the margin actually exists: cramming it
   above the header would turn a peripheral aid into a wall of links between
   the reader and the study. The header's arrows and J/K cover the same
   ground there.

   ── Yielding to the images ──
   The page's images are full-bleed by design. They run to 12px of the
   viewport, which is the same margin the rail is standing in. Somebody has
   to give, and it isn't the images: they're the case study, the rail is an
   aid. So the rail fades out for exactly as long as a bleed track is beside
   it, and comes back over the prose.

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

export function CaseStudyLineNav({
  className,
  items,
  activeHref,
}: {
  className?: string;
  items: LineNavItem[];
  activeHref?: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const obscured = useObscuredByMedia(navRef);

  return (
    <nav
      ref={navRef}
      aria-label="Case studies"
      /* aria-hidden and not `hidden`/unmounted while faded: the rail is a
         visual aid yielding to a picture, and none of that is a reason for a
         screen reader or the tab order to lose the list halfway down the
         page. The state is purely optical, so only opacity carries it,
         `inert` keeps the invisible links from taking a click. */
      inert={obscured}
      className={cn(
        "flex flex-col gap-2 py-5 transition-opacity duration-200 ease-out",
        obscured && "opacity-0",
        className
      )}
      style={{ "--line-nav-width": `${lineVariants.normal.width}px` } as React.CSSProperties}
    >
      {items.map((item, index) => (
        <NavItem
          key={item.href}
          title={item.title}
          href={item.href}
          active={item.href === activeHref}
          isLast={index === items.length - 1}
        />
      ))}
    </nav>
  );
}

/* True while any full-bleed track is level with the rail *and* wide enough to
   reach it.

   Both halves matter. Vertically, the observer's root is shrunk by
   rootMargin to exactly the rail's own band (the rail is sticky at the
   middle of the viewport, so that band is a constant) and anything
   intersecting it is beside the rail. Horizontally, the track's own left
   edge is compared against the rail's right edge, because a single image
   caps at 1036px and centres: on a 2560px display it clears the rail
   entirely, and there's no reason to fade for it there.

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
      /* Measured, not assumed: the rail's height is nine titles at whatever
         the reader's font size resolves to, which isn't a number to hardcode. */
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
            })
          );
        },
        { rootMargin: `-${above}px 0px -${below}px 0px` }
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
    <>
      {/* The row is a 1px line; the `after` pseudo-element pads the hit area
          back out to a comfortable target without giving the mark any height
          of its own. */}
      <MotionLink
        href={href}
        aria-current={active ? "page" : undefined}
        prefetch
        className="group relative flex h-px items-center gap-3 rounded-sm after:absolute after:left-0 after:top-1/2 after:size-full after:-translate-y-1/2 after:p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
        initial={false}
        animate={active ? "active" : "normal"}
        whileHover="hover"
      >
        <motion.span
          className="block h-px shrink-0 bg-foreground/15 transition-colors duration-150 ease-out group-hover:bg-foreground group-aria-[current=page]:bg-foreground"
          variants={lineVariants}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
        {/* Every title is legible at rest. The rail names the whole body of
            work, not just the study you're on. Only tone separates them: the
            current one solid black, the rest at 40%, the same two weights the
            meta list under the intro uses for label vs value. */}
        <span className="whitespace-nowrap text-case-caption text-foreground-faint transition-colors duration-150 ease-out group-hover:text-foreground group-aria-[current=page]:text-foreground">
          {title}
        </span>
      </MotionLink>

      {/* Two spacer ticks between entries, so the rail reads as a continuous
          ruled measure rather than nine separate dashes. */}
      {!isLast && (
        <>
          <span className="block h-px w-[var(--line-nav-width)] bg-foreground/15" />
          <span className="block h-px w-[var(--line-nav-width)] bg-foreground/15" />
        </>
      )}
    </>
  );
});
