"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LOGOMARK_SVG, LOGOTYPE_SVG, Logomark, Logotype } from "./marks";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

/* ── Brand assets menu ────────────────────────────────────────────────────
   Right-click the name in the header (press and hold on touch) and the two
   brand assets are there to take. It replaces the browser's own context menu
   on that one element and nowhere else.

   This is an easter egg and is designed as one: there is no badge, no dotted
   underline and no tooltip advertising it, because a discoverability hint on
   an affordance this marginal costs every reader something to buy attention
   from the few who would ever want the file. The people who right-click a
   wordmark are already looking for exactly this.

   Overriding a native context menu is a real cost and it is worth naming.
   The trade is bounded to the wordmark (the rest of the page keeps the
   browser's menu) and what replaces it answers the same question the reader
   was asking. "Save image as…" on a mark that isn't an image would have
   given them a screenshot of an SVG.

   No toast, and no icons in the rows. The row that was clicked says `Copied`
   in place of its own label and the menu closes on its own a beat later,
   which puts the confirmation exactly where the reader is already looking
   instead of pulling their eye to a corner of the viewport for a message
   about something they just did. It also spares the site a floating layer
   and a dependency it otherwise has no use for. */

/* Long enough that the swapped label is read rather than glimpsed, short
   enough that it never becomes a menu the reader has to dismiss. */
const CONFIRM_MS = 650;

type Asset = {
  id: string;
  label: string;
  svg: string;
  Preview: (props: { className?: string }) => React.ReactElement;
};

const ASSETS: Asset[] = [
  { id: "logomark", label: "Copy logomark as SVG", svg: LOGOMARK_SVG, Preview: Logomark },
  { id: "logotype", label: "Copy wordmark as SVG", svg: LOGOTYPE_SVG, Preview: Logotype },
];

export function BrandAssetsMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  /* `null` when nothing has been clicked; otherwise the row that was, and
     whether the write actually landed. Reporting a failure as `Copied` would
     be worse than not offering the affordance at all. */
  const [result, setResult] = useState<{ id: string; ok: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const copy = useCallback(async (asset: Asset) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(asset.svg);
      ok = true;
    } catch {
      /* Denied permission, or an insecure context. Nothing to recover; the
         row says so and the reader can fall back to the repo. */
    }

    setResult({ id: asset.id, ok });

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), CONFIRM_MS);
  }, []);

  return (
    <ContextMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        /* Cleared on the way in rather than on the way out, so the label
           doesn't flip back to its original mid-close-animation. */
        if (next) {
          if (timer.current) clearTimeout(timer.current);
          setResult(null);
        }
      }}
    >
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        {ASSETS.map((asset) => {
          const shown = result?.id === asset.id;

          return (
            <ContextMenuItem
              key={asset.id}
              /* Radix closes on select by default. Held open so the swapped
                 label has somewhere to be seen; the timer above closes it. */
              onSelect={(event) => {
                event.preventDefault();
                void copy(asset);
              }}
              className="justify-between gap-6"
            >
              {/* The label is what changes, so it is the live region: a
                  screen reader gets the confirmation from the element it
                  just activated, which is the same thing a sighted reader
                  gets.

                  The full label is also always rendered underneath it,
                  hidden, to hold the column open. `Copied` is half the width
                  of the label it replaces, and without this the menu snaps
                  57px narrower at the exact moment the reader is looking at
                  it for confirmation, since the layout jumping is louder than the
                  word it was trying to say. Stacked in one grid cell rather
                  than positioned absolutely so the row still sizes itself. */}
              <span className="grid justify-items-start">
                <span aria-hidden className="invisible col-start-1 row-start-1">{asset.label}</span>
                <span aria-live="polite" className="col-start-1 row-start-1">
                  {shown ? (result.ok ? "Copied" : "Couldn’t copy") : asset.label}
                </span>
              </span>

              {/* The asset itself, standing in for an icon: what is being
                  copied is a mark, so the mark is the clearest possible
                  label for it, and no glyph had to be invented to stand for
                  "logotype". Both are set at the same 10px cap height rather
                  than fitted to a common box. That is the point of the
                  pair, one short and one long at one letter size, and
                  height-matching them would have made the monogram tiny to
                  let the wordmark fit. Muted, because these identify their
                  row rather than compete with it. */}
              <asset.Preview className="h-2.5 text-muted-foreground" />
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}
