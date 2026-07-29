"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/* ── YouTube, embedded as a facade ────────────────────────────────────────
   A real YouTube iframe is ~1.2MB across ~25 requests before anyone has
   pressed anything, and it lands three third-party origins in the critical
   path. On a site whose whole argument is "fast and quiet" (docs/north-
   stars.md) that is the single heaviest thing we could put on a page, and
   it would be paid on load by every visitor who scrolls past without
   watching.

   So nothing of YouTube is loaded until a click. Until then the embed is a
   poster image and a play button (one JPEG from a CDN) and the iframe is
   mounted only in response to the press that wanted it. This is the
   lite-youtube pattern, and it is what glenn.me/prism does: an element
   backed by `i.ytimg.com/vi/<id>/maxresdefault.jpg` with a play control
   over it, swapped for the player on click.

   Three details make the swap invisible rather than merely deferred:

     warm on intent   Pointer-enter and focus are a reliable half-second of
                      warning before a click. We spend it on preconnects to
                      the four origins the player will need, so the TCP and
                      TLS handshakes are already done when the iframe
                      appears. Not done at render, since that would move the cost
                      back onto everyone, which is the thing we're avoiding.

     autoplay=1       The click that mounts the iframe is not seen by the
                      player, so without this the visitor would have to
                      press play a second time on YouTube's own button. The
                      press is a genuine user gesture, so autoplay with
                      sound is permitted here in a way it wouldn't be on
                      load.

     poster fallback  `maxresdefault.jpg` is 1280×720 and the only thumbnail
                      worth showing at our 1036px track width, but YouTube
                      only generates it when the source was at least that
                      big. For anything smaller it 404s, and it 404s with a
                      120×90 grey placeholder rather than an empty body, so
                      the swap has to be driven by the error and not by
                      inspecting what came back. `sddefault.jpg` is the
                      fallback: 640×480, present for every video, and a
                      clear step up from the 480×360 `hqdefault` that the
                      usual recipe reaches for. Both are 4:3, and
                      object-cover crops the letterbox back off: 640×480
                      centre-cropped to 640×360 is exactly the frame minus
                      the bars YouTube padded it with.

   `youtube-nocookie.com` rather than `youtube.com`: it sets no tracking
   cookie until playback, which is the correct default for an embed the
   visitor hasn't consented to and costs nothing.

   The play button is the site's own control, not YouTube's red lozenge,
   same ink-at-85%-with-the-canvas-punched-through as the scroller arrows,
   so it inverts with the theme and reads as part of the page until the
   moment it stops being one. */

/* Everything the player reaches for on first frame. Ordered by when it's
   needed, since browsers cap parallel preconnects. */
const PLAYER_ORIGINS = [
  "https://www.youtube-nocookie.com",
  "https://www.google.com",
  "https://googleads.g.doubleclick.net",
  "https://static.doubleclick.net",
];

