"use client";

import type React from "react";
import { TextMorph } from "torph/react";

/**
 * Wraps torph so every in-place text swap morphs with the site's motion
 * signature instead of snapping. Shared characters slide to their new position
 * while only the changed ones cross-fade, which is what makes a label
 * ("Copy" → "Copied") read as one continuous state rather than two.
 *
 * Children must be a plain string: torph segments the text itself, so an
 * element here has nothing to diff against.
 *
 * The easing is the site's standard `cubic-bezier(0.23, 1, 0.32, 1)`, the
 * same curve the accordion and tab pill run on (see globals.css), so a
 * morphing label decelerates on the same clock as everything around it.
 * Reduced-motion is handled inside torph via `respectReducedMotion`, which is
 * on by default.
 */
export function AnimatedText({
  children,
  className,
  as,
}: {
  children: string;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <TextMorph
      duration={300}
      ease="cubic-bezier(0.23, 1, 0.32, 1)"
      className={className}
      as={as}
    >
      {children}
    </TextMorph>
  );
}
