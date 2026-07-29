"use client";

import { useId } from "react";

import { ICON_SIZES, type IconSize } from "@/components/icon/Icon";
import { cn } from "@/lib/utils";

/**
 * The spinner's resolved state: a filled disc with the check cut *out* of
 * it, so the tick is whatever surface the mark is sitting on.
 *
 * Knocked out rather than drawn. The reference does the same thing, and the
 * reason is that it inverts the figure/ground relationship at exactly the
 * moment the state changes: the ring was ink on a surface, the disc is a
 * surface-coloured mark in a field of ink. That flip is legible at 16px in a
 * way that swapping one stroked glyph for another is not, which is the whole
 * job of a completion state: to be unmistakably *different*, not merely
 * next.
 *
 * A mask does it rather than `fill-rule="evenodd"`, because evenodd would
 * need the check as a closed outline: a stroked polyline expanded to a
 * filled shape by hand, which is unreadable path data and would have to be
 * re-cut for any change of weight. The mask lets the tick stay a stroke with
 * the same round caps and joins as the rest of the icon set.
 *
 * The hole is genuinely transparent, so this needs no knowledge of the
 * surface behind it and stays correct in both themes and on any fill.
 */
export function SuccessMark({
  size = "control",
  className,
  label,
}: {
  size?: IconSize;
  className?: string;
  label?: string;
}) {
  const { px } = ICON_SIZES[size];
  /* Two instances on one page would otherwise share a mask id, and the
     second one silently renders through the first one's definition. */
  const maskId = useId();

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <mask id={maskId}>
        {/* White keeps, black cuts. The disc is the full drawable radius
            (11.1 = the spinner's own outer edge, R + STROKE/2), so the mark
            lands at exactly the size the ring it replaces occupied, so the
            crossfade is then a change of figure, with no change of mass. */}
        <circle cx={12} cy={12} r={11.1} fill="white" />
        <path
          d="M7.6 12.4 L10.6 15.3 L16.4 9.4"
          stroke="black"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </mask>

      <circle cx={12} cy={12} r={11.1} fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