export function YouTube({
  id,
  title,
  /* Seconds into the video to start at. For a conference recording where
     the talk begins nine minutes into the venue's stream, this is the
     difference between an embed that works and one that needs an apology
     underneath it. */
  start,
  /* The *source* resolution of the upload, not the size to render at. The
     component derives its whole geometry from these two numbers, which is
     why they're required rather than optional-with-a-16:9-default: a caller
     that doesn't know them is a caller about to stretch a 848×480 pitch
     across a 1036px track. */
  width,
  height,
  /* Which thumbnail to ask for, decided in the data rather than here. See the
     note in data/talks.ts: whether YouTube generated a `maxresdefault` is not
     reliably derivable from the source resolution (a 576×1024 Short has one,
     an 848×480 upload doesn't) so the only honest options are to probe it
     once offline and record the answer, or to probe it at runtime on every
     page load and eat a 404 when the guess is wrong. This takes the recorded
     answer. `onError` below still covers the case where it's stale. */
  poster: initialPoster,
  /* Set on the one embed that is above the fold. Next flags the first poster
     as the LCP element, and it is right to: the facade's whole job is to be
     the thing you see, so on the entry that renders at the top of the page it
     should be preloaded rather than lazily fetched. Left off everywhere else,
     because preloading posters for embeds nobody has scrolled to would spend
     exactly the bandwidth this component exists to save. */
  priority = false,
  className,
}: {
  id: string;
  /* Not optional. It is the iframe's accessible name and the play button's
     label. "Play" alone tells a screen-reader user nothing about which of
     three videos on the page they are on. */
  title: string;
  start?: number;
  width: number;
  height: number;
  poster: "maxresdefault" | "sddefault";
  priority?: boolean;
  className?: string;
}) {
  /* 9:16 rather than 16:9 when the source is taller than it is wide.
     Vertical is not an edge case here: a TNN segment is shot for a phone
     and lives at 1080×1920, and forcing it into a 16:9 box would render a
     frame that is four-fifths black bar.

     The poster survives the switch without special handling, and that's
     worth stating because it looks like it shouldn't: YouTube generates
     `maxresdefault` for a vertical upload as a 1280×720 landscape image
     with the video pillarboxed in the middle. Cropping that to 9:16 takes
     the centre 405px of its 720 height, precisely the pillarboxed content
     and none of the fill. object-cover does it, and one code path serves
     both orientations. */
  const portrait = height > width;

  /* How wide the frame is allowed to get. Two caps, neither a style choice:

       never upscale   A video is not a screenshot; it has a fixed pixel
                       count and no amount of poster work adds to it. The
                       Loom pitch was uploaded at 848×480, so 848px is where
                       its frame stops; stretched to the 1036px the case
                       study scrollers use it would sit visibly soft beside
                       the crisp screenshots on every work page. Better a
                       smaller sharp frame than a big blurry one.

       phone-sized     A 9:16 video rendered 1036px wide would be 1842px
                       tall, taller than the viewport, so you could not see
                       its top and bottom at once. 360px instead, making it
                       640px tall: the size of the phone it was shot on, and
                       an object that sits in a column of text rather than a
                       wall to scroll past. It also lands exactly on the
                       source at 3× DPR, so a 1080×1920 upload is
                       pixel-perfect on the phones most likely to see it. */
  const frame = portrait ? Math.min(360, width) : Math.min(1036, width);

  /* How wide the *poster file* has to be for the frame to be sharp, which
     is not the frame width, and the difference is not small.

     Every YouTube thumbnail is landscape: 16:9 for maxresdefault, 4:3 for
     sddefault. object-cover scales an image until it covers the box and
     crops the overflow, so when the box is narrower in aspect than the image
     (always, for a 9:16 frame) the binding constraint is height, and the
     image gets scaled by boxH/imgH. A 1280×720 poster in a 360×640 frame is
     scaled 3.16× and cropped to its middle ninth; asking for a 360px-wide
     file lands 360×202 of real pixels in a 360×640 hole.

     max(boxW, boxH × imgAspect) is the general form, and it collapses to
     boxW for a landscape frame, so one expression covers both orientations
     without a branch, and the landscape case is provably unchanged. */
  const [playing, setPlaying] = useState(false);

  /* Seeded from the data and only ever moved by a failure, so the common
     path makes exactly one request for exactly the right image. `sddefault`
     is the floor (every video has one) which is why there's no third state
     to fall through to. */
  const [poster, setPoster] = useState(initialPoster);

  /* Whether the player's document has finished loading, which is a different
     question from whether we mounted it. Between the two there is a second or
     so of an iframe that exists and paints nothing, and an empty iframe paints
     black. Keyed to the frame's own `load` and not to the click, because the
     click knows only that we asked; only `load` knows the player has something
     to show. Fading on a timer instead would be guessing, and guessing short
     on a slow connection puts the black frame back. */
  const [loaded, setLoaded] = useState(false);
  const warmed = useRef(false);

  /* Below the state rather than beside `frame`, because it reads the current
     poster and not the one the data proposed: if maxres 404s and we drop to
     sddefault, the aspect it has to be corrected for changes 16:9 → 4:3, and
     the request that follows should already account for that. */
  const frameHeight = frame * (height / width);
  const posterWidth = Math.round(
    Math.max(frame, frameHeight * (poster === "maxresdefault" ? 16 / 9 : 4 / 3)),
  );

  const warm = useCallback(() => {
    /* Once per component, and never during render, because these are DOM side
       effects that exist purely to be in flight before the click. */
    if (warmed.current) return;
    warmed.current = true;

    for (const href of PLAYER_ORIGINS) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      document.head.append(link);
    }
  }, []);

  const src =
    `https://www.youtube-nocookie.com/embed/${id}` +
    `?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white` +
    (start ? `&start=${start}` : "");

  return (
    /* 16:9 on the wrapper rather than height on the child, so the box is
       correct before the poster has loaded and the page never reflows when
       it arrives. `overflow-hidden` is what makes the radius bite on both
       the cropped poster and the iframe. */
    <div
      /* The source's own ratio, not the nearest of two presets. Snapping to
         16:9 or 9:16 was fine while every video was one or the other, and
         wrong the moment one wasn't: the Dell demo day is 1920×864, a 2.22:1
         ultrawide, and a 16:9 box would have letterboxed it: black bars
         baked into a frame whose entire job is to not have any.

         The poster follows for free, and it's the same trick the vertical
         case turns: YouTube's thumbnail is always 16:9 or 4:3, so an
         ultrawide gets one with bars top and bottom, and object-cover on a
         2.22:1 box crops exactly those bars off. Wider frame, narrower
         frame. The crop always removes the padding YouTube added, because
         the padding is the only thing outside the source's own ratio. */
      style={{ maxWidth: frame, aspectRatio: `${width} / ${height}` }}
      className={cn("bg-wash relative mx-auto w-full overflow-hidden rounded-lg", className)}
    >
      {/* The poster layer is never torn down, it is covered. Replacing it with
          the iframe was the obvious shape and the wrong one: the frame we swap
          in has nothing in it for the first second, so the visitor's reward for
          pressing play was the picture they were looking at turning black. Left
          mounted, it is the thing under the fade, so the still frame holds
          until the moving one is ready to take over. It costs nothing to keep:
          the image is already decoded, and once the player is up it is behind
          an opaque element at the same size and no longer paints. Disabled
          rather than unmounted so the same DOM node survives (a remount would
          re-decode and reintroduce the flash we are removing) and so it drops
          out of the tab order the moment it stops being a control. */}
      <button
        type="button"
        disabled={playing}
        onClick={() => setPlaying(true)}
        onPointerEnter={warm}
        onFocus={warm}
        aria-label={`Play video: ${title}`}
        className="group focus-visible:ring-ring/20 absolute inset-0 h-full w-full cursor-pointer focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default"
      >
        <Image
          src={`https://i.ytimg.com/vi/${id}/${poster}.jpg`}
          alt=""
          fill
          /* The poster is decoration behind a labelled button. The button
               already carries the accessible name, so an alt here would read
               the title out twice. */
          /* Both clauses carry the cover ratio, not just the fixed one:
               below the cap the frame is the viewport, so the file still has
               to be that same multiple of it, hence a vw figure that is
               allowed to exceed 100. (It is legal, and it is the only way to
               say "wider than the box it sits in" in a sizes attribute.)
               Above the cap the frame is fixed and so is the answer. */
          sizes={`(max-width: ${frame}px) ${Math.round((posterWidth / frame) * 100)}vw, ${posterWidth}px`}
          priority={priority}
          /* Cover, not contain, and it earns its keep in three different
               ways: it crops sddefault's 4:3 letterbox back to 16:9, it
               crops maxresdefault's pillarbox back to 9:16 for a vertical
               video, and it is a no-op for a landscape video that got its
               maxres. One rule, three cases, no branching. */
          className="object-cover"
          onError={() => setPoster("sddefault")}
        />

        {/* Chrome, not content: the scrim and the chip go once the press has
            landed, so what stays under the player is the bare still frame and
            not a control offering to start something already started. */}
        {!playing && (
          <>
            {/* Sits over the poster, and only on hover: a scrim that's always
                on would flatten every thumbnail on the page into the same grey.
                At rest the poster is itself; on hover it steps back so the
                control reads as the thing you're about to press. */}
            <span
              aria-hidden
              className="ease-out-quint absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10"
            />

            <span
              aria-hidden
              /* Same chip as the scroller arrows, one size up because this one
                 is the point of the element rather than an affordance at its
                 edge. The triangle is nudged 1px right of centre: an
                 equilateral optical centre sits left of its bounding box, and
                 without the nudge it reads as off-centre inside the circle.

                 Grows on hover, dips on press. The dip is the half of it that
                 matters: this control mounts a third-party player, so there is
                 a beat between the press and anything visibly happening, and
                 without a press state the first thing the click does is
                 nothing. 95% for 150ms, faster on the way down than the 200ms
                 it takes to grow, because a press should feel like it was
                 already registered and a hover should feel like it is being
                 considered.

                 Under reduced motion the hover growth is off (unbidden
                 movement, exactly what the setting asks us to stop) but the
                 press dip stays: it is not ambient motion, it is the receipt
                 for something the visitor just did, and it only exists while
                 their finger is down. That is why there is no
                 `motion-reduce:transition-none` here any more, it would have
                 left the dip snapping between two states instead. */
              className="bg-foreground/85 text-background ease-out-quint absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 group-active:scale-95 group-active:duration-150 motion-reduce:group-hover:scale-100"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="ml-px">
                <path d="M6.5 4.2a.8.8 0 0 1 1.22-.68l8.1 5.1a.8.8 0 0 1 0 1.36l-8.1 5.1A.8.8 0 0 1 6.5 14.4V4.2Z" />
              </svg>
            </span>
          </>
        )}
      </button>

      {/* Mounted only by the click, which is the whole point of the facade, and
          revealed only once it has loaded. Starting at zero and crossing to one
          over 200ms means the poster is what you see for the dead second, and
          the cut to video happens when there is video to cut to. It sits above
          the poster in source order, so once it is opaque it covers it
          completely and the still frame beneath stops being visible at all. */}
      {playing && (
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className={cn(
            "ease-out-quint absolute inset-0 h-full w-full transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
