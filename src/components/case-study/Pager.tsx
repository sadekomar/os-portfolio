"use client";

import { useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icon/Icon";

/* ── Case-study pager ─────────────────────────────────────────────────────
   Two arrows in the header, opposite the "Work" link, plus the keys that do
   the same thing: J forward, K back, Escape out to the index.

   J/K rather than the arrow keys because the arrow keys already scroll the
   page, and a case study is a long scroll, so rebinding them would take a
   working gesture away to add a rarely-wanted one. J/K is the reading-app
   convention (vim, Gmail, Linear), and it keeps the same sense of direction:
   J moves *down* the list to the next study, K moves back up.

   The buttons are the discoverable half of this. The keys are a shortcut for
   whoever tries them, not a feature anyone has to find, so they're announced
   in the button's own title/label instead of a legend on the page. Nothing
   is added to the layout for a hint most visitors don't need. */

type Sibling = { slug: string; title: string };

export function CaseStudyPager({ previous, next }: { previous?: Sibling; next?: Sibling }) {
  const router = useRouter();

  useEffect(() => {
    /* Prefetched by hand because these are keyboard destinations as much as
       links: <Link> only warms itself once it's on screen and hovered, and
       a J press should land as fast as a click on the footer does. */
    if (previous) router.prefetch(`/work/${previous.slug}`);
    if (next) router.prefetch(`/work/${next.slug}`);
  }, [previous, next, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      /* Anything with a modifier belongs to the browser or the OS (⌘K, ⌥J
         on a Mac keyboard layout), and anything typed into a field belongs
         to the field. Neither is ours to take. */
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      /* `event.key` carries the active layout, so a shifted or non-QWERTY
         press still resolves, but it means matching both cases. */
      const key = event.key.toLowerCase();

      /* ← / → alongside J/K. The horizontal pair is free (nothing on this
         page scrolls sideways, so unlike ↑/↓ they aren't taken) and they're
         the keys most people reach for first. */
      if ((key === "j" || event.key === "ArrowRight") && next) {
        event.preventDefault();
        router.push(`/work/${next.slug}`);
      } else if ((key === "k" || event.key === "ArrowLeft") && previous) {
        event.preventDefault();
        router.push(`/work/${previous.slug}`);
      } else if (event.key === "Escape") {
        event.preventDefault();
        router.push("/#work");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previous, next, router]);

  return (
    /* -mr-1.5 pulls the hover surface's own padding back out of the column so
       the second arrow sits optically flush with the right edge of the text
       measure, the same correction the footer pair makes on the left. */
    <div className="-mr-1.5 flex items-center gap-0.5">
      <PagerButton sibling={previous} direction="previous" shortcut="K" />
      <PagerButton sibling={next} direction="next" shortcut="J" />
    </div>
  );
}

const buttonClass =
  "flex size-7 items-center justify-center rounded-md transition-colors duration-150 ease-out";

function PagerButton({
  sibling,
  direction,
  shortcut,
}: {
  sibling?: Sibling;
  direction: "previous" | "next";
  shortcut: string;
}) {
  /* One drawing, mirrored. The glyph registry holds `sibling` pointing
     forward and the transform supplies the direction. */
  const glyph = (
    <Icon name="sibling" size="control" className={direction === "previous" ? "-scale-x-100" : ""} />
  );

  /* The end of the sequence stays in place rather than collapsing: two
     arrows on every case study, one of them spent. A control that vanishes
     on the first and last page makes the pair look like it moved. */
  if (!sibling) {
    return (
      <span className={`${buttonClass} text-foreground-ghost`} aria-hidden="true">
        {glyph}
      </span>
    );
  }

  const label = `${direction === "next" ? "Next" : "Previous"} case study: ${sibling.title} (press ${shortcut} or ${direction === "next" ? "→" : "←"})`;

  return (
    <Link
      href={`/work/${sibling.slug}`}
      aria-label={label}
      title={label}
      className={`${buttonClass} text-foreground-faint hover:bg-wash hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20`}
    >
      {glyph}
    </Link>
  );
}
