/* Source of truth for the components section: the nav rail, the index, the
   static params and the prev/next footer all read this one list, so a
   component can't be added to one and forgotten in another.

   Order is the reading order of the rail, and it is deliberate rather than
   alphabetical: the cheap, immediately legible pieces sit near the top so
   the first thing a visitor clicks resolves in a second, and the two heavy
   set pieces (the hand-drawn phone screen, the isometric wall) sit at the
   end where someone still scrolling has already decided to spend time. */

export type ShowcaseComponent = {
  slug: string;
  title: string;
  /** One line, set under the title. Says what it does, not why it is good. */
  description: string;
  /** The product this was built for, and the case study to read next. */
  project: { name: string; slug?: string };
  /** Docs-page bullets. Each is one sentence and describes behaviour that
      can actually be observed in the preview above it. */
  features: string[];
  /** The import line plus the JSX, shown under Usage. */
  usage: string;
  /** Files under `src/components/showcase/<slug>/`, in the order they
      should be tabbed through in the Code panel. The first is the one the
      panel opens on, so it should be the file that carries the idea. */
  files: string[];
  /** Stated plainly where a lifted component had to change to run here,
      or where the original is adapted from someone else's work rather than
      authored. Rendered as a note under the preview. Absent means the
      component runs as it shipped. */
  note?: string;
  /** What the preview stage is painted with. `raised` (white) is the
      default and is right for anything that reads as a piece of UI sitting
      on a page. `sunken` is for the components that carry their own field
      edge to edge: on white they lose their boundary and read as though
      they have bled into the panel. */
  stage?: "raised" | "sunken";
};

