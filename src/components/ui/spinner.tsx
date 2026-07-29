import { ICON_SIZES, type IconSize } from "@/components/icon/Icon";
import { cn } from "@/lib/utils";

/* ── Geometry ─────────────────────────────────────────────────────────────
   Measured off the reference recording frame by frame, not chosen: the
   radial profile put the ring's centreline at r≈9.4 with a stroke of ≈4.4
   in a box whose drawable radius was ≈11.6, and the angular profile put the
   lit arc at 110° with flat brightness across all of it.

   Authored on the same 24 grid as GLYPHS so it sits in the icon system's
   coordinate space, then scaled to whatever size the call site asks for.
   The stroke is deliberately NOT run through the ICON_SIZES stroke curve.
   see the note on `strokeWidth` below. */
const R = 9;
const STROKE = 4.2;
const SWEEP_DEG = 110;

/** How faint the untravelled part of the ring is, against the arc's ink. */
const TRACK_OPACITY = 0.11;

const CIRCUMFERENCE = 2 * Math.PI * R;

/* Round caps overhang the path by half a stroke at each end, adding a full
   stroke's worth of arc length to what actually lands on screen. Drawing a
   dash of exactly 110° would therefore render as ~137°. Subtracting it here
   means SWEEP_DEG stays the number you'd measure off a screenshot, which is
   the number that was measured off the reference in the first place. */
const DASH = (SWEEP_DEG / 360) * CIRCUMFERENCE - STROKE;

/**
 * The site's one loading spinner: a 110° arc travelling clockwise around a
 * faint track, once every 500ms.
 *
 * Drawn here rather than pulled from GLYPHS, which is the departure worth
 * explaining. Every other icon on this site is a static path rendered
 * through <Icon>, and the registry has no way to express a stroke that is
 * only partly drawn: the dash geometry *is* what this drawing is, not
 * styling applied to one. The keyframes and the argument for the shape are
 * in globals.css, next to the rest of the motion.
 *
 * It still takes an `IconSize` rather than a className, because it has to
 * agree with the icons it sits beside on *size*: `control` is 16px because
 * that is what sits inside a Button, and passing `size-*` instead would let
 * a call site put a 22px spinner next to a 16px chevron.
 *
 * What it does NOT inherit is ICON_SIZES' stroke curve. That curve exists to
 * make a line drawing read at the same weight as the Inter beside it, and
 * this is not a line drawing; it is a ring whose stroke-to-radius ratio is
 * the thing that makes it recognisable. Run through the icon curve it would
 * arrive at ~1.3px and become a hairline circle, which is a different
 * spinner. The stroke scales with the drawing instead.
 *
 * One thing to know before colouring it: `currentColor` is the ink of the
 * *arc*, and the track is derived from it at 11%. Give it the weight you
 * want the moving part to have, or let it inherit from the control around
 * it.
 */
export function Spinner({
  size = "control",
  className,
  /** Announced to assistive tech. The surrounding control usually carries
      the state (`aria-busy`, a live label), so this defaults to silent
      rather than adding a second announcement of the same fact. */
  label,
}: {
  size?: IconSize;
  className?: string;
  label?: string;
}) {
  const { px } = ICON_SIZES[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      /* Most of why this reads as modern rather than as a pie slice. A
         butt-capped arc at this weight has two visible corners and the ring
         looks cut; round caps make it look drawn. */
      strokeLinecap="round"
      /* shrink-0 because these sit in flex rows next to text that wraps;
         without it the spinner is the thing that gives. */
      className={cn("spinner-rotate shrink-0", className)}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {/* The track. Present at rest under the whole rotation, which is what
          keeps the arc reading as travelling *along* something rather than
          as a lone stroke adrift in a box. */}
      <circle cx={12} cy={12} r={R} opacity={TRACK_OPACITY} />

      {/* The arc. Started at 12 o'clock rather than at SVG's native 3
          o'clock. Nothing depends on it while it's spinning, but it makes
          the first painted frame the one you'd draw by hand, which matters
          on a fetch that resolves before the first rotation completes. */}
      <circle
        cx={12}
        cy={12}
        r={R}
        strokeDasharray={`${DASH} ${CIRCUMFERENCE - DASH}`}
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
}
