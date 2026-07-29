import Image from "next/image";

import { MARKS, type Mark, type MarkName } from "./marks";

import { cn } from "@/lib/utils";

/* ── Logo ─────────────────────────────────────────────────────────────────
   The one graphic on the index, and the only concession the page makes to
   imagery. It earns the exception the way alasdairmonk.com's do: a mark at
   the head of a list row is a scanning aid (the eye finds Instatus by
   colour before it finds it by reading) where a thumbnail would only be
   decoration. See docs/north-stars.md.

   20px, which is the same box `nav`-size icons occupy. Marks are drawn on
   their own grids at their own optical weights, so unlike the icon set
   there is nothing to counter-scale here; the size is a fixed slot and each
   mark is fitted into it with object-contain. Wide marks (Wholana's W,
   UNITAR's emblem) end up shorter than 20px as a result, which is correct:
   fitting every mark to the same *height* would make the wide ones dominate
   the column. */
const SIZE = 20;

export function Logo({ name, className }: { name: MarkName; className?: string }) {
  /* Widened to Mark on the way out of the registry: `satisfies` keeps the
     key literals for MarkName but also keeps each entry's exact shape, and
     the ones without a `field` don't have the property to read. */
  const mark: Mark = MARKS[name];

  return (
    <Image
      src={mark.src}
      alt={mark.name}
      width={SIZE}
      height={SIZE}
      className={cn(
        "h-5 w-5 shrink-0 select-none",
        /* `object-cover` on a field mark rather than contain: its artwork
           is the tile, so any letterboxing would show as a seam between
           the square and its own radius. It also needs nothing from the
           dark-mode rule below: a mark that carries its own opaque
           background already has one. */
        mark.field
          ? "rounded-[5px] object-cover"
          : /* ── The dark-mode tile ──────────────────────────────────────
               Every mark here is somebody else's artwork in somebody else's
               ink, and all of it is dark: Wholana's #7f055f, Argonaut's
               maroon and navy, Instatus and Dell at #616161. On a 7% canvas
               they don't dim, they disappear. The registry note above
               explains that white backgrounds were keyed *out* of these
               files so a mark would never flash a white square on hover,
               which was the right call for a page that is always near-white,
               and is exactly what leaves nothing behind them here.

               So the tile comes back, in dark only, as a property of the
               slot rather than of the file. It is the honest interim: the
               real answer is a second set of artwork drawn for a dark
               ground (see docs/north-stars.md, "genuine light/dark asset
               pairs, not a CSS filter"), and this is deliberately not a
               filter. `invert` would turn Wholana's magenta lime green and
               Dell's blue orange, which is worse than a chip and also a
               licensing problem.

               The 2px of padding is load-bearing, not breathing room. Marks
               are trimmed to their own artwork, so at zero padding the ink
               would run into the tile's rounded corners and read as a
               cropped logo. It costs 4px of mark: 20px bare in light, 16px
               on a 20px tile in dark. The tile reads heavier than the bare
               glyph does, so the two land at about the same optical weight
               in the column, which is the thing that has to match, rather
               than the measurement. */
            "object-contain dark:bg-surface-mark dark:rounded-[5px] dark:p-0.5",
        className,
      )}
      /* Nine of these sit above the fold on a page whose whole argument is
         that it is just *there* when you arrive. They are a few kB each and
         must not queue behind anything. */
      priority
      draggable={false}
    />
  );
}

/* The slot the mark sits in, which exists whether or not there is a mark to
   put in it. A row without one (Little Lads, until its logo lands) keeps
   its title on the same left edge as every other row. An empty 20px is far
   quieter than a column that zigzags.

   Height is the body line box, not the mark: centring inside the line means
   the mark tracks the text's optical middle at any type size, instead of
   being nudged down by a magic-number margin that only holds at 17px. */
export function LogoSlot({ name }: { name?: MarkName }) {
  return (
    <span className="flex h-[1.7em] w-5 shrink-0 items-center" aria-hidden={!name}>
      {name && <Logo name={name} />}
    </span>
  );
}
