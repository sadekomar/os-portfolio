"use client";

import Image, { type StaticImageData } from "next/image";

type PanelMediaProps = {
  /** Layered CSS background for the painterly backdrop. */
  backdrop: string;
  src: StaticImageData;
  alt: string;
  /** Fixed floating-card crop window, in CSS px. */
  cardWidth: number;
  cardHeight: number;
  /** Rendered width of the full screenshot inside the crop window. */
  imageWidth: number;
  /** Negative offsets that slide the chosen region into the window. */
  imageLeft: number;
  imageTop: number;
  /** Card offset from the panel centre; the card keeps this anchor while the panel crops around it. */
  offsetX: number;
  offsetY: number;
};

/**
 * A quiet tonal backdrop with a fixed-size floating product card over it. The
 * card is centre-anchored with a pixel offset, so a collapsing panel crops the
 * scene from both edges while the card holds its size and position.
 *
 * Every number below is CSS px against `imageWidth`, not against the file's
 * intrinsic pixels, which is why the screenshots could be resampled on the way
 * into this directory without any of the crops moving.
 */
export function PanelMedia({
  backdrop,
  src,
  alt,
  cardWidth,
  cardHeight,
  imageWidth,
  imageLeft,
  imageTop,
  offsetX,
  offsetY,
}: PanelMediaProps) {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: backdrop }}
      />
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
        }}
      >
        <div className="rounded-2xl bg-white/70 p-1.5 shadow-[0_24px_50px_-18px_rgba(56,48,38,0.35)] backdrop-blur-[2px]">
          <div
            className="relative overflow-hidden rounded-[12px] bg-white"
            style={{ width: cardWidth, height: cardHeight }}
          >
            <Image
              src={src}
              alt={alt}
              sizes={`${imageWidth}px`}
              className="absolute max-w-none"
              style={{
                width: imageWidth,
                height: "auto",
                left: imageLeft,
                top: imageTop,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
