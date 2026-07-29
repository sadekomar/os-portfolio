# North Stars & Gold Standards

The bar this portfolio is aiming for. When a design or copy decision is ambiguous,
ask: *what would Glenn / Alasdair / Emil do here?* Then do the more restrained thing.

## The references

### 1. [glenn.me](https://glenn.me/): the primary north star

Glenn Hitchcock, Creative Director at Poolside. The one to beat.

**What makes it work:**
- **Text-forward.** Almost no chrome, no hero image, no decorative graphics. The page
  is content in a hierarchy, and the hierarchy *is* the design.
- **Voice before credentials.** Opens with "Caw!", so personality lands in the first
  word, before the job title. It reads like a person, not a résumé.
- **History as a list, not a timeline widget.** Roles 2011→now, each with one line
  about the *nature* of the work (systems, leadership, cross-functional), never a
  bullet-point of tools used.
- **Projects that are actually things.** Index, Devouring Details, animations.dev:
  each is a real artifact with its own depth, not a case-study mockup.
- **Chief collaborators.** A generous, outward-facing list of people he's worked
  with. Signals community and confidence: the credibility comes from the network,
  not from self-description.

**Steal:** the restraint, the greeting, the "here are things I made" over "here is
what I can do", the collaborators list.

### 2. [alasdairmonk.com](https://www.alasdairmonk.com/)

Software designer, also Poolside. Same family, more structured.

**What makes it work:**
- **Name, one-line descriptor, short bio.** That's the whole above-the-fold.
- **Company logos as visual anchors** in the work history, the only "graphics" on
  the page, and they do real scanning work rather than decoration.
- **Projects grouped by platform** (iOS, macOS, CLI, web). Shows range without
  needing to claim range.
- **An archive section.** Old experiments kept visible instead of deleted. Implies a
  long practice.
- **Theme-aware from the ground up**: light/dark logo variants, not a CSS filter.
- **Tone:** "I like to spend my days building things for developers and my nights
  building things for myself." Personality without pretension.

**Steal:** logo anchors in the work history, platform-grouped projects, the archive,
genuine light/dark asset pairs.

### 3. [emilkowal.ski](https://emilkowal.ski/)

Design Engineer at Linear, ex-Vercel. Author of Sonner, Vaul, animations.dev.

**What makes it work:**
- **Single vertical column**, sections flowing: intro → projects → writing →
  newsletter → footer. No navigation to speak of. Nothing to get lost in.
- **Writing is a first-class section**, not a blog buried in a nav. Nine essays doing
  the work a case study can't.
- **Shipped open-source as proof.** Sonner and Vaul are the portfolio; the site just
  points at them.
- **Motion detail.** Every interaction on the site is considered. This is the
  reference for *feel*, not just layout. See `.claude/skills/emil-design-eng`.

**Steal:** writing as a top-level section, the single-column flow, the obsessive
interaction polish.

## The shared thesis

All three converge on the same set of moves:

1. **Content is the design.** No hero illustrations, no parallax, no scroll-jacking.
   Typography and spacing carry everything.
2. **Show artifacts, not claims.** Real shipped things beat "passionate about crafting
   delightful experiences."
3. **Voice in the first sentence.** One human line establishes the person before any
   credential does.
4. **Fast and quiet.** Minimal payload, no loaders, no splash. The page is just there.
5. **Depth on demand.** The index page stays short; the detail lives one click down.
6. **Light and dark both treated as the real design**, not one derived from the other.

## Articulation standard

[index.how/to/articulate](https://index.how/to/articulate), the vocabulary bar for
how we talk about this work, in copy, in commits, and in review.

- **Name the thing precisely.** Not "looks better". Say *contrast ratio*, *x-height*,
  *optical kerning*, *gap*, *tracking* vs *kerning*.
- **Tie every choice to its purpose.** "Ease-out for entrances because it starts fast
  and settles, it feels natural. Exits need different treatment."
- **Microcopy is design material**, not documentation. It has outsized effect on how
  trustworthy the product feels.
- Precision here isn't pedantry; it makes decisions reproducible and reviewable.

## Anti-patterns (what we are explicitly not doing)

- Big hero images or full-bleed background video
- Scroll-jacking, parallax, animated page transitions that delay content
- "Passionate about…" / "crafting delightful experiences" copy
- Case studies that are 90% process diagram and 10% outcome
- Skill bars, tool logo grids, percentage-proficiency charts
- Anything that needs a loading state on the index page
