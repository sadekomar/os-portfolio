/* ── Vendored Hugeicons geometry ──────────────────────────────────────────
   Path data copied out of @hugeicons/core-free-icons@4.2.3 (Stroke Rounded,
   the free tier) and hand-corrected here rather than pulled in as a runtime
   dependency. Three reasons, in order:

   1. The site renders three glyphs. A 4,000-icon package to serve three of
      them is a tree-shaking bet we don't need to place.
   2. A package can't be hand-corrected. Optical centring and a per-size
      master both mean editing the paths, which means owning them.
   3. Every master here is diffable against a named upstream icon, so a
      Hugeicons release can be re-checked deliberately instead of arriving
      silently through a caret range.

   Adding a glyph:
     npm pack @hugeicons/core-free-icons@<version>
     tar xzf *.tgz && cat package/dist/esm/<Name>Icon.js
   Copy the `d` values, drop `stroke` / `strokeWidth` / `strokeLinecap` /
   `strokeLinejoin`. Icon.tsx owns all four, because stroke weight is a
   function of render size (see ICON_SIZES) and cannot live in the data.

   Only Stroke Rounded exists in the free set, so there are no filled
   counterparts and therefore no contextual swap. State is signalled with
   colour and stroke weight instead, which is the quieter move regardless. */

export type GlyphMaster = {
  /** Side of the square grid the paths are drawn on. */
  grid: number;
  /** Subpaths, in grid units. */
  d: string[];
  /**
   * Optical correction in grid units, applied as a translate before render.
   * The geometric centre of a bounding box is not where the eye puts the
   * centre: a left-pointing chevron carries its ink at the tip and reads
   * left-heavy when its box is centred.
   */
  nudge?: readonly [number, number];
};

export type Glyph = {
  /**
   * The one action or state this glyph is allowed to carry. If a second
   * meaning wants this shape, that second meaning needs a different shape,
   * an icon overloaded across two actions teaches neither. The registry
   * below is keyed by meaning, not by shape, so the collision has to be
   * argued for at the point of adding it.
   */
  meaning: string;
  /** Upstream Hugeicons export name, for re-pulling and re-diffing. */
  source: string;
  /** Drawn at 24. Used at render sizes above 16px. */
  master: GlyphMaster;
  /**
   * Drawn at 16, used at render sizes of 16px and below. Not a scaled
   * master: the 24-grid drawing is re-cut with fewer, coarser decisions so
   * its detail survives at half the size. Optional, since a glyph simple enough
   * to hold up under scaling doesn't need one.
   */
  small?: GlyphMaster;
};

