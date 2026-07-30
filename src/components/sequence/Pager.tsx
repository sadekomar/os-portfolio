"use client";

import { useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icon/Icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* ── The sequence pager ───────────────────────────────────────────────────
   Two arrows in a page's header, opposite the link back to the index, plus
   the keys that do the same thing: J or → forward, K or ← back, Escape out
   to the index.

   One component for the case studies, the components and the posts. It was
   three: the case studies had J/K/Escape and a native `title`, the
   components had the arrow keys and a real tooltip with the key in it, and
   the posts had neither. Every difference between them was an accident of
   which page was built first, and the cost was that fixing the keyboard
   meant finding all three. What genuinely differs page to page is the
   destination and the surface, so those are props and nothing else is.

   ── Why these keys ──
   J/K is the reading-app convention (vim, Gmail, Linear) and it keeps the
   same sense of direction: J moves *down* the sequence to the next entry, K
   moves back up. It matters most on a case study, which is a long scroll,
   because ↑/↓ are already the reader's scroll gesture and rebinding them
   would take a working one away to add a rarely-wanted one.

   ←/→ ride alongside, because they are the keys most people try first and
   they are nearly free: almost nothing here scrolls sideways. Nearly, not
   entirely. The Loom Cairo gallery is a slider and takes both arrows while
   it has focus; it stops the event at itself rather than being exempted
   here, on the same rule as the inputs below, so this listener never sees
   those presses. See StorefrontCarousel.

   The buttons are the discoverable half. The keys are a shortcut for
   whoever tries them, not a feature anyone has to find, so they are
   announced in the button's own tooltip and label rather than in a legend
   on the page. Nothing is added to the layout for a hint most visitors
   don't need. */

export type Sibling = { slug: string; title: string };

type Props = {
  previous?: Sibling;
  next?: Sibling;
  /** Where a sibling's slug hangs off: `/work`, `/components`, `/blog`. */
  basePath: string;
  /** Where Escape goes. */
  indexPath: string;
  /** What the arrows are stepping through, as the tooltip and the
      accessible label say it: "Previous case study", "Older post". */
  labels: { previous: string; next: string };
  /** `bare` for the case-study and post headers, where the pair sits alone
      against the page and those pages carry no filled rectangles anywhere.
      `chip` for the components toolbar, where the arrows sit beside Copy
      page and Share and would read as unfinished without the same shell. */
  variant?: "bare" | "chip";
  className?: string;
};

export function SequencePager({
  previous,
  next,
  basePath,
  indexPath,
  labels,
  variant = "bare",
  className,
}: Props) {
  useSequenceKeys({ previous, next, basePath, indexPath });

  return (
    /* One provider around the pair, so moving from Previous to Next does not
       re-pay the open delay. That is what makes two icon buttons read as a
       row rather than as two unrelated controls. It lives here rather than in
       each page's layout so a page gets it by rendering the pager. */
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center",
          /* Bare: -mr-1.5 pulls the hover surface's own padding back out of
             the column, so the second arrow sits optically flush with the
             right edge of the text measure. Chip: the toolbar's own gap. */
          variant === "bare" ? "-mr-1.5 gap-0.5" : "gap-1.5",
          className,
        )}
      >
        <PagerButton
          sibling={previous}
          direction="previous"
          basePath={basePath}
          label={labels.previous}
          variant={variant}
        />
        <PagerButton
          sibling={next}
          direction="next"
          basePath={basePath}
          label={labels.next}
          variant={variant}
        />
      </div>
    </TooltipProvider>
  );
}

/* Prefetched by hand because these are keyboard destinations as much as
   links: `<Link>` only warms itself once it is on screen and hovered, and a
   J press should land as fast as a click on the footer does. */
function useSequenceKeys({
  previous,
  next,
  basePath,
  indexPath,
}: Pick<Props, "previous" | "next" | "basePath" | "indexPath">) {
  const router = useRouter();

  useEffect(() => {
    if (previous) router.prefetch(`${basePath}/${previous.slug}`);
    if (next) router.prefetch(`${basePath}/${next.slug}`);
  }, [previous, next, basePath, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      /* Anything with a modifier belongs to the browser or the OS (⌘K, ⌥J on
         a Mac layout), so it is not ours to take. Shift is allowed on J/K,
         where it only changes the case `event.key` reports, and refused on
         the arrows, where it is a text-selection gesture. */
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const arrow = event.key === "ArrowLeft" || event.key === "ArrowRight";
      if (arrow && event.shiftKey) return;

      /* `event.key` carries the active layout, so a shifted or non-QWERTY
         press still resolves, but it means matching both cases. */
      const key = event.key.toLowerCase();
      if (!arrow && key !== "j" && key !== "k" && event.key !== "Escape") return;

      if (ownsTheKeyboard(event.target, arrow || event.key === "Escape")) return;
      /* Escape mid-tour means "stop the tour", which the tour engine is
         already listening for. Without this the reader would get both: the
         tour stops *and* the page they were being shown navigates away. */
      if (tourIsRunning()) return;

      if ((key === "j" || event.key === "ArrowRight") && next) {
        event.preventDefault();
        router.push(`${basePath}/${next.slug}`);
      } else if ((key === "k" || event.key === "ArrowLeft") && previous) {
        event.preventDefault();
        router.push(`${basePath}/${previous.slug}`);
      } else if (event.key === "Escape") {
        event.preventDefault();
        router.push(indexPath);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previous, next, basePath, indexPath, router]);
}

/* Focus that owns the key already, in two grades, because "the focused
   control wins" is not one rule.

   A field owns the whole keyboard: J and K are letters someone is typing,
   and there is no version of taking them that isn't a bug. An open modal
   owns it for a different reason: whatever is behind it is not what the
   reader is looking at, so no key should move it.

   A menu, a listbox, a slider or a data grid owns the keys it actually
   binds, which is the arrows and Escape, and nothing else. The gallery on the
   Loom Cairo study is the case that matters: it is a slider, ← and → scrub
   it, and J should still go to the next case study rather than land on a
   control that has no use for it.

   `closest` on roles rather than a list of tag names, because the thing with
   focus is usually a cell or an option several levels inside the widget that
   binds the key, and the previews on the components pages are made of
   exactly those. */
const KEYBOARD_OWNERS = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  "[role='dialog']",
].join(", ");

