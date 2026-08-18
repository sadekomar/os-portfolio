/* Work is `/#work`, a fragment on the index, because `/work` is itself a
   404: the case studies live under it but the list of them is a section of
   the home page. The same decision is already written down in
   app/not-found.tsx, which sends a lost reader to `/#work` for the same
   reason. Adding a `/work` route to make the nav tidier would be inventing a
   page to satisfy a menu.

   Two consequences of the one hash entry in this list, both handled where
   they land: navbar/Navbar.tsx and navbar/MobileMenu.tsx key their active
   state on the pathname, which a fragment does not change, so neither can
   mark it current; and command/actions.ts already ships a hand-written Work
   action that scrolls when you are on the index instead of navigating, so it
   skips hash entries here rather than listing Work twice. */
export const menuPages = [
  { name: "Home", slug: "/" },
  { name: "Work", slug: "/#work" },
  { name: "Components", slug: "/components" },
  { name: "Blog", slug: "/blog" },
  { name: "Talks", slug: "/talks" },
  { name: "About", slug: "/about" },
];
