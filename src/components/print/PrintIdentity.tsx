/* ── The letterhead ───────────────────────────────────────────────────────
   The one piece of markup that exists only on paper.

   Everything else in the print stylesheet is the site's own DOM restyled;
   that is the rule, and it is worth keeping, because a second React tree
   rendered for print is a second thing to keep true. This block is the
   exception, and it earns it by carrying information the screen has no
   reason to state: on screen the reader is already at sadekomar.com and the
   ways to reach me are four words in the footer with their destinations in
   the status bar. On paper there is no status bar, no footer, and no way
   back. A document with no address on it is a dead end.

   So: name, what I do, where I am, and four addresses spelled out. It is the
   top of the page because that is where a reader's eye goes looking for it,
   and because the greeting the web page opens with ("Hey, I'm Omar.") is
   hidden in print for the same reason this exists: a greeting is how you
   open a page someone chose to visit, not a document someone is holding.

   URLs are written bare, without the scheme. `attr(href)`, which is how the
   rest of the print layer expands links, can only ever emit the whole
   attribute, "https://" and all, and four of those stacked in the first line
   of a résumé is the exact "unreadable soup" that argues against expanding
   links at all. Here the text is the address, so it can simply be typed.

   `hidden print:block` rather than a media query in CSS: `display: none`
   keeps it out of the accessibility tree as well as off the screen, so a
   screen reader never announces the contact line twice.

   Mounted once in the root layout, so it heads every printed page of the
   site rather than the index alone. A printed case study wants an author on
   it just as much, arguably more, since it is the page most likely to be
   sent on to someone who did not visit the site. */

"use client";

import { usePathname } from "next/navigation";

import { EMAIL, MAILTO } from "@/data/contact";

const CONTACT = [
  { label: EMAIL, href: MAILTO },
  { label: "sadekomar.com", href: "https://sadekomar.com" },
  { label: "github.com/sadekomar", href: "https://github.com/sadekomar" },
  { label: "linkedin.com/in/sadekomar", href: "https://www.linkedin.com/in/sadekomar/" },
];

/* ── Why this knows the route ─────────────────────────────────────────────
   The print layer needs a few index-only rules (hide the greeting, hide the
   Elsewhere section) and CSS has no way to ask what page it is on. Every
   structural guess available (`main > section:last-of-type`, an nth-child)
   would also match /about and /blog, whose last section is real content, and
   would silently start deleting the wrong thing the moment page.tsx is
   reordered by whoever is editing it next.

   So this component, which is already mounted on every page and is already
   the only markup the print layer owns, publishes the answer: a bare
   `data-index` attribute the stylesheet reaches back up to via
   `html:has(.print-identity[data-index])`. One attribute, no route strings
   in CSS, and the coupling lives in the two files that exist for printing
   rather than in three files that don't. */
export function PrintIdentity() {
  const isIndex = usePathname() === "/";

  return (
    <div className="print-identity hidden print:block" data-index={isIndex ? "" : undefined}>
      <p className="print-identity-name">Omar Sadek</p>
      <p className="print-identity-role">Full-stack software engineer · Cairo, Egypt</p>
      {/* Real anchors, not plain text: a PDF viewer turns them into live
          links, so the emailed copy is one click from a reply. The print
          layer suppresses `::after` URL expansion inside this block, since the
          text already is the URL, and expanding it would print each address
          twice. */}
      <p className="print-identity-contact">
        {CONTACT.map((item, i) => (
          <span key={item.href}>
            {i > 0 && <span aria-hidden="true"> · </span>}
            <a href={item.href}>{item.label}</a>
          </span>
        ))}
      </p>
    </div>
  );
}
