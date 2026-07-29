"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { StaticImageData } from "next/image";

import { Lightbox } from "@/components/ui/lightbox";

/* ── Case-study scroller ──────────────────────────────────────────────────
   The horizontal track every work page is built around, after
   glenn.me/fueled.

   Three decisions carry it, and they're all about the same thing: the
   track has to read as a piece of film running past the page, not as a
   widget sitting on it:

     full bleed    The track spans the viewport, inset by 12px on every
                   side. The prose column stays at 640px. Nothing else on
                   the page is wider than the column, so the images are the
                   only thing that moves horizontally, and the eye reads
                   them as a different plane rather than a bigger figure.

     tile > frame  A tile is 1036px, which at a 1440px viewport leaves the
                   next one cut off at the right edge. That overhang *is*
                   the affordance: a strip that fits exactly looks finished
                   and nobody drags it. Below 1036px the tile is the full
                   track width, so on a phone it's one image at a time.

     native snap   scroll-snap-type: x mandatory with centre alignment, so
                   a trackpad flick lands on an image rather than between
                   two. No JS drives the scrolling; the arrows below only
                   nudge the same native scroll, which is why a flick, a
                   shift-wheel, a click and a keyboard all agree.

   One departure from his. Every image in a Fueled track was shot at the same
   aspect, so uniform tiles came for free. Ours are screenshots at whatever
   the artboard happened to be (3840×1380 next to 3840×2040) and equal
   *widths* would leave the tops flush and the bottoms ragged, which is the
   one thing a strip cannot survive. So the tile is equalised on height and
   left to find its own width: the track takes its height from the widest
   image in the set, and every tile comes out as wide as its own proportions
   make it. Nothing is cropped, no tile is wider than the frame, and a set
   that *does* share an aspect renders identically to his, uniform in both
   directions.

   The height is CSS, not measurement: `100cqw` reads the wrapper's own width
   through a container query, so it survives a resize with no listener and no
   second paint.

   The arrows exist because a mouse-only visitor has no gesture for
   horizontal scroll. They're deliberately the smallest possible control
   (32px, black at 85%, no chrome) and each fades out at its end of the
   track rather than staying on as a dead button. */

export type ScrollerImage = { src: StaticImageData; alt?: string };

const GAP = 12;

