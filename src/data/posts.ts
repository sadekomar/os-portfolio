/* ── The writing ──────────────────────────────────────────────────────────
   Newest first. The array order is the published order, and it is the only
   ordering there is. No tags, no categories, no featured flag. Nine posts
   is a list; the day it becomes forty is the day it earns a filter.

   Every post here started as a comment in this repository. That is not a
   shortcut, it is the source: the argument was already written at the point
   the decision was made, which is the only time anyone knows why. The essay
   is the comment with the surrounding code explained.

   `date` is the publication date in ISO, and it is load-bearing. The
   BlogPosting JSON-LD on each post declares it, so a wrong one is a wrong
   claim rather than a wrong label. */

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string; caption?: string };

export type Post = {
  slug: string;
  title: string;
  /* Doubles as the meta description and the line under the title on the
     index, so it has to work cold. No "in this post I'll explain". */
  description: string;
  date: string;
  blocks: Block[];
};

export const posts: Post[] = [
  {
    slug: "font-fallback-that-deletes-your-fallback",
    title: "The fallback option that deletes your fallback",
    description:
      "next/font already ships a fallback face re-scaled onto your webfont’s metrics. Naming your own system stack replaces it, and takes the shift-free swap with it.",
    date: "2026-07-27",
    blocks: [
      {
        type: "p",
        text: "Every webfont has a gap between the moment the page paints and the moment the real face arrives. With `display: swap` the browser fills that gap with something from the system, then swaps. The swap is the problem: two typefaces almost never occupy the same space, so the paragraph you were reading re-wraps under your eyes and everything below it jumps.",
      },
      {
        type: "p",
        text: "The standard advice is to name a fallback stack close to your webfont. Inter looks a bit like Helvetica, so you write Helvetica. This is folk medicine. Two faces looking similar at a glance says nothing about their metrics, and metrics are the entire mechanism. What shifts the page is the ratio between the em box and the ascent, descent, and advance widths, not whether the terminals are cut at the same angle.",
      },
      { type: "h", text: "What next/font already does" },
      {
        type: "p",
        text: "`next/font/google` has an `adjustFontFallback` option that defaults to on, and almost nobody looks at what it emits. It generates a second `@font-face` rule (a real one, in the stylesheet) that takes a font already on the machine and re-scales it onto your webfont’s metrics. For the Inter on this site, that rule is:",
      },
      {
        type: "code",
        code: `@font-face {
  font-family: "Inter Fallback";
  src: local(Arial);
  ascent-override: 90.44%;
  descent-override: 22.52%;
  line-gap-override: 0%;
  size-adjust: 107.12%;
}`,
        caption:
          "Local Arial, stretched onto Inter’s own metrics. Read off the generated stylesheet, not the docs.",
      },
      {
        type: "p",
        text: "Four descriptors, and between them they do the whole job. `size-adjust` scales the glyphs so Arial’s advance widths land where Inter’s would, 107.12% because Arial is set narrower. The three `*-override` descriptors then pin the line box: how far above the baseline the face claims, how far below, and how much air between lines. Once all four match, a line of fallback text occupies the same rectangle as the same line of Inter.",
      },
      {
        type: "p",
        text: "The result is a swap you cannot see. The letterforms change (of course they do, it is a different typeface) but nothing moves. No re-wrap, no jump, no layout shift contribution.",
      },
      { type: "h", text: "And then you delete it" },
      {
        type: "p",
        text: "Here is the trap. `next/font` also takes a `fallback` array, and it reads exactly like the belt-and-braces thing a careful person adds:",
      },
      {
        type: "code",
        code: `const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"], // ← the mistake
})`,
        caption: "Looks like insurance. Is a downgrade.",
      },
      {
        type: "p",
        text: "That array does not extend the generated face. It *replaces* it. The `Inter Fallback` family stops being emitted, and the browser falls back to `system-ui`, whose metrics are whatever the operating system happened to ship, unadjusted, unrelated to Inter. You have traded a face measured onto your typeface for one that merely has a similar reputation, and you have reintroduced the exact shift the option existed to remove.",
      },
      {
        type: "p",
        text: "The failure is quiet in the worst way. Nothing errors. The font still loads. The site looks right on your machine, on a warm cache, on the third reload. It is only wrong on a cold first paint on a slow connection, which is to say, it is only wrong for the visitors who have never seen your work before.",
      },
      { type: "h", text: "Where the system stack actually belongs" },
      {
        type: "p",
        text: "You do still want a system stack. It just belongs downstream of the metric match, not in place of it. Leave `fallback` off entirely, and put the system faces after the variable in your theme:",
      },
      {
        type: "code",
        code: `@theme inline {
  --font-sans:
    var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Helvetica Neue", Arial, sans-serif;
}`,
        caption:
          "`--font-inter` already expands to `\"Inter\", \"Inter Fallback\"`. The system faces come after that pair, not instead of it.",
      },
      {
        type: "p",
        text: "The variable next/font hands you is not one family name, it is the pair, `\"Inter\", \"Inter Fallback\"`, and that pair is the shift-free part. Everything you append after it is the genuine last resort: the case where both the webfont and local Arial are unavailable, which on a real machine means something has gone wrong that a font stack is not going to fix. Order is the whole point here. After the var, never in place of it.",
      },
      { type: "h", text: "How to check yours" },
      {
        type: "list",
        items: [
          "Open the generated font stylesheet in the Network panel and search for `Fallback`. If there is no `@font-face` with an `ascent-override`, you don’t have one.",
          "Set the network to a slow profile and hard-reload with the cache disabled. Watch the paragraph, not the heading: a heading is one line and hides the re-wrap.",
          "Look at Layout Shift regions in the Rendering panel. A metric-matched swap contributes nothing; an unmatched one lights up the whole column.",
        ],
      },
      {
        type: "p",
        text: "It is a two-line change and it costs nothing at runtime, which makes it the cheapest layout-shift fix available in a Next.js app. The catch is that the wrong version and the right version look identical in a code review. The wrong one just has one more line, and the line looks responsible.",
      },
    ],
  },
  {
    slug: "quiet-tonal",
    title: "Quiet tonal: no borders, no shadows",
    description:
      "A UI system with one axis. Four surfaces, three nested radii, and a border token set to transparent so the shortcut isn’t there to take.",
    date: "2026-07-24",
    blocks: [
      {
        type: "p",
        text: "The default answer to “these two things are different” is a line. When a line isn’t enough it becomes a card, and when a card isn’t enough it gets a shadow. Do that a few dozen times and the interface is mostly chrome: every element wearing a little frame, and the actual content sharing the page with a hundred pieces of scaffolding that exist to say *this bit is separate from that bit*.",
      },
      {
        type: "p",
        text: "This site doesn’t draw any of it. There is no border and no shadow anywhere in the CSS, and separation comes from one thing only: a step in lightness between two fills. I call it quiet tonal. Here is the whole system.",
      },
      { type: "h", text: "Four rungs" },
      {
        type: "p",
        text: "One axis, four values on it, named by their position in a nesting rather than by a number:",
      },
      {
        type: "list",
        items: [
          "`page`: the canvas. Near-white, never pure white, so that something raised still has somewhere to go.",
          "`sunken`: the gray container. It holds things and is never itself content.",
          "`raised`: white. The content sits here, inset inside the sunken container.",
          "`recessed`: gray again, but *inside* a raised surface. The de-emphasised state: completed, disabled, secondary.",
        ],
      },
      {
        type: "code",
        code: `--surface:          0 0% 98.4%;  /* #fbfbfb  the canvas   */
--surface-sunken:   0 0% 94.1%;  /* #f0f0f0  containers  */
--surface-raised:   0 0% 100%;   /* #ffffff  content     */
--surface-recessed: 0 0% 96.5%;  /* #f6f6f6  the recess  */`,
      },
      {
        type: "p",
        text: "Notice that gray does double duty. As a container it is the parent of white; as a recess it is the child of white. The same value reads as two opposite things, and which one you see is decided entirely by what it is nested inside.",
      },
      {
        type: "p",
        text: "That is why the padding is load-bearing rather than decorative. A container with no gutter around its children is just two flat colours meeting at an edge, indistinguishable from a border you drew in gray. The gutter is what makes the child read as sitting *inside* the parent, and it is the only thing carrying the depth cue. Remove it and the system collapses back into lines.",
      },
      { type: "h", text: "Radii have to nest too" },
      {
        type: "p",
        text: "Two rounded rectangles, one inside the other, look wrong at the corners unless their radii differ by exactly the distance between them. The relationship is not “a bit tighter than the parent”, it is arithmetic:",
      },
      {
        type: "code",
        code: `--surface-gutter: 0.5rem;  /*  8px  the padding a container leaves */
--radius-outer:   1.5rem;  /* 24px  the container                 */
--radius:         1rem;    /* 16px  an inset      (24 − 8)        */
--radius-inner:   0.75rem; /* 12px  a control inside that inset   */`,
      },
      {
        type: "p",
        text: "Change any one of the three and you have to change all three, or the corners stop being concentric and start merely coexisting. Writing it down as `inner = outer − gutter` is what makes that obvious to whoever touches it next, including me, four months later.",
      },
      { type: "h", text: "Removing the shortcut" },
      {
        type: "p",
        text: "A rule you have to remember is a rule you will break at 1am. Deciding not to use borders is worth about a week; the interesting part is making the shortcut unavailable.",
      },
      {
        type: "code",
        code: `/* Transparent, deliberately. */
--border: 0 0% 50% / 0;

* {
  @apply border-border;
}`,
      },
      {
        type: "p",
        text: "Every border in the codebase resolves through that token, so `border` and `border-b` still lay out, occupying their pixel with nothing reflowing; they just don’t draw. Reaching for a divider out of habit produces no divider, and the habit dies on its own without anyone having to police it in review.",
      },
      {
        type: "p",
        text: "There is an escape hatch, and it is deliberately slightly annoying: a genuine hairline has to name its colour at the call site. The cost of the exception is one explicit line in the diff, which is exactly where you want an exception to be visible.",
      },
      { type: "h", text: "Dark is not the inverse" },
      {
        type: "p",
        text: "The obvious move is to flip the four values and ship it. That produces a dark mode where nesting inward means getting darker, and it looks wrong immediately, because on a dark canvas, the thing that comes forward is the thing that is *lighter*. The direction of the scale has to invert along with the values.",
      },
      {
        type: "code",
        code: `.dark {
  --surface:          240 6% 7%;
  --surface-sunken:   240 5% 10.5%;
  --surface-raised:   240 5% 15%;    /* now the brightest rung */
  --surface-recessed: 240 5% 12.5%;  /* falls back toward the container */
}`,
      },
      {
        type: "p",
        text: "The steps are tighter too, 3–4% against light’s 4–6%. An equal delta in lightness reads louder against dark, so matching the numbers would give you a dark mode with visibly harder edges than the light one, which is the tell that a theme was derived rather than designed. Same relationship, different arithmetic.",
      },
      {
        type: "p",
        text: "The ink ramp gets the same treatment. Light runs 84% down to 10%; dark runs 34% up to 98%, a wider spread at the quiet end, because a dim grey on black loses its shape long before a light grey on white does. Neither ramp is the other one subtracted from 100.",
      },
      { type: "h", text: "What it costs" },
      {
        type: "p",
        text: "You give up the cheapest separator there is, and you find out how often you were using it to avoid a decision. Every grouping now has to be argued in space and tone: related rows are separate insets with a small gap, a section ends because the next one starts further away, a footer signals a change of register with smaller, greyer type instead of a rule across the page.",
      },
      {
        type: "p",
        text: "That is more work per screen and it is the entire benefit. A line will separate anything from anything, which is why it lets you ship a layout you never actually resolved. Take it away and the hierarchy has to be real before the page will read at all.",
      },
    ],
  },
];

export const postSlugs = posts.map((post) => post.slug);

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

/* One formatter, so the index rows, the post header and the JSON-LD can’t
   disagree about what a date looks like. `en-GB` for "24 July 2026": day
   first, no comma, which reads as a date rather than as an American one. */
export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
