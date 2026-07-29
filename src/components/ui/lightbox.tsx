"use client";

import Image, { type ImageProps } from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import { cn } from "@/lib/utils";

/**
 * Click-to-enlarge for images. `react-medium-image-zoom` owns the whole
 * interaction: it measures the thumbnail, clones it into a <dialog>, and
 * scales the clone to fit, so the morph, focus trap, Escape, scroll-to-
 * dismiss and the zoom-in/zoom-out cursors all come for free, and none of it
 * is reimplemented here.
 *
 * A <dialog> rather than a portal-and-overlay of our own is the reason to take
 * the dependency at all: the top layer is what keeps the enlarged image above
 * sticky headers and out of reach of ancestor `overflow: hidden`, which is
 * exactly the class of bug a hand-rolled lightbox spends its life fixing.
 *
 * The library ships a hardcoded white overlay; the `.lightbox-dialog` rules in
 * globals.css repoint it at `--background` so it follows the theme instead of
 * flashing white in dark mode.
 */
export function Lightbox({
  className,
  /* Destructured rather than left in `...props` only so the a11y lint can see
     it; `ImageProps` already makes it required at the type level. */
  alt,
  /**
   * Air left around the enlarged image. One `--radius-outer` worth (24px) so
   * the image clears the viewport edge by the same distance a container's
   * corner turns through.
   */
  zoomMargin = 24,
  ...props
}: ImageProps & { zoomMargin?: number }) {
  return (
    <Zoom zoomMargin={zoomMargin} classDialog="lightbox-dialog">
      {/* Only the cursor is imposed. Sizing and radius stay with the call
          site, because this wraps images that already have a layout: a
          `w-full rounded-lg` baked in here would silently restyle every
          figure it was dropped into. */}
      <Image {...props} alt={alt} className={cn("cursor-zoom-in", className)} />
    </Zoom>
  );
}
