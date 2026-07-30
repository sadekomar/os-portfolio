import type { StaticImageData } from "next/image";

import alunaut from "./marks/alunaut.png";
import argonaut from "./marks/argonaut.svg";
import argotemp from "./marks/argotemp.png";
import dell from "./marks/dell.svg";
import instatus from "./marks/instatus.svg";
import littleLads from "./marks/little-lads.png";
import loom from "./marks/loom.png";
import tnn from "./marks/tnn.png";
import unitar from "./marks/unitar.png";
import wholana from "./marks/wholana.svg";

/* ── The mark registry ────────────────────────────────────────────────────
   Every mark here is the brand's *symbol* wherever it has one: Argonaut's
   trimeric knot rather than "ARGONAUT · BRIDGING GAPS", Loom's app glyph
   rather than its logotype. The row already says the name in 17px medium
   two millimetres to the right; a logotype squeezed into a 20px box is a
   second, worse copy of that word, where the symbol does the thing the
   text can't and is recognised before it is read. TNN, Argotemp and
   Alunaut have only a monogram, which is close enough to a symbol to
   survive the size; Alunaut's is the periodic-table cell for aluminium,
   which is a symbol in the strict sense and reads as one at 20px.

   Little Lads is the one logotype here, because it has no symbol to use
   instead and the drawing is distinctive enough to survive: it is set in
   a rounded hand-lettered face with looping tails, so it reads as a shape
   before it reads as the word, which is the test the rule was protecting.

   Each mark is trimmed to its own artwork. Several shipped centred in a
   much larger canvas (Argonaut's ico occupied 94 of a 578×781 viewBox),
   which at 20px is the difference between a logo and a speck. SVGs are
   retightened by rewriting the viewBox, so the path data is still the
   brand's own file; rasters are cropped to their alpha bounds.

   White backgrounds are keyed out rather than kept: a mark sitting on an
   opaque white chip is invisible against the page and then suddenly a
   white square the moment a row is hovered. Three marks are exceptions,
   all marked `field` to say the artwork *is* the tile: Argotemp's
   monogram is white on blue and Alunaut's is white on charcoal, so keying
   either would leave nothing at all, and Little Lads is orange on its
   brand's cream, which is a colour the page does not otherwise have and
   so cannot be mistaken for a chip that failed to load.

   Rasters are stored at ≥128px, 6.4× the 20px render, which covers 3×
   displays with room left if a mark is ever wanted larger on a case
   study. The two most recent are 256px, which is what their sources gave
   without upscaling. */
export type Mark = {
  src: StaticImageData;
  /** The organisation, for the alt text. Not the row title: the row for the
      UN platform is titled by the product, but the mark is UNITAR's. */
  name: string;
  /** The artwork carries its own background and should fill the tile edge
      to edge, clipped by its radius, instead of floating inside it. */
  field?: boolean;
};

export const MARKS = {
  instatus: { src: instatus, name: "Instatus" },
  wholana: { src: wholana, name: "Wholana" },
  tnn: { src: tnn, name: "TikTok News Network" },
  loom: { src: loom, name: "Loom Cairo" },
  argonaut: { src: argonaut, name: "Argonaut" },
  argotemp: { src: argotemp, name: "Argotemp", field: true },
  alunaut: { src: alunaut, name: "Alunaut", field: true },
  "little-lads": { src: littleLads, name: "Little Lads", field: true },
  unitar: { src: unitar, name: "UNITAR" },
  dell: { src: dell, name: "Dell Technologies" },
} satisfies Record<string, Mark>;

export type MarkName = keyof typeof MARKS;
