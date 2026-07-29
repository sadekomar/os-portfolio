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
    slug: "data-that-outlives-its-app",
    title: "Data that outlives its app",
    description:
      "Five years of notes in one company’s file format is a bet on that company. The test isn’t whether the app is good, it’s what you keep when it stops existing.",
    date: "2026-07-29",
    blocks: [
      {
        type: "p",
        text: "I pay for note-taking apps and I would pay more. The polish is real work and it deserves the money. What I don’t want to buy along with it is the only copy of five years of my own handwriting, in a format that one company defined, that opens in one piece of software, on the platforms that company still supports.",
      },
      {
        type: "p",
        text: "The question I keep coming back to isn’t whether an app is good. It’s what I still have on the day it shuts down, gets acquired, or ships the pricing change that ends the relationship. For most of the software I use daily, the honest answer is: an export button I have never pressed, producing a file I have never opened, in a format nobody has promised to keep reading.",
      },
      { type: "h", text: "The database is not the problem" },
      {
        type: "p",
        text: "It would be easy to read this as an argument against databases, and it isn’t. Postgres is not a trap. The trap is a specific arrangement: the canonical copy of your writing lives in rows, the only thing that can assemble those rows back into a document is the vendor’s UI, and the schema is undocumented because it was never meant to be read by anyone but the app.",
      },
      {
        type: "p",
        text: "That arrangement has a tell. Ask what happens if the UI disappears and the data survives. For a good system the answer is “I read the files”. For the bad one it’s “I hire someone to reverse-engineer a schema dump”, which is a sentence that means the data is already gone; you just haven’t been billed for it yet.",
      },
      { type: "h", text: "What this site does" },
      {
        type: "p",
        text: "This blog has no CMS. The post you are reading is an object in a TypeScript file in the repository, next to the code it describes:",
      },
      {
        type: "code",
        code: `{
  slug: "data-that-outlives-its-app",
  title: "Data that outlives its app",
  description: "…",
  date: "2026-07-29",
  blocks: [{ type: "p", text: "I pay for note-taking apps…" }],
}`,
        caption: "src/data/posts.ts, which is also the sitemap’s source and the JSON-LD’s.",
      },
      {
        type: "p",
        text: "The talks are `data/talks.ts`. The reading list at the foot of the index is `data/resources.ts`. The profiles in the footer are `data/contact.ts`. In every case the file is the source of truth and the page is a projection of it, which means the sitemap, the structured data and the visible page cannot disagree about what exists: there is one array, and three consumers of it.",
      },
      {
        type: "p",
        text: "The durability falls out of that for free. Version history is `git log`. The backup is every clone. Editing is any text editor on any machine from the last forty years. If Next.js is gone in a decade the posts are still sitting in a plain file with the paragraphs intact, and the worst case is an afternoon writing something that walks the array and prints HTML.",
      },
      { type: "h", text: "What it costs" },
      {
        type: "p",
        text: "It costs a deploy to publish a typo fix, and it costs any possibility of a non-technical person editing the site. Those are real, and for a personal site they are close to free: I am the only author, and I am already in the repository when I write, because most of these posts started as comments a few directories away.",
      },
      {
        type: "p",
        text: "The trade gets harder as soon as there are several authors, or a marketing team, or a publish button that needs to work from a phone. I would not tell a content team to hand-edit a TypeScript array. But the principle survives the change of scale even when the implementation doesn’t: whatever writes to the database should not be the only thing that can read it back out, and the export path should be something you actually run, not a button you trust.",
      },
      { type: "h", text: "The test" },
      {
        type: "p",
        text: "Take the thing you would be most upset to lose. Ask what you would hold in your hands if the company that stores it announced it was closing on Friday. If the answer is a directory of files you can open, you own your work. If it is an account, you are renting it, and the rent can be raised.",
      },
    ],
  },
  {
    slug: "knowing-what-to-build",
    title: "Knowing what to build",
    description:
      "The gap between a good engineer and a great one is rarely who can write the code. It’s who noticed the detail was there to be got right.",
    date: "2026-07-29",
    blocks: [
      {
        type: "p",
        text: "Read the anatomy section of Emil Kowalski’s writeup of Vaul, his drawer component, and the striking part isn’t the implementation. It’s the length of the list. The number of separate decisions someone had to notice were decisions at all: what the drawer does when you flick it versus drag it slowly, what happens to the page behind it, where the scroll goes, what a velocity threshold should be before it counts as a dismissal.",
      },
      {
        type: "p",
        text: "Any competent engineer can implement each of those once they are written down. Almost nobody produces the list. That gap is the whole thing, and it is not a coding-ability gap.",
      },
      { type: "h", text: "The list is the hard part" },
      {
        type: "p",
        text: "We talk about engineering skill as though it were mostly execution, because execution is the part that is legible: it compiles or it doesn’t, the test passes or it fails, the review approves or it requests changes. Noticing has no artifact. There is no diff for the bug you didn’t ship because you thought about the empty state before you built the populated one.",
      },
      {
        type: "p",
        text: "So the trained eye reads as taste, which makes it sound innate and unteachable. It isn’t. It is the accumulated residue of having been wrong in public, plus the habit of reading other people’s work closely enough to see the decisions rather than the output. The reason Emil’s article is worth more than its code is that it externalises the noticing, which is normally the invisible half.",
      },
      { type: "h", text: "One line on this site" },
      {
        type: "p",
        text: "The index has a line under the contribution graph saying when I last shipped. Writing it is trivial: take the newest day with activity, subtract it from today, print “today” or “3 days ago”. The decision that took real thought was this one:",
      },
      {
        type: "code",
        code: `const MAX_AGE_DAYS = 14;

export function shippedLabel(date: string, now: Date): string | null {
  const days = differenceInCalendarDays(now, parseISO(date));

  if (days < 0 || days > MAX_AGE_DAYS) {
    return null;
  }
  …
}`,
      },
      {
        type: "p",
        text: "Past a fortnight the line renders nothing at all. That is the entire feature, and nothing about a “last shipped” label demands it. You only get there by asking what this looks like on a bad month, and then noticing that “last shipped 5 months ago” is worse than no line, because it is not broken. It is a confident, precise report on an absence, sitting directly under a graph the reader is already scanning for signs of life.",
      },
      {
        type: "p",
        text: "The same question, asked one step earlier, chose the data source. The obvious one is GitHub’s public events feed, which carries pushes to the second. Most of my work is in private repositories, so that feed is empty and the newest public push is months old: precision, pointed at the wrong number. The contributions API counts private contributions and only resolves to a day, which is less precise and true, and the line never claims to know more than the day.",
      },
      {
        type: "p",
        text: "Same class of decision, one file over: the paragraph about photos and the collage that follows it. The covers of three books assert taste and evidence none of it. A sentence about why those three is a claim someone can disagree with. The images were never the problem; shipping them without the sentence was.",
      },
      { type: "h", text: "How to get the list" },
      {
        type: "p",
        text: "The mechanical version of “have taste” that actually works for me is to ask three questions of anything before building it. What does this look like empty, and is empty the common case? What does it look like when it goes wrong, and does the failure explain itself? What does it look like in six months if nobody touches it?",
      },
      {
        type: "p",
        text: "None of those are about code, and all three produce work. That is the point. The engineering was never the constraint; the constraint is that most requirements documents describe the happy path of a system on the day it launches, and everything interesting happens outside that description.",
      },
    ],
  },
  {
    slug: "declarative-first-with-agents",
    title: "Declare the shape, delegate the procedure",
    description:
      "The most reliable thing I do with a coding agent: write the types by hand, then let it write the code that satisfies them. The type is the spec it can’t argue with.",
    date: "2026-07-29",
    blocks: [
      {
        type: "p",
        text: "The single change that improved my results with coding agents more than any prompt technique: stop describing what the code should do, and hand over a structure it has to satisfy instead. Write the types yourself. Let the agent write the procedure.",
      },
      {
        type: "p",
        text: "Prose is a lossy spec. “Fetch the videos, parse the subtitles, and return a beat sheet per video” has a dozen readings, and the agent will pick one, confidently, and you find out which one after you read 200 lines. A type has exactly one reading, and the compiler checks the agent’s work before you do.",
      },
      { type: "h", text: "The shape first" },
      {
        type: "code",
        code: `type Beat = {
  startSeconds: number;
  endSeconds: number;
  kind: "hook" | "setup" | "turn" | "payoff";
  transcript: string;
};

type Analysis = {
  videoId: string;
  beats: Beat[];
  /* null when the video had no subtitle track, which is
     not the same as an empty array. */
  outlierScore: number | null;
};`,
      },
      {
        type: "p",
        text: "Twenty lines of type do work that a page of instructions can’t. `kind` being a union means the agent cannot invent a fifth beat category, which it will otherwise do the moment it meets a video that doesn’t fit. `outlierScore` being nullable states, in a way that cannot be skimmed past, that “no subtitles” and “scored zero” are different facts. If the generated code conflates them it stops compiling, and it stops compiling in my editor rather than in production.",
      },
      { type: "h", text: "Why this works better than asking nicely" },
      {
        type: "p",
        text: "An agent producing code against a type has a verifier in the loop that isn’t me. It can attempt, fail, read the error, and correct, without a round trip through a human who has to notice the mistake first. My review then only has to answer “is this the right shape”, which I already decided, and “does it do the thing”, rather than the much harder “are there four subtly different notions of missing data buried in here”.",
      },
      {
        type: "p",
        text: "It also puts the irreversible decisions on the side of the line where I want them. Type changes ripple through everything downstream; the body of one function does not. So the cheap-to-change part is delegated and the expensive-to-change part stays hand-written, which is roughly the opposite of the default workflow where you let the model scaffold the data model and then spend a week living with its guesses.",
      },
      { type: "h", text: "Where it stops helping" },
      {
        type: "p",
        text: "The types have to be load-bearing to be worth it. `Record<string, any>` at the boundary buys nothing, and a codebase that stringly-types its states gives the agent nothing to fail against. This is the same reason the technique transfers badly to code whose hard part is a sequence rather than a structure: retries, ordering, what happens when the third of four steps fails. A type says nothing about time.",
      },
      {
        type: "p",
        text: "For those I write the state machine by hand and describe the transitions, because the shape that needs pinning down is the set of legal moves, not the set of legal values. Which is the same principle applied honestly: find the declarative core of the problem, own that, and delegate what follows from it.",
      },
    ],
  },
  {
    slug: "what-sre-did-to-operations",
    title: "What SRE did to operations",
    description:
      "The best-practice repos shipping for coding agents aren’t new knowledge. They’re the first time anyone had a reason to write the old knowledge down.",
    date: "2026-07-29",
    blocks: [
      {
        type: "p",
        text: "Vercel published a repo of React performance rules for coding agents. Supabase published one for Postgres. Both are good, and almost nothing in either is new. Waterfalls were bad in 2019. Indexes mattered in 1998. The advice existed, in conference talks, in a senior engineer’s head, in the review comment you got once and remembered.",
      },
      {
        type: "p",
        text: "What changed is that scattered advice is now expensive in a way it wasn’t before. An agent doesn’t absorb your team’s conventions by sitting in standup for six months. If the rule isn’t written down, it isn’t applied. So the rules are finally getting written down, and the thing everyone is calling an AI advance is mostly a documentation advance that AI created the incentive for.",
      },
      { type: "h", text: "This already happened once" },
      {
        type: "p",
        text: "Operations went through exactly this. Before SRE, keeping systems up was a craft: tacit, individual, resistant to being written down, and defended as such. The response wasn’t better sysadmins. It was making the practice legible. Error budgets instead of “is it healthy”. Runbooks instead of the one person who knows. Postmortems instead of remembering. Infrastructure as code instead of a server nobody dares reboot.",
      },
      {
        type: "p",
        text: "None of that was new knowledge either. It was the same knowledge, made explicit enough that it could be reviewed, versioned, argued with, and handed to somebody else. The gain wasn’t insight, it was that the practice stopped living exclusively in people’s heads.",
      },
      {
        type: "p",
        text: "Software engineering is getting the same treatment now, for the same reason, and it will produce the same second-order effect: once the tacit part is written down, it becomes contestable. A rule in a repo can be shown to be wrong. A senior engineer’s instinct, expressed as a review comment at 6pm, mostly can’t.",
      },
      { type: "h", text: "Underneath the vocabulary" },
      {
        type: "p",
        text: "The names have churned fast enough to be funny: prompt engineering, then MCP, then rules files, then context engineering, then agent skills. Each arrived as a category shift and each is roughly the same move, which is deciding what the model can see when it starts working.",
      },
      {
        type: "p",
        text: "Strip the vocabulary and what’s left is that an agent is a language model in a loop with tools and a stopping condition. That is not a diminishment; loops are how most useful things get built. But knowing it is the loop tells you where the leverage is. It isn’t in the phrasing of the instruction. It is in what goes into the context, what the tools actually return, and how the loop decides it’s finished.",
      },
      {
        type: "p",
        text: "Which is why the best-practices repos are the interesting artifact of this period and the prompt-engineering threads mostly aren’t. One is a durable, reviewable statement of how a codebase wants to be worked on. The other is a technique for talking to a model that will be obsolete when the next one ships.",
      },
    ],
  },
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