export const GLYPHS = {
  /* Leaves this site. Not "opens a panel", not "expand", not "go": those
     are different actions and would need different shapes.

     Hugeicons draws this arrow with a curved head rather than a straight
     mitre, which is the house character; the small master preserves the
     curve rather than falling back to a generic straight arrow, so the
     14px and 24px versions still read as the same drawing.

     The master's ink spans x 6.5–17.35 and y 6.11–17.5, centred on the
     24 grid, so no nudge. The re-cut small master lands at (8.2, 7.75)
     against a centre of (8, 8), hence the correction. Its strokes are all
     diagonal or curved, so nothing is lost by moving off integer
     coordinates, and there is no axis-aligned edge to keep on the pixel grid. */
  external: {
    meaning: "Opens somewhere outside this site",
    source: "ArrowUpRight01Icon",
    master: {
      grid: 24,
      d: [
        "M9 6.65032C9 6.65032 15.9383 6.10759 16.9154 7.08463C17.8924 8.06167 17.3496 15 17.3496 15M16.5 7.5L6.5 17.5",
      ],
    },
    small: {
      grid: 16,
      d: ["M6 4.5C6 4.5 10.5 4.15 11.25 4.75C12 5.35 11.5 10 11.5 10M11 5L4.5 11.5"],
      nudge: [-0.2, 0.25],
    },
  },

  /* Back to the index one level up. A chevron, deliberately not the same
     arrow as `external` mirrored: "return to where you were" and "leave for
     somewhere else" are different enough promises that they should not share
     a silhouette.

     This replaces a literal "←" character, which came from the font rather
     than the icon set and so carried the font's stroke weight, its own
     baseline offset, and no relationship to anything else on the page.

     Both masters are geometrically centred. The nudge is the optical
     correction: the two strokes converge at the left tip, putting the ink
     centroid left of the box centre, so the drawing reads as sitting too
     far left until it moves right. */
  back: {
    meaning: "Returns to the index this page came from",
    source: "ArrowLeft01Icon",
    master: {
      grid: 24,
      d: ["M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18"],
      nudge: [0.25, 0],
    },
    small: {
      grid: 16,
      d: ["M10 4C10 4 6 6.95 6 8C6 9.05 10 12 10 12"],
      nudge: [0.17, 0],
    },
  },

  /* Steps sideways through the case studies. One glyph for both directions,
     flipped with scaleX for "previous" (see Pager.tsx) rather than drawn
     twice, the same argument `disclosure` makes below: two directions of
     one control, not two controls.

     Deliberately an arrow with a shaft, where `back` is a bare chevron. The
     two movements are different promises. `back` leaves the case study for
     the index above it, this one stays inside the sequence and moves along
     it, so they don't share a silhouette. The head keeps the house curve,
     so it still reads as the same hand that drew `back`.

     Both masters span x 5–19 (and 3.5–12.5 on the 16 grid) against centres
     of 12 and 8, so they are drawn centred and need no nudge: a shafted
     arrow spreads its ink across the full width rather than piling it at
     the tip, which is exactly the imbalance `back` has to correct for.

     The small master is re-cut with a straight mitred head on whole grid
     units: at 12–16px the curve is a soft grey smudge, and two clean
     diagonals read as a sharper arrow than a faithful miniature does. */
  sibling: {
    meaning: "Moves to the adjacent case study in the sequence",
    source: "ArrowRight02Icon",
    master: {
      grid: 24,
      d: ["M5 12H19", "M13 6C13 6 19 10.4189 19 12C19 13.5812 13 18 13 18"],
    },
    small: {
      grid: 16,
      d: ["M3.5 8H12", "M8.5 4.5L12.5 8L8.5 11.5"],
    },
  },

  /* Expands and collapses the thing it sits on. Flipped with scaleY when
     open (see .t-acc-chevron in globals.css) rather than swapped for a
     second glyph, so open and closed are visibly one control in two states.

     The small master is where this glyph actually lives, and it is drawn,
     not scaled: 4/8/12 on x and 6/10 on y are whole grid units, so at a
     16px render every vertex lands on a device pixel and the two diagonals
     stay clean. The 24-grid master is the upstream drawing, kept for the
     sizes where its softer curve is legible. */
  disclosure: {
    meaning: "Expands or collapses the section it labels",
    source: "ArrowDown01Icon",
    master: {
      grid: 24,
      d: ["M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9"],
    },
    small: {
      grid: 16,
      d: ["M4 6L8 10L12 6"],
    },
  },

  /* Work is in flight. The only glyph here that is never static; it is
     always inside `animate-spin` (see ui/spinner.tsx), which is also why it
     is the one glyph whose drawing is radially symmetric rather than
     optically balanced: a wheel that spins has no reading direction to
     correct for, so there is no nudge on either master.

     Eight spokes rather than four, and that is a rotation decision rather
     than a drawing one. `animate-spin` is a linear 360° sweep, so the
     perceived cadence is the symmetry order: at 8-fold the wheel reads as
     one continuous motion, at 4-fold it strobes.

     Both masters run the spokes from outer radius to 2/3 of it (9→6 on the
     24 grid, 6→4 on the 16), which is what keeps the hub open. A spinner
     whose spokes reach the centre fills in to a blot at small sizes.

     The small master re-cut puts the four axis-aligned spokes on whole grid
     units so they hold a device pixel at 12–14px. The diagonals can't land
     on integers and don't need to: they carry no axis-aligned edge, the
     same argument `external` makes above. */
  loading: {
    meaning: "An action is in flight and has not resolved yet",
    source: "Loading03Icon",
    master: {
      grid: 24,
      d: [
        "M12 3V6",
        "M12 18V21",
        "M21 12L18 12",
        "M6 12L3 12",
        "M18.3635 5.63672L16.2422 7.75804",
        "M7.75804 16.2422L5.63672 18.3635",
        "M18.3635 18.3635L16.2422 16.2422",
        "M7.75804 7.75804L5.63672 5.63672",
      ],
    },
    small: {
      grid: 16,
      d: [
        "M8 2V4",
        "M8 14V12",
        "M14 8L12 8",
        "M2 8L4 8",
        "M12.24 3.76L10.83 5.17",
        "M5.17 10.83L3.76 12.24",
        "M12.24 12.24L10.83 10.83",
        "M5.17 5.17L3.76 3.76",
      ],
    },
  },
} as const satisfies Record<string, Glyph>;

export type IconName = keyof typeof GLYPHS;

/* Meaning collision is a review problem, not a type problem. The registry
   being keyed by meaning stops the same *name* serving two actions, but
   nothing stops two names being given the same drawing. This catches that,
   in development only. */
if (process.env.NODE_ENV !== "production") {
  const seen = new Map<string, string>();

  for (const [name, glyph] of Object.entries(GLYPHS)) {
    const shape = glyph.master.d.join("|");
    const prior = seen.get(shape);

    if (prior) {
      console.error(
        `[icons] "${name}" and "${prior}" are the same drawing carrying two meanings.\n` +
          `        "${(GLYPHS[name as IconName] as Glyph).meaning}"\n` +
          `        "${(GLYPHS[prior as IconName] as Glyph).meaning}"\n` +
          `        Give one of them its own shape, or collapse them into one name.`,
      );
    }

    seen.set(shape, name);
  }
}
