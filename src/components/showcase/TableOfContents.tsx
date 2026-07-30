"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/* ── On this page ─────────────────────────────────────────────────────────
   The right rail. Same instrument as the left one, reading in the other
   direction: the left rail is where you are in the set, this is where you
   are in the page.

   The active heading is tracked with an IntersectionObserver rather than by
   measuring scroll position on every frame. The observer's root margin
   pulls the top of the viewport down to just under the sticky site header
   and the bottom up to a quarter of the screen, so the "current" section is
   the one occupying the band a reader is actually looking at, not whichever
   one happens to touch the very top pixel.

   Choosing among several visible headings is the part a naive version gets
   wrong. Scrolling up and down through the same boundary should not pick
   different sections, so the choice is always the topmost heading currently
   inside the band, taken from the observer's own record of what is
   intersecting rather than from the entries of the event that just fired.
   Entries only describe what changed; the set is what the answer depends
   on. */

export type TocItem = { id: string; label: string; depth?: 2 | 3 };

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        const topmost = items.find((item) => visible.has(item.id));
        if (topmost) {
          setActive(topmost.id);
          return;
        }

        /* Nothing in the band: the reader is either above the first heading
           or in a section long enough to have pushed its own heading past
           the top. Keeping the last active one is right for the second case
           and harmless in the first. */
      },
      { rootMargin: "-88px 0px -75% 0px", threshold: 0 },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-meta">
      {/* `font-medium`, like every other micro label on the site (the ⌘K hint,
          the palette's group headings, the footer's column titles). 11px at
          400 on a near-white ground is the one place where greyscale AA gives
          up the letterforms, which is why the rung is only ever used at 500. */}
      <p className="text-micro text-foreground-faint mb-3 font-medium">On this page</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className={cn(item.depth === 3 && "pl-3")}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "block transition-colors",
                active === item.id
                  ? "text-foreground"
                  : "text-foreground-faint hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