export const showcaseComponents: ShowcaseComponent[] = [
  {
    slug: "color-pills",
    title: "Colour Pills",
    description:
      "A horizontally scroll-snapping row of colour facets with result counts, single select, and an All pill that clears the selection.",
    project: { name: "Loom Cairo", slug: "loom-cairo" },
    features: [
      "Single select by design: colour is a browse mode rather than a narrowing filter, and tapping the active pill turns it off so the row can never trap a state.",
      "The row scrolls rather than wraps, so a longer facet list cannot push the results grid down by a whole row.",
      "Proximity scroll snapping stops a pill coming to rest half cut off at the container edge.",
      "Every pill is a real button with a pressed state, so the row is keyboard operable and announces itself.",
    ],
    usage: `import { ColorPills } from "@/components/showcase/color-pills/color-pills";

<ColorPills />`,
    files: ["color-pills.tsx", "colors.ts", "color-pills.css"],
    note: "In the product this writes the selection into the page URL so a filtered view is shareable and the back button works. That is removed here, because a component embedded in a docs page has no business rewriting the URL of the page around it. The visible behaviour is otherwise unchanged, and the facet counts are frozen from the real catalogue.",
  },
  {
    slug: "brand-values-dial",
    title: "Brand Values Dial",
    description:
      "Three brand values arranged around a rotating logo hub, advancing on a timer that is drawn rather than counted.",
    project: { name: "Argonaut", slug: "argonaut" },
    features: [
      "The active pill is the countdown: a fill sweeps across it over one interval and the end of that animation is what advances the carousel, so the indicator and the rotation cannot drift apart.",
      "The hub's rotation is cumulative rather than modular, so every selection sweeps forward through 120 degrees instead of snapping backwards.",
      "Arrival is accented with light rather than scale, through a Web Animations API pass that runs without remounting the in-flight spin.",
      "Autoplay pauses when the section leaves the screen, when the tab is hidden, and when the window loses focus, each tracked separately from a deliberate press of the pause control.",
    ],
    usage: `import { BrandValuesDial } from "@/components/showcase/brand-values-dial/brand-values-dial";

<BrandValuesDial />`,
    files: ["brand-values-dial.tsx", "brand-values-dial.module.css"],
    note: "Three reading orders have to be reconciled inside this component, because the desktop layout, the artwork's arms and the counter all number the values differently. The source comments on that, and on why the easing curve is hand-written rather than one of the CSS keywords, are worth more than the animation itself.",
  },
  {
    slug: "decode-flow",
    title: "Decode Flow",
    description:
      "A pipeline diagram that runs itself: a trigger drops into a decode hub, fans out to three axes, and types the result into a card one row at a time.",
    project: { name: "Wholana", slug: "wholana" },
    features: [
      "One SVG carries the connectors, the hub and the axis nodes so the curves scale with the container, while the trigger pill and the result card stay as HTML so the type stays crisp.",
      "A four-phase state machine drives the skeleton shimmer, the per-character typing and the halo on whichever axis is being written at that moment.",
      "Before hydration, and for anyone who asked for reduced motion, the first card renders already filled in, so there is no flash of an empty diagram and no motion for those who did not want it.",
      "The trigger label swaps through a text morph, so the characters two labels share slide into place instead of the whole string snapping.",
    ],
    usage: `import { DecodeFlow } from "@/components/showcase/decode-flow/decode-flow";

<DecodeFlow />`,
    files: ["decode-flow.tsx", "animated-text.tsx"],
    note: "This is the Wholana case study's craft pass, drawn. The hub mark was an external SVG request in the original and is inlined here, and the ink colours are literal rather than themed, because the pill and the card are always white paper and following the page theme would set white type on white in dark mode.",
  },
  {
    slug: "expandable-features",
    title: "Expandable Features",
    description:
      "A row of media panels where the open one grows and its neighbours give up their width, advancing on a dwell timer that freezes rather than restarts on hover.",
    project: { name: "Wholana", slug: "wholana" },
    features: [
      "Dwell progress is measured against the wall clock and freezes when the pointer enters the section, so hovering holds the panel you are reading instead of restarting it.",
      "The section only ticks while it is meaningfully in view, so an off-screen carousel is not burning frames.",
      "Every panel carries the hairline track and only the active one fills, so the row reads as one ruled baseline rather than a progress bar that appears and disappears.",
      "Panel media crops from the centre as a panel collapses while absolutely positioned children hold their size, which is what keeps the floating card readable at every width.",
    ],
    usage: `import { ExpandableFeatures } from "@/components/showcase/expandable-features/expandable-features";

<ExpandableFeatures />`,
    files: ["expandable-features.tsx", "showcase-items.tsx", "panel-media.tsx"],
    note: "The dwell hook was restructured on the way over. The original wrote to a ref during render and reset progress in an effect, both of which this project's lint rules reject, so the reading now carries the key it was measured under and a panel change zeroes the rail by derivation instead of a second render. The behaviour is the same. The section heading it shipped under is a prop with a default, and this page passes its own instead: at 60px it was the largest type on the site and the panel row would have read as a caption to it.",
    stage: "sunken",
  },
  {
    slug: "whatsapp-screen",
    title: "WhatsApp Screen",
    description:
      "A WhatsApp thread drawn entirely in JSX at real iPhone point sizes, scaled down into a device frame.",
    project: { name: "Wholana", slug: "wholana" },
    features: [
      "Authored on the true 393 by 852 logical screen and scaled once at the root, so every measurement inside is the real iOS number rather than a guess at what it looks like small.",
      "Every element is hand drawn: the link preview, the template card and its call to action, a voice note with a 32 bar waveform, bubble tails, delivery ticks, the composer and the home indicator.",
      "No screenshot and no image request anywhere, so it stays sharp at any size instead of resampling like a capture would.",
      "The frame carries its own iOS status bar and an optional bottom crop that dissolves into the page through a mask rather than a hard edge.",
    ],
    usage: `import { WhatsAppScreen } from "@/components/showcase/whatsapp-screen/whatsapp-screen";

<WhatsAppScreen />`,
    files: ["whatsapp-screen.tsx", "chat-screen.tsx", "mobile-frame.tsx"],
    note: "The landing page crops this at 380px and shows only the top of the thread. The whole device is rendered here so the conversation and the composer are both visible, and the crop is still a prop. It is a craft exercise more than a component: the comments explain why each measurement is the number it is.",
    stage: "sunken",
  },
  {
    slug: "isometric-brands",
    title: "Isometric Brands",
    description:
      "A field of 120 parallelogram brand marks in seven diagonal lanes, drifting in alternating directions on a pure CSS loop.",
    project: { name: "Loom Cairo", slug: "loom-cairo" },
    features: [
      "Odd lanes drift down and right while even lanes drift up and left, so the field reads as counter-rotating rather than as a marquee.",
      "The motion is two keyframe rules and a custom property ladder, with no animation loop, no ref and no requestAnimationFrame anywhere in the component.",
      "All eleven marks are inline SVG, so the entire field costs zero network requests and every mark stays recolourable in CSS.",
      "The three outermost lanes drop out on a narrow screen rather than being clipped, and the whole field freezes under prefers-reduced-motion.",
    ],
    usage: `import { IsometricBrands } from "@/components/showcase/isometric-brands/isometric-brands";

<IsometricBrands />`,
    files: ["isometric-brands.tsx", "isometric-brands.css", "brand-logos.tsx"],
    note: "This is the product's thesis rendered as motion: 300 Egyptian brand sites in one place. Two logo components that were defined but never rendered are dropped, which accounts for most of the source file's original length. The reduced-motion rule is an addition rather than a lift.",
    stage: "sunken",
  },
];

export const componentSlugs = showcaseComponents.map((c) => c.slug);

export function getComponent(slug: string) {
  return showcaseComponents.find((c) => c.slug === slug);
}

/** The rail and the pager both need neighbours, and deriving it here keeps
    the two from disagreeing about what comes after the last one. */
export function componentNeighbours(slug: string) {
  const i = showcaseComponents.findIndex((c) => c.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return {
    prev: i > 0 ? showcaseComponents[i - 1] : undefined,
    next: i < showcaseComponents.length - 1 ? showcaseComponents[i + 1] : undefined,
  };
}
