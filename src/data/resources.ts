/* ── Resources ────────────────────────────────────────────────────────────
   The things that changed how I work, as opposed to the things I have read.
   That distinction is the whole editorial rule: a long list of good links is
   a bookmarks export, and a bookmarks export says nothing except that I have
   a browser.

   So every entry carries a sentence about what it changed, and any entry I
   can't write that sentence for doesn't belong here. Same standard as the
   books on /about: a cover is not an opinion.

   Deliberately ungrouped. An earlier pass sorted these into craft, judgment
   and mechanics, and the categories were doing less work than they looked
   like they were: half the entries could sit in two of them, and a reader
   scanning for one link has to guess which bucket I filed it under before
   they can find it. Thirteen items is short enough to read straight through,
   which is the only navigation a list this size needs.

   Order is roughly how formative each was, not alphabetical and not by
   date. Nothing reads the order but a human.

   `source` is who made it, and it reads as the citation. `why` is what it
   changed, not what it is about; the second is a description anyone could
   write from the landing page. */

export type Resource = {
  title: string;
  source: string;
  href: string;
  why: string;
};

export const resources: Resource[] = [
  {
    title: "Devouring Details",
    source: "Rauno Freiberg",
    href: "https://devouringdetails.com/",
    why: "The case that interface quality is a stack of decisions small enough that most people never notice one was made.",
  },
  {
    title: "animations.dev",
    source: "Emil Kowalski",
    href: "https://animations.dev",
    why: "Taught me the question is never “does this look good” but “does this feel right”, and that the honest answer is usually no.",
  },
  {
    title: "How to articulate",
    source: "index.how",
    href: "https://index.how/to/articulate",
    why: "Naming the thing precisely, and tying every choice to its purpose. It is the writing standard for this site, down to the commit messages.",
  },
  {
    title: "Do Things that Don’t Scale",
    source: "Paul Graham",
    href: "https://paulgraham.com/ds.html",
    why: "The permission slip for the unglamorous manual work at the start of anything, and the reason I stopped automating a problem I did not have yet.",
  },
  {
    title: "Human Interface Guidelines",
    source: "Apple",
    href: "https://developer.apple.com/design/human-interface-guidelines",
    why: "Still the most rigorous writing on interface behaviour anywhere, and most of it is platform-independent once you stop reading it as iOS documentation.",
  },
  {
    title: "JavaScript Visualized: Event Loop",
    source: "Lydia Hallie",
    href: "https://www.youtube.com/watch?v=eiC58R16hb8",
    why: "The event loop, Web APIs and the task queues drawn frame by frame. The first time the runtime stopped being a place where my code mysteriously happened.",
  },
  {
    title: "Increased Exposure Hours",
    source: "Jared Spool, Center Centre",
    href: "https://articles.centercentre.com/user_exposure_hours/",
    why: "Two hours every six weeks watching real people use the thing, for everyone on the team. The closest thing to a silver bullet I have read about, and the cheapest.",
  },
  {
    title: "Effective context engineering",
    source: "Anthropic",
    href: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
    why: "The clearest statement of where the leverage actually is with agents: not the phrasing of the prompt, but what the model can see when it starts.",
  },
  {
    title: "easings.dev",
    source: "Emil Kowalski",
    href: "https://easings.dev",
    why: "A reference I still open mid-build. Ease-out for entrances, and a curve you can point at instead of a vibe you can’t.",
  },
  {
    title: "Baymard Institute",
    source: "Baymard",
    href: "https://baymard.com/",
    why: "Large-scale usability research on checkout and commerce flows, which meant I could stop guessing at the parts of a storefront everybody guesses at.",
  },
  {
    title: "The work of Edward Tufte",
    source: "Graphics Press",
    href: "https://www.edwardtufte.com/",
    why: "Data-ink: every mark on the screen should be carrying information. The same argument as removing every border, arrived at forty years earlier.",
  },
  {
    title: "Debounce vs Throttle",
    source: "Artem Zakharchenko",
    href: "https://kettanaito.com/blog/debounce-vs-throttle",
    why: "Two things I had used interchangeably for years, drawn side by side until the difference was obvious and permanent.",
  },
  {
    title: "Sam Selikoff",
    source: "YouTube",
    href: "https://www.youtube.com/@samselikoff",
    why: "Long, unedited builds where the interesting part is the decision that gets reversed twenty minutes in.",
  },
];
