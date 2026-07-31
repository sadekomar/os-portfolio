"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useWebHaptics } from "web-haptics/react";

import { PRODUCT, type StorefrontImage } from "@/components/case-study/storefront-product";

/* ── The Univyr storefront's product gallery ──────────────────────────────
   Lifted out of the product page, not rebuilt for this one. The file it came
   from is apps/storefront/src/components/ScrubbableCarousel.tsx in the Univyr
   monorepo, and the four photographs below are the four that product page
   really served for this item. The Embla config, the pointer maths and the
   dot strip are the shipped ones; what changed is listed at the bottom of
   this comment, and it is all framing.

   ── Why the gallery is the thing worth showing ───────────────────────────
   A fashion search engine is judged on one gesture. Someone lands on an item,
   wants the other three photographs, and either gets them in a flick or
   leaves. Every other claim this case study makes (17,000 items, sub-50ms
   queries, a labeller that fills the filters) is upstream of that moment and
   invisible during it.

   ── The scrub ────────────────────────────────────────────────────────────
   The dots aren't buttons and they aren't a status readout. They're a
   one-dimensional control: press anywhere on the strip and the gallery goes
   to the proportional image, then keep dragging and it tracks the finger
   across the whole set. Four images is a flick each; a 30-image dress
   listing is one drag.

   Two Embla settings are what make that feel like scrubbing rather than like
   a sequence of jumps, and both are deliberately extreme:

     skipSnaps: true   a scrub can cross three images at once, and a carousel
                       that insists on visiting each one would animate the
                       intervening two and arrive late.
     duration: 10      Embla's ease measured in frames, so ~160ms. Slow
                       enough that a swipe still has travel, fast enough that
                       a drag across the strip reads as the image following
                       the finger rather than chasing it.

   `setPointerCapture` on the down event is what makes the drag survive the
   finger leaving the strip. Without it a scrub that wanders 20px up into the
   photograph stops dead, which is exactly what a fast drag does.

   `isScrubbingRef` is a ref rather than state on purpose. It's read inside
   Embla's `select` handler to decide whether the index is Embla's news or
   our own, and as state it would re-run the subscribe effect on every press.

   ── The haptics, which are new here ──────────────────────────────────────
   web-haptics (haptics.lochie.me), fired once per dot the scrub crosses.

   This is the one addition that isn't framing, and it's the thing a
   scrubbable strip has always wanted: the whole control is a finger dragging
   over a row of 7px targets it is covering with its own fingertip. The
   picture updates, but the picture is the thing being covered. A tick per
   crossing puts the feedback somewhere the hand can still read it, which is
   how the native photo scrubbers this pattern comes from have always
   behaved.

   A 10ms pulse at full intensity, written out rather than taken from the
   `selection` preset, and the two are the same idea with one of them
   unplayable. A scrub across all four fires this four times in maybe 300ms,
   so anything with more body turns into a buzz and a two-part preset
   (`success`, `nudge`) would still be playing its second tap when the next
   dot arrives. That much `selection` had right. What it gets wrong is the
   rendering: intensity is not a thing `navigator.vibrate` takes, so the
   library approximates it by chopping the pulse into on and off slices, and
   `selection` (8ms at 0.3) comes out as vibrate([2, 6]). Two milliseconds is
   below the point where a phone's vibration motor has spun up at all, so the
   Android path was firing correctly and producing nothing. At intensity 1
   there is no chopping and the 10ms arrives whole.

   None of which iOS reads. There the pattern is only a count: the library
   clicks its hidden switch once per vibration in the list and the Taptic
   engine picks the tick, so one call is one tick whatever the numbers say.
   The numbers exist for the other half of the traffic.

   Fired on crossings only, never on every pointermove: `lastTickRef` holds
   the index the last tick belonged to, so a drag that travels 40px inside
   one dot's third of the strip is silent. The press itself ticks, because
   landing on a new image is a crossing like any other, and re-pressing the
   dot you're already on is not.

   Nothing here gates on `isSupported`. It reports `navigator.vibrate`, which
   iOS does not have, and iOS is most of this gallery's traffic. The library
   covers it a different way (a hidden switch element whose toggle the Taptic
   engine answers), and that path works while the flag says false, so reading
   the flag would switch haptics off precisely where they matter most.

   Reduced motion is left alone, and that is the considered position rather
   than an omission. A 8ms tick is not motion, it moves nothing on screen and
   triggers nothing vestibular. It's also the branch of the feedback that a
   reader who has turned animation down still has: the scrub itself is the
   thing they asked to be quieter.

   ── What changed for this page ───────────────────────────────────────────
     the strip is always on   Shipped, the dots were `md:hidden` with a
                              `n / total` counter for desktop, correct for a
                              store whose traffic is overwhelmingly phones.
                              A case study inverts that: most people reading
                              this are at a desk with a mouse, and a control
                              they can't reach is a control they can't judge.
                              The strip takes a mouse drag identically, so
                              it's shown at every width.
     a 340px column           Shipped, the gallery was the full width of a
                              phone. It still runs at roughly phone width
                              here, centred and with nothing drawn around it,
                              because a 4:5 photograph at this page's 1036px
                              figure width would be 1295px tall.
     the pointer maths        Rewritten against the dots' own centres rather
                              than the padded strip, which is what makes a
                              press on the first or last dot select it. See
                              `indexFromPointer`.
     static imports           `StaticImageData` rather than `string`, which
                              buys the blur placeholder and the intrinsic
                              size. The shipped version read URLs off an API. */