const ARROW_OWNERS = [
  "[role='menu']",
  "[role='menuitem']",
  "[role='listbox']",
  "[role='option']",
  "[role='slider']",
  "[role='grid']",
].join(", ");

function ownsTheKeyboard(target: EventTarget | null, arrowOrEscape: boolean) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  if (element.isContentEditable || element.closest?.(KEYBOARD_OWNERS)) return true;
  return arrowOrEscape && Boolean(element.closest?.(ARROW_OWNERS));
}

/* The tour's bubble stays mounted while idle so its return animation has
   something to run on, and is marked `inert` instead. So the question is not
   whether the bubble exists, it is whether it is live. See TourBubble. */
function tourIsRunning() {
  return typeof document !== "undefined" && !!document.querySelector("[data-tour-ui]:not([inert])");
}

/* Shared by the link and by the spent arrow, so it holds only what both are:
   the box, the shape, and the schedule the colours run on. The press dip
   lives on the link alone, below. */
const shellClass = {
  bare: "flex size-7 items-center justify-center rounded-md transition-[color,background-color,scale] duration-150 ease-out-quint",
  chip: "bg-surface-sunken flex items-center justify-center rounded-lg p-2 transition-[color,background-color,scale] duration-150 ease-out-quint",
} as const;

const restClass = {
  bare: "text-foreground-faint hover:bg-wash hover:text-foreground",
  chip: "text-foreground-muted hover:text-foreground",
} as const;

/* The spent end of the sequence, which stays in place rather than
   collapsing: two arrows on every page, one of them ghosted. A control that
   vanishes on the first and last entry makes the pair look like it moved.

   The chip keeps its shell and drops to half, because the shell is what
   holds the toolbar's width; the bare arrow has no shell to keep. */
const spentClass = {
  bare: "text-foreground-ghost",
  chip: "text-foreground-ghost opacity-50",
} as const;

/* 6%, against 3% on a normal button and 1% on a full-width row. The dip is
   proportional to what it is dipping: this target is 28px square, and 1 to
   3% of that is a sub-pixel move, which is to say no move at all. At this
   size the arrow has to visibly shrink under the finger or the press reads
   as having missed, which matters more here than elsewhere because the pair
   sits flush against the right edge with only 2px between them. */
const pressClass = "active:scale-[0.94]";

function PagerButton({
  sibling,
  direction,
  basePath,
  label,
  variant,
}: {
  sibling?: Sibling;
  direction: "previous" | "next";
  basePath: string;
  label: string;
  variant: "bare" | "chip";
}) {
  /* One drawing, mirrored. The glyph registry holds `sibling` pointing
     forward and the transform supplies the direction. The components
     toolbar used to carry its own pair of arrow paths at a hair more
     weight, which is a second drawing of the same idea. */
  const glyph = (
    <Icon name="sibling" size="control" className={direction === "previous" ? "-scale-x-100" : ""} />
  );

  /* It gets no press state, deliberately. It is a ghosted glyph, not a
     control: nothing happens when it is pressed, and a dip is a promise
     that something did. Same reason it carries no hover, no tooltip, and is
     hidden from the accessibility tree. */
  if (!sibling) {
    return (
      <span className={cn(shellClass[variant], spentClass[variant])} aria-hidden="true">
        {glyph}
      </span>
    );
  }

  const letter = direction === "next" ? "J" : "K";
  const arrow = direction === "next" ? "→" : "←";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* A link, not a button, so it is openable in a new tab and
            crawlable. The destination's title rides the accessible label,
            where the tooltip stays at the shape of the move: the name is
            already the next page's heading, and reading it twice is how a
            tooltip turns into a summary. */}
        <Link
          href={`${basePath}/${sibling.slug}`}
          aria-label={`${label}: ${sibling.title}`}
          className={cn(
            shellClass[variant],
            restClass[variant],
            pressClass,
            "focus-visible:ring-ring/20 focus-visible:ring-2 focus-visible:outline-none",
          )}
        >
          {glyph}
        </Link>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {label}
        <span className="flex items-center gap-1">
          {/* Both keys, because both work and neither is the obvious one:
              the arrow is what a visitor reaches for, the letter is what
              they keep using once the page is a long scroll. No size of
              their own; they inherit the tooltip's 11px. */}
          <Key>{letter}</Key>
          <Key>{arrow}</Key>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="bg-foreground/15 rounded px-1.5 py-0.5 font-sans leading-none">{children}</kbd>
  );
}
