import type { StaticImageData } from "next/image";

import argonaut from "./marks/argonaut.svg";
import argotemp from "./marks/argotemp.png";
import dell from "./marks/dell.svg";
import instatus from "./marks/instatus.svg";
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
   text can't and is recognised before it is read. TNN and Argotemp have
   only a monogram, which is close enough to a symbol to survive the size.

   Each mark is trimmed to its own artwork. Several shipped centred in a
   much larger canvas (Argonaut's ico occupied 94 of a 578×781 viewBox),
   which at 20px is the difference between a logo and a speck. SVGs are
   retightened by rewriting the viewBox, so the path data is still the
   brand's own file; rasters are cropped to their alpha bounds.

   White backgrounds are keyed out rather than kept: a mark sitting on an
   opaque white chip is invisible against the page and then suddenly a
   white square the moment a row is hovered. Argotemp is the exception:
   its monogram is white on blue, so keying it would leave nothing at all,
   and it is marked `field` to say the artwork *is* the tile.

   Rasters are stored at ≥128px, 6.4× the 20px render, which covers 3×
   displays with room left if a mark is ever wanted larger on a case
   study. */
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
  unitar: { src: unitar, name: "UNITAR" },
  dell: { src: dell, name: "Dell Technologies" },
} satisfies Record<string, Mark>;

export type MarkName = keyof typeof MARKS;