const IMAGES = PRODUCT.images;

/* Memoised, and it earns it: this re-renders on every dot the scrub crosses,
   and a scrub is a stream of them. Without this every crossing re-renders
   four <Image>s to produce the identical four elements. */
const Slide = memo(function Slide({ image }: { image: StorefrontImage }) {
  return (
    /* `aspect-4/5` and a `fill` image rather than the image's own intrinsic
       height, and this is load-bearing rather than stylistic.

       Embla measures every slide once, on init. A slide sized by the image
       inside it has no height until that image has laid out, and four images
       resolve at four different moments, so the measurement Embla takes is of
       a row of slides that are still different widths from each other. The
       snap list it derives is then wrong for the rest of the page's life:
       dragging to the last dot settled the track at -470px against a real
       snap of -1020, which is the second photograph and a sliver of the
       third. Nothing recovers it either, because Embla's default resize watch
       is on the viewport, and the viewport never changed.

       Declaring the ratio up front makes the slide 340x425 in the first
       frame, before a single byte of image has arrived, so the measurement is
       right the first time. It's also what the shipped component did, for the
       same reason.

       `object-cover` can't actually crop anything here: every photograph in
       the set is 4:5, which is where the ratio came from. */
    <div className="relative aspect-4/5 min-w-0 flex-[0_0_100%]">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        placeholder="blur"
        /* The gallery is one image wide at every breakpoint and the column it
           sits in is capped at 340. Next doubles this for retina, which a
           product photograph is the one thing on this page that shows. */
        sizes="340px"
        className="object-cover"
      />
    </div>
  );
});

