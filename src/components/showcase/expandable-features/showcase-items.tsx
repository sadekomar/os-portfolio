"use client";

import exploreFeed from "./app-explore-feed.png";
import scriptEditor from "./app-script-editor.png";
import videoDetail from "./app-video-detail.png";
import { PanelMedia } from "./panel-media";
import type { ExpandableFeature } from "./expandable-features";

/**
 * The three panels the component ships with, frozen here so it renders with no
 * props and no data access. These are the real Wholana landing panels: the
 * product loop, research to decode to script.
 *
 * The screenshots are imported as static assets rather than pointed at
 * /public, so the whole directory moves as one unit.
 */
export const SHOWCASE_ITEMS: ExpandableFeature[] = [
  {
    id: "research",
    title: "Research your niche",
    description:
      "with a feed of the outliers actually working right now, filtered down to the subjects and formats you post in.",
    media: (
      <PanelMedia
        backdrop="radial-gradient(90% 60% at 18% 6%, #d3dde3 0%, transparent 60%), radial-gradient(70% 45% at 78% 100%, #c8bda9 0%, transparent 62%), radial-gradient(120% 40% at 40% 96%, #ddd5c6 0%, transparent 70%), radial-gradient(80% 60% at 60% 30%, #f3f1eb 0%, transparent 65%), #e6e6e0"
        src={exploreFeed}
        alt="Trending subjects in the Wholana explore feed"
        cardWidth={330}
        cardHeight={191}
        imageWidth={713}
        imageLeft={-366}
        imageTop={-180}
        offsetX={56}
        offsetY={-8}
      />
    ),
  },
  {
    id: "decode",
    title: "Decode any video",
    description:
      "into its hook, structure, shareability, and format, so you can see why it worked instead of guessing.",
    media: (
      <PanelMedia
        backdrop="radial-gradient(90% 55% at 82% 4%, #e9dfc9 0%, transparent 62%), radial-gradient(75% 50% at 12% 100%, #cfc4b2 0%, transparent 60%), radial-gradient(110% 35% at 55% 98%, #ded2bf 0%, transparent 72%), radial-gradient(80% 60% at 42% 38%, #f4f0e5 0%, transparent 66%), #e8e3d7"
        src={videoDetail}
        alt="A decoded video's craft breakdown, beat by beat"
        cardWidth={330}
        cardHeight={212}
        imageWidth={1032}
        // Nudged up-left from (-449, -325) so the crop keeps a teammate's
        // pointer whole. At the old offsets the arrow fell outside the window
        // and only its name tag survived, which reads as a stray blue chip
        // rather than as somebody reading the beat.
        imageLeft={-434}
        imageTop={-308}
        offsetX={-52}
        offsetY={4}
      />
    ),
  },
  {
    id: "script",
    title: "Write the next one",
    description:
      "straight from a saved reference, with the beats and the voice you already know land for your audience.",
    media: (
      <PanelMedia
        backdrop="radial-gradient(85% 55% at 14% 8%, #e6e8de 0%, transparent 60%), radial-gradient(70% 45% at 88% 100%, #c3c6b4 0%, transparent 62%), radial-gradient(110% 38% at 45% 97%, #d7dac9 0%, transparent 70%), radial-gradient(80% 60% at 60% 32%, #f2f2ec 0%, transparent 65%), #e5e7de"
        src={scriptEditor}
        alt="A draft script in the Wholana script editor"
        cardWidth={340}
        cardHeight={170}
        imageWidth={723}
        imageLeft={-166}
        imageTop={-83}
        offsetX={40}
        offsetY={-6}
      />
    ),
  },
];

/** The section heading the panels shipped under. */
export const SHOWCASE_HEADING = (
  <>
    <p className="mb-4 font-medium text-[13px] text-foreground-faint tracking-wide md:mb-5">
      The loop
    </p>
    <h2 className="max-w-[1100px] text-[clamp(2rem,5vw,3.75rem)] text-foreground leading-[1.05] tracking-[-0.01em]">
      Research, decode, script.
    </h2>
  </>
);
