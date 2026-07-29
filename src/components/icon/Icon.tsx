import { GLYPHS, type Glyph, type IconName } from "./glyphs";

import { cn } from "@/lib/utils";

/* ── Icon size system ─────────────────────────────────────────────────────
   Semantic names, matching how the type scale is named: a call site says
   what the icon *is doing* rather than how big it happens to be.

   `stroke` is the weight in **rendered pixels**, not in grid units, and
   that inversion is the whole point of the table. Hugeicons draws at 1.5
   on a 24 grid; scale that master down to 12px and the stroke arrives at
   0.75px, which no longer covers a device pixel and goes grey and soft.
   Icon.tsx counter-scales (grid units = stroke × (grid / px)) so the
   number below is what actually lands on screen at every size.

   The curve runs 1.1px at 12 to 1.5px at 24, i.e. weight rises with size
   but sub-linearly, so small icons are proportionally *heavier* than the
   master and large ones sit at the master's own weight. That is the same
   shape as the tracking curve in the `@theme` block of globals.css, for the
   same reason:
   an optical property is a function of size, not a value anyone types by
   hand at the call site.

   The targets are picked against Inter, not in the abstract. This is the
   "unified weight" constraint. Inter Regular's stem is roughly 1.2px at
   17px and Medium's roughly 1.4px, so an icon set beside body copy at
   1.2–1.3px reads as the same instrument. A 0.75px icon next to it reads
   as a different product.

   `gap` is the breathing room to an adjacent label, and it belongs here
   rather than at the call site for the same reason the stroke does: it
   scales with the icon, and left to individual judgement it drifts. The
   4px that `gap-1` gives is a collision at these sizes. */
export const ICON_SIZES = {
  /** Beside 11–13px meta text: dates, captions, section labels. */
  micro: { px: 12, stroke: 1.1, gap: "gap-1.5" },
  /** Beside 15–17px body copy. The default, and where most of these live. */
  inline: { px: 14, stroke: 1.2, gap: "gap-1.5" },
  /** Inside a control: button, disclosure, row affordance. */
  control: { px: 16, stroke: 1.3, gap: "gap-2" },
  /** Standalone in navigation, unaccompanied by a label. */
  nav: { px: 20, stroke: 1.4, gap: "gap-2" },
  /** Carrying meaning on its own at the head of a block. */
  feature: { px: 24, stroke: 1.5, gap: "gap-2.5" },
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/** The label gap that belongs to a given icon size. Static strings so
    Tailwind's scanner sees them. */
export function iconGap(size: IconSize) {
  return ICON_SIZES[size].gap;
}

type IconProps = {
  name: IconName;
  size?: IconSize;
  className?: string;
  /**
   * Announced name. Omit it (the default) when the icon repeats something
   * the adjacent text already says, which is the case for every icon on
   * this site: the arrow after "Instatus" adds nothing a screen reader
   * needs, and the link's own text carries the destination. Pass a label
   * only when the icon is the sole carrier of the meaning.
   */
  label?: string;
};

export function Icon({ name, size = "inline", className, label }: IconProps) {
  const glyph: Glyph = GLYPHS[name];
  const { px, stroke } = ICON_SIZES[size];

  /* Below 16px the 24-grid drawing loses its finer moves, so the re-cut
     master takes over where one exists. This is the size system doing real
     work rather than declaring five multipliers of one drawing. */
  const master = px <= 16 && glyph.small ? glyph.small : glyph.master;

  const paths = master.d.map((d, i) => <path key={i} d={d} />);

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${master.grid} ${master.grid}`}
      fill="none"
      stroke="currentColor"
      /* Set once, on the root, so every path inherits it and no vendored
         path can carry a stale weight from upstream. */
      strokeWidth={stroke * (master.grid / px)}
      strokeLinecap="round"
      strokeLinejoin="round"
      /* shrink-0 because these sit in flex rows next to text that wraps;
         without it the icon is the thing that gives. */
      className={cn("shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {master.nudge ? (
        <g transform={`translate(${master.nudge[0]} ${master.nudge[1]})`}>{paths}</g>
      ) : (
        paths
      )}
    </svg>
  );
}