export function StorefrontCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    skipSnaps: true,
    duration: 10,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  /* The same fact twice, on purpose, because it's read on two different
     clocks. The ref is for logic: Embla's `select` handler reads it to tell
     its own news apart from ours, and as state that handler would have to
     re-subscribe on every press. The state is only for the press styling,
     which changes exactly twice per gesture, so it costs two renders and
     keeps the pressed chip out of imperative `setAttribute` calls. */
  const isScrubbingRef = useRef(false);
  const [scrubbing, setScrubbing] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  const { trigger } = useWebHaptics();

  /* The index the last tick was fired for. Compared against, never rendered,
     so a ref rather than state: writing it during a pointermove is the hot
     path this whole component is arranged around. */
  const lastTickRef = useRef(0);

  const tick = useCallback(
    (index: number) => {
      if (index === lastTickRef.current) return;
      lastTickRef.current = index;
      /* `void`, deliberately. `trigger` resolves when the pattern finishes,
         which for a scrub is after the next two have started, and awaiting it
         would serialise ticks behind each other. Nothing here needs to know
         that a tick landed. */
      void trigger([{ duration: 10, intensity: 1 }]);
    },
    [trigger],
  );

  /* Embla settling on a new snap is the *other* way the index changes: a
     flick across the photograph itself, or a trackpad swipe. Ticking here as
     well as on the scrub is what keeps the two gestures telling the hand the
     same thing.

     The scrub is excluded because it already ticked on the crossing, some
     140ms earlier. Letting Embla's settle through would double every tick a
     drag produced, at a spacing short enough to read as one longer buzz. */
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      if (isScrubbingRef.current) return;
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);
      tick(index);
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, tick]);

  /* Pointer x → snap index, measured across the dots' own centres.
     Rounded, not floored, so each dot owns the span centred on itself and
     the halfway point between two is where the scrub flips.

     Measuring the *row of dots* rather than the pressable strip around it is
     the whole correctness argument, and getting it wrong is subtle enough to
     survive a casual test. The strip carries 12px of padding on each side,
     which exists so a fingertip landing slightly off the row still counts.
     Take the proportion across that padded 70px box and the dot centres,
     which live at 15.5, 28.5, 41.5 and 54.5, land at 0.66, 1.22, 1.78 and
     2.34 of the way through a 0-3 index. Rounded: 1, 1, 2, 2. Pressing the
     first dot selected the second, pressing the last selected the third, and
     neither end of the gallery could be reached by pressing the dot that
     stands for it. Only the middle two were ever right, which is exactly the
     shape of bug that reads as "sometimes it works".

     Against the inner row the arithmetic is exact instead of nearly right:
     the span runs centre-to-centre, so dot i sits at precisely i/(n-1), and
     each dot owns the 13px centred on itself. Pressing the padding clamps to
     whichever end it's nearer, which is also what a drag that overshoots the
     row wants. */
  const indexFromPointer = useCallback((clientX: number) => {
    const row = dotsRef.current;
    if (!row) return 0;

    const { left, width } = row.getBoundingClientRect();
    /* The row is n dots and n-1 gaps, so trimming one dot's width leaves
       exactly the centre-to-centre span, and the offset to the first centre
       is half a dot. Read off the rendered node rather than the 7px constant
       so the two can't drift apart. */
    const dot = row.firstElementChild?.getBoundingClientRect().width ?? 0;
    const span = width - dot;
    if (span <= 0) return 0;

    const progress = Math.max(0, Math.min(1, (clientX - left - dot / 2) / span));
    return Math.round(progress * (IMAGES.length - 1));
  }, []);

  const scrubTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(IMAGES.length - 1, index));
      setSelectedIndex(clamped);
      tick(clamped);
      /* `true` is Embla's jump flag: go there without animating through the
         images in between. During a scrub the finger is the animation. */
      emblaApi?.scrollTo(clamped, true);
    },
    [emblaApi, tick],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      /* `currentTarget`, not `target`. The strip's children are the dots, so
         a press that lands on one captures to a 7px span rather than to the
         control, and the drag that follows is reported against whichever dot
         happened to be under the finger at the start. Capturing on the strip
         keeps every subsequent move in one coordinate space. */
      event.currentTarget.setPointerCapture(event.pointerId);
      isScrubbingRef.current = true;
      setScrubbing(true);
      scrubTo(indexFromPointer(event.clientX));
    },
    [indexFromPointer, scrubTo],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isScrubbingRef.current) return;
      scrubTo(indexFromPointer(event.clientX));
    },
    [indexFromPointer, scrubTo],
  );

  const onPointerUp = useCallback(() => {
    isScrubbingRef.current = false;
    setScrubbing(false);
  }, []);

  /* Arrow keys drive the same strip, because a scrubber is a slider and a
     slider that only takes a pointer is half a control. Goes through
     `scrubTo`, so a held arrow key ticks per image exactly as a drag does.

     `stopPropagation` as well as `preventDefault`, and it is the important
     half. The case study binds ← and → on `window` to move between projects
     (see sequence/Pager), on the reasoning that nothing on a case study
     scrolls sideways so the horizontal pair is free. This block is the first
     thing that does, and without the stop, pressing ← inside a focused
     gallery scrubbed one image back *and* navigated to the previous case
     study. `preventDefault` alone can't help: the pager's listener is on
     `window`, so the event still reaches it.

     The rule that resolves it is the one the pager already applies to inputs
     and textareas: a focused control owns the keys it uses, and the global
     shortcut gets what's left. This just asserts it from the control's end,
     so the gallery doesn't need the pager to know it exists. The pager knows
     anyway now, since this strip is a `role="slider"` and that is on its list
     of things that own the arrows, but a control that defends its own keys
     does not depend on being on anybody's list. */
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const step =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? 1
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? -1
            : 0;

      if (step === 0) return;
      event.preventDefault();
      event.stopPropagation();
      scrubTo(selectedIndex + step);
    },
    [scrubTo, selectedIndex],
  );

  return (
    /* No container, and that is the considered version rather than the
       stripped-back one. The tonal box this used to sit in was drawing a
       frame around a thing that already has one: a product photograph on a
       plain backdrop is the most self-contained object on the page, and
       putting a gray card behind it said "component demo" where the point is
       that it's the product. The case study's own prose introduces it a line
       above, so the heading the card carried was a second title for something
       already named.

       What's left is the storefront's own arrangement, which is the argument
       the block is making: photograph, scrubber, item. */
    <div className="flex justify-center">
      <div className="flex w-full max-w-[340px] flex-col gap-3">
        {/* `overflow-hidden` is Embla's viewport, and the radius rides on it
            so the photograph's corners are the block's corners rather than a
            square picture inside a rounded box.

            `relative` is the load-bearing one, and it draws nothing. Embla
            measures with `offsetLeft`, not `getBoundingClientRect`, so every
            number it derives is relative to whatever each node's
            `offsetParent` happens to be. The track below is transformed,
            which makes *it* the slides' offsetParent, so they measure 0, 340,
            680, 1020. Left static, the track itself then measures against the
            nearest positioned ancestor instead, which on this page is the
            `relative z-10` wrapper the case study puts around every artifact:
            550px away, at this column's left edge.

            Embla subtracts one from the other, so the snap list came out
            [550, 210, -130, -470] instead of [0, -340, -680, -1020], and the
            last dot landed the track two thirds of the way through the second
            photograph. Positioning the viewport puts both measurements in the
            same coordinate space and the offset falls out to zero.

            This never bit the shipped version, and not because it was written
            more carefully. There the gallery was full-bleed on a phone with
            nothing positioned above it, so the track's offsetLeft was 0 and
            the bug cancelled itself. It's the same trap Scroller.tsx
            documents at its `case-tile`, from the other direction. */}
        <div ref={emblaRef} className="relative overflow-hidden rounded-[var(--radius-inner)]">
          <div className="flex will-change-transform">
            {IMAGES.map((image, i) => (
              <Slide key={i} image={image} />
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          {/* Two boxes, and the split is what makes a press land where it
              looks like it landed. This outer one is the target: it carries
              the padding, the press state and every handler, so a fingertip
              that misses the row by a few pixels still counts as a press on
              the row. The inner one is the ruler, and it is exactly as wide
              as the dots, which is what `indexFromPointer` measures against.

              `touch-none` is load-bearing: without it the browser claims a
              horizontal drag here for page panning, and the scrub never gets
              a second pointermove. */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Product image"
            aria-valuemin={1}
            aria-valuemax={IMAGES.length}
            aria-valuenow={selectedIndex + 1}
            aria-valuetext={IMAGES[selectedIndex].alt}
            data-scrubbing={scrubbing || undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            /* The pressed state is a tonal chip appearing under the dots, the
               same move the rest of the site makes for a hover surface. It
               exists because the finger is on top of the strip: the one pixel
               of it still visible is the edge, so the feedback has to be the
               area around the dots rather than the dots themselves. */
            className="cursor-pointer touch-none select-none rounded-full px-3 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 data-[scrubbing]:bg-foreground/10"
          >
            <div ref={dotsRef} className="flex items-center gap-1.5">
              {IMAGES.map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={`size-[7px] rounded-full transition-colors duration-150 ${
                    i === selectedIndex ? "bg-foreground/90" : "bg-foreground/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* The item, in the storefront's own words. Without it the block is
            four photographs of a belt; with it, it's the product page the
            gallery was built for, which is the claim being demonstrated. */}
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-case-caption text-foreground">{PRODUCT.name}</p>
          <p className="text-case-caption tabular-nums text-foreground-faint">{PRODUCT.price}</p>
        </div>
      </div>
    </div>
  );
}