export function CaseStudyScroller({
  images,
  maxTileHeight,
}: {
  images: ScrollerImage[];
  /* A ceiling on the tile height, in px. Omitted everywhere in the case
     studies, which is the point: their images are landscape screenshots, so
     `tile width / widest ratio` already lands near 380 and a cap would never
     bite.

     It exists for /about, whose photos are portrait. Uncapped, the height
     rule reads the widest member of the set, and a set whose widest member
     is barely wider than it is tall (1296x1280, ratio 1.01) solves to a
     1023px tile: one photo filling the viewport, which is a slideshow, not a
     strip. What a set of photographs wants is the opposite reading, several
     frames across the page at once with the rest running off the edge.

     Capping the height rather than the width is what gets there without
     touching anything else the track does. Tiles stay equal in height, each
     keeps its own proportions, nothing is cropped, and the narrower tiles
     that fall out of it are exactly the point: more of the collage is on
     screen, and there is more of it left over. */
  maxTileHeight?: number;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  /* One measurement for both arrows. `atEnd` starts true so a track that
     doesn't overflow (a single image) renders with neither arrow, and a
     track that does gets its next arrow on the first frame after mount. */
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    measure();

    /* Resize as well as scroll: the tile is `min(1036px, 100%)`, so a
       window drag across that threshold changes whether the track overflows
       at all, and the arrows have to follow. */
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.addEventListener("scroll", measure, { passive: true });

    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", measure);
    };
  }, [measure]);

  const scrollByTile = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    /* Measured off the rendered tile rather than the 1036 constant, so the
       nudge stays exactly one image at every breakpoint. */
    const tile = track.firstElementChild?.getBoundingClientRect().width ?? track.clientWidth;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    track.scrollBy({ left: direction * (tile + GAP), behavior: reduced ? "auto" : "smooth" });
  };

  /* A track of one is not a track. Left in the flex row it would sit hard
     against the left gutter with 400px of white beside it, because the first
     tile of an overflowing strip is supposed to start at the edge, correct
     for a strip, wrong for the only image in a block. Centred instead, at
     the same tile width and the same 12px inset, so it reads as one frame of
     the same film. */
  if (images.length === 1) {
    return (
      <div className="w-full p-3">
        {/* The cap and the centring move to a wrapper so that
            `data-case-bleed` sits on the image's real box; the padded row
            around it is full-width whatever the image does, and the line nav
            measures against this to decide whether it's in the way. */}
        <div data-case-bleed className="mx-auto w-full max-w-[1036px]">
          <Lightbox
            src={images[0].src}
            alt={images[0].alt ?? ""}
            placeholder="blur"
            sizes="(max-width: 1080px) 100vw, 1036px"
            className="h-auto w-full"
          />
        </div>
      </div>
    );
  }

  /* The *widest* image is the one that sets the height, because it's the one
     that would overflow the frame first: give it exactly the tile width and
     the height that falls out of it, and every squarer image in the set comes
     out the same height and narrower than the frame. Sizing off the narrowest
     instead inverts it: the wide shot ends up 1531px in a 1036px frame. */
  const widest = Math.max(...images.map(({ src }) => src.width / src.height));

  return (
    /* `data-case-bleed` marks the tracks that run into the page's margins, so
       the line nav in the left margin can measure itself against them and get
       out of the way. Set here rather than on <figure> because the caption
       sits in the prose column and never reaches anything. */
    <div data-case-bleed className="@container relative w-full">
      <ul
        ref={trackRef}
        style={
          {
            "--tile-h": maxTileHeight
              ? `min(calc(min(1036px, 100cqw - 24px) / ${widest}), ${maxTileHeight}px)`
              : `calc(min(1036px, 100cqw - 24px) / ${widest})`,
          } as CSSProperties
        }
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain p-3"
      >
        {images.map((image, i) => (
          <li
            key={i}
            style={
              {
                "--tile-a": `${image.src.width / image.src.height}`,
              } as CSSProperties
            }
            /* `relative` is load-bearing, and not for anything visible. The
               lightbox renders an absolutely positioned ghost beside each
               image, and the track (a static box) is not a containing block
               for it. Left alone, every ghost escapes the scroller's
               `overflow-x` and lays itself out against the nearest positioned
               ancestor, which is the `relative` wrapper below: the tiles the
               track was clipping reappear as page-wide overflow, and the whole
               document gains a horizontal scrollbar the width of the strip.
               Positioning the tile makes it the ghost's containing block, so
               the ghost scrolls and clips with the tile it belongs to. It also
               fixes the ghost's own numbers, which the library reads off
               `offsetLeft`/`offsetTop`: measured against the tile they are
               (0, 0) at every scroll position. */
            className="case-tile relative h-[var(--tile-h)] w-[calc(var(--tile-h)*var(--tile-a))] shrink-0 snap-center snap-always"
            aria-label={`${i + 1} of ${images.length}`}
          >
            <Lightbox
              src={image.src}
              alt={image.alt ?? ""}
              placeholder="blur"
              /* Widest a tile can be is the tile width itself, which is what
                 the narrowest image gets, so one hint covers the set. */
              sizes="(max-width: 1080px) 100vw, 1036px"
              /* Exact fit rather than a fit mode: the tile was sized from
                 this image's own ratio, so `w-full h-full` can't distort it
                 and nothing is cropped. */
              className="h-full w-full"
            />
          </li>
        ))}
      </ul>

      {/* Sits over the track, but only the buttons take the pointer. The
          gap between them has to stay scrollable. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-3">
        <Arrow direction="previous" hidden={atStart} onClick={() => scrollByTile(-1)} />
        <Arrow direction="next" hidden={atEnd} onClick={() => scrollByTile(1)} />
      </div>
    </div>
  );
}

function Arrow({
  direction,
  hidden,
  onClick,
}: {
  direction: "previous" | "next";
  hidden: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={hidden}
      aria-label={direction === "next" ? "Next image" : "Previous image"}
      /* `disabled` rather than unmounting: the pair keeps its position at
         both ends of the track, so arriving at the last image reads as the
         arrow going out rather than as the control moving. It also takes
         the button out of the tab order while it's invisible. */
      /* Ink at 85% with the canvas colour punched through it, rather than a
         literal black chip with a white arrow. The pair inverts together, so
         in dark this is a near-white chip carrying a dark arrow, which is
         what keeps the control legible over a light screenshot *and* over
         the dark page it now bleeds onto at the ends of the track. */
      className={`bg-foreground/85 text-background focus-visible:ring-background/70 pointer-events-auto flex size-8 items-center justify-center rounded-full transition-opacity duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={direction === "previous" ? "-scale-x-100" : ""}
      >
        <path
          d="M6 3.5L10.5 8L6 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
