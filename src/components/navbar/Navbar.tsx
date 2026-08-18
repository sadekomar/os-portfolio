"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandAssetsMenu } from "@/components/brand/BrandAssetsMenu";
import { CommandHint } from "@/components/command/CommandHint";
import { menuPages } from "@/data/menuPages";

/* The bar is invisible until you scroll. At the top of the page it's just
   the wordmark and the links sitting in the same 640px column as the content.
   Chrome (hairline + blurred backdrop) only arrives once something has
   scrolled underneath it and the separation is actually needed.

   The row served every breakpoint back when it held two destinations. It
   holds six now, and six names plus the wordmark don't fit a phone at a
   size worth reading, so below `sm` the links leave this row entirely and
   move to the bottom dock in MobileMenu.tsx, which is where a thumb already
   is. What stays up here on a phone is the wordmark alone.
   See docs/north-stars.md.

   The hover pill is fully round, so it needs more horizontal padding than a
   rounded rect to look evenly weighted. That padding comes out of the nav's
   own gutter (10 + 14 = 24px) so the wordmark still sits on the same left
   edge as the body text below it. */

const linkClass =
  "rounded-full px-3.5 py-1.5 text-body-sm transition-colors duration-150 ease-out hover:bg-wash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20";

export function NavBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      /* The scrolled state used to add a hairline under the bar. Quiet
         tonal has no lines, so the separation is carried by the tinted,
         blurred fill alone: the bar becomes a surface sitting over the
         content rather than a strip ruled off from it. */
      className={`sticky top-0 z-50 transition-colors duration-200 ease-out ${
        scrolled ? "bg-surface/75 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        /* text-body here is not for the links (they set their own size);
           it makes `measure` resolve at the same 17px as the content
           column, so the wordmark stays aligned with the body text. */
        className="mx-auto flex h-14 w-full max-w-measure-gutter items-center justify-between px-2.5 text-body md:h-16"
      >
        {/* The wordmark is also the brand-assets trigger: right-click it and
            the two marks are there to copy. Wrapping rather than replacing,
            the link is still a link, and the menu is the only thing the
            wrapper adds. See brand/BrandAssetsMenu.tsx. */}
        <BrandAssetsMenu>
          {/* Home now has its own navlink, so the wordmark drops aria-current
              and leaves that link as the single current-page marker. */}
          <Link href="/" className={`${linkClass} font-medium text-foreground`}>
            Omar Sadek
          </Link>
        </BrandAssetsMenu>

        {/* Below `sm` this row is empty: the same links live in the bottom
            dock instead. See navbar/MobileMenu.tsx, mounted in layout.tsx. */}
        <ul className="hidden items-center gap-0.5 sm:flex">
          {menuPages.map((page) => {
            /* "/" is a prefix of every route, so the startsWith test would
               light Home up everywhere. It only ever matches exactly.

               A fragment entry (Work is `/#work`) is never current: the hash
               is not part of the pathname, so nothing here could tell whether
               the reader is looking at that section. Home already lights up on
               the index, and lighting Work up beside it would claim a
               precision this test does not have. Stated rather than left to
               fall out of the comparisons below — it does fall out of them
               today, by accident, and that is not a thing to rely on. */
            const active = page.slug.includes("#")
              ? false
              : page.slug === "/"
                ? isHome
                : pathname === page.slug || pathname.startsWith(`${page.slug}/`);

            return (
              <li key={page.slug}>
                <Link
                  href={page.slug}
                  aria-current={active ? "page" : undefined}
                  className={`${linkClass} ${
                    active ? "text-foreground" : "text-foreground-subtle hover:text-foreground"
                  }`}
                >
                  {page.name}
                </Link>
              </li>
            );
          })}

          {/* Last in the row, and the only thing in it that isn't a
              destination. See command/CommandHint.tsx for why it's a chord
              rather than a word, and why it steps aside on touch. */}
          <li>
            <CommandHint />
          </li>
        </ul>
      </nav>
    </header>
  );
}
