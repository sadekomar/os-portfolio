"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/* The Work list's preview panel: one persistent object that moves down the
   list, not a card that is born and dies on every row.

   That distinction is the whole design. The panel has exactly one entrance
   (arriving in the list from outside it) and exactly one exit (leaving). Every
   move in between is the same element re-aimed at a new anchor, because that
   is what it is: the reader hasn't summoned a second panel, they've moved
   their attention one row down and the panel followed. Fading out and back in
   would assert nine panels where there is one, and each fade would cost the
   reader a beat of re-acquisition on an element that never actually went
   anywhere.

   ── Nothing here animates ──

   The panel used to spring between anchors, and the argument for it was object
   permanence: watch it travel and you know it is the same panel. It doesn't
   need the tween to make that case. The panel never unmounts, so permanence is
   already a fact of the DOM; the slide was only ever a restatement of it, and
   it was a restatement the reader paid for.

   The bill comes due on a sweep, which is the common gesture rather than the
   rare one. The panel is re-aimed on every row the pointer crosses, so a tween
   means it is permanently chasing a row the reader has already left: content
   for row six, parked between four and five, arriving at six about when the
   pointer reaches eight. That is not weight, it is lag, and a spring retargeted
   mid-flight adds a wobble on top of it. Position is now what it should have
   been from the start, a cheap style write that lands in the same commit as the
   content it belongs to. This matches the filter builder's flyout rail in the
   Wholana app, which arrived at the same answer for the same reason.

   Three pieces, split for one reason and it is a performance one. The anchor
   state lives inside the layer, so a pointer sweeping nine rows re-renders one
   component instead of the entire list. `useWorkPreview`'s callbacks are stable
   across renders, which is what lets the rows take them without being
   re-rendered by them.

     useWorkPreview    geometry + wiring, held by the surface that owns the rows
     WorkPreviewLayer  the moving element, the only thing that re-renders
     WorkPreviewCard   the chrome */

/* Panel geometry. Numbers rather than measurements because the flip decision
   below has to be made before the panel exists to measure. */
const PANEL_WIDTH = 288;
const PANEL_GAP = 12;

/* The tightest the panel is allowed to sit against the viewport edge, and
   deliberately 4px less than the gap it keeps from its row. The row gap is a
   reading decision: the panel has to read as beside the row, not welded to
   it. This one is a survival threshold, and it is set here because a 1280px
   laptop misses a 12px margin by exactly 4px on both sides: holding the
   larger number there would trade the entire preview, on the single most
   common desktop width there is, for four pixels nobody can see. */
const EDGE_MARGIN = 8;

/* Used for the bottom-edge clamp on the very first show, when there is no
   mounted panel to measure. Only has to be close: the card's height is fixed
   by construction (see WorkPreviewCard, where the image sits in a fixed aspect
   box precisely so that moving between rows can never resize the panel). */
const ASSUMED_PANEL_HEIGHT = 208;

/* How long a leave keeps the panel alive: long enough for the pointer to cross
   the PANEL_GAP bridge onto the panel itself, short enough that the panel
   reads as gone the moment its row is exited. */
const HIDE_GRACE_MS = 120;

export type PreviewAnchor<T> = {
  item: T;
  top: number;
  left: number;
};

export type WorkPreviewHandle<T> = {
  show: (anchor: PreviewAnchor<T>) => void;
  hide: () => void;
  /* Soft dismissal: hide after HIDE_GRACE_MS unless a show, or the pointer
     landing on the panel itself, cancels it first. */
  scheduleHide: () => void;
  cancelHide: () => void;
  height: () => number;
};

export function useWorkPreview<T>() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<WorkPreviewHandle<T>>(null);

  const showRow = useCallback((item: T, row: HTMLElement) => {
    const wrapper = wrapperRef.current;
    const layer = layerRef.current;
    if (!wrapper || !layer) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();

    /* Right of the row by default; flipped to its left edge when the panel
       would otherwise run off screen. Measured against `window.innerWidth`
       rather than the wrapper because the wrapper is usually narrower than the
       page and the constraint that matters is the viewport. */
    const fitsRight = rowRect.right + PANEL_GAP + PANEL_WIDTH <= window.innerWidth - EDGE_MARGIN;
    const fitsLeft = rowRect.left - PANEL_GAP - PANEL_WIDTH >= EDGE_MARGIN;

    /* Neither side has room: a narrow desktop window, or a phone held by
       someone with a mouse attached. Nothing is shown rather than a panel
       hanging half off the edge: the preview is an aid, and an aid that has
       to be scrolled to see is worse than the row it was decorating. */
    if (!fitsRight && !fitsLeft) {
      layer.hide();
      return;
    }

    const left = fitsRight
      ? rowRect.right - wrapperRect.left + PANEL_GAP
      : rowRect.left - wrapperRect.left - PANEL_GAP - PANEL_WIDTH;

    /* Keep the bottom edge on screen. Resolved here, before the anchor is
       handed over, rather than as a post-layout correction: a clamp applied
       after the panel has already been positioned is a visible second move,
       and with nothing animating there is no tween left to hide it. The panel
       has to land already in place. */
    const height = layer.height();
    const maxTop = Math.max(0, window.innerHeight - PANEL_GAP - height - wrapperRect.top);
    const top = Math.min(rowRect.top - wrapperRect.top, maxTop);

    layer.show({ item, top, left });
  }, []);

  const hide = useCallback(() => layerRef.current?.hide(), []);
  const scheduleHide = useCallback(() => layerRef.current?.scheduleHide(), []);
  const cancelHide = useCallback(() => layerRef.current?.cancelHide(), []);

  return { wrapperRef, layerRef, showRow, hide, scheduleHide, cancelHide };
}

export function WorkPreviewLayer<T>({
  layerRef,
  children,
}: {
  layerRef: RefObject<WorkPreviewHandle<T> | null>;
  children: (item: T) => ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Item and position in one piece of state, which is the point of doing this
     in React rather than on motion values: they land in the same commit. Held
     apart, the panel would paint one frame of the new row's content at the old
     row's coordinates, and with no tween covering the gap that frame is the
     whole effect. */
  const [entry, setEntry] = useState<{ item: T; top: number; left: number } | null>(null);

  const hideTimer = useRef<number | null>(null);
  const cancelHide = useCallback(() => {
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);
  const dismiss = useCallback(() => setEntry(null), []);
  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(dismiss, HIDE_GRACE_MS);
  }, [cancelHide, dismiss]);

  useImperativeHandle(
    layerRef,
    () => ({
      show: (next: PreviewAnchor<T>) => {
        cancelHide();
        setEntry({ item: next.item, top: next.top, left: next.left });
      },
      hide: () => {
        cancelHide();
        dismiss();
      },
      scheduleHide,
      cancelHide,
      /* Measured off the mounted panel while it is still showing the previous
         row, which is sound only because the card's height is fixed by
         construction. See WorkPreviewCard. */
      height: () => panelRef.current?.offsetHeight || ASSUMED_PANEL_HEIGHT,
    }),
    [cancelHide, dismiss, scheduleHide],
  );

  if (!entry) return null;

  return (
    /* `left`/`top` rather than a transform: there is no animation left for the
       compositor to run, and a plain offset write is the cheaper and more
       obvious of the two once that is true. */
    <div
      aria-hidden
      ref={panelRef}
      style={{ left: entry.left, top: entry.top }}
      onPointerEnter={cancelHide}
      onPointerLeave={scheduleHide}
      className="absolute z-30"
    >
      {children(entry.item)}
    </div>
  );
}

/* The chrome. Tonal rather than shadow-lifted, with the same hairline the
   tooltip takes for the same reason: a floating element has no parent to be
   lighter than.

   Its height is fixed by construction, and that matters more now that nothing
   animates, not less. If the card resized per row (a taller hero here, a
   two-line role there) the "one persistent object" claim would break on every
   move, and the bottom-edge clamp would be measuring the outgoing panel to
   place the incoming one. A fixed aspect box for the image and a single
   clamped line for the role means the panel that leaves row one is
   dimensionally the panel that arrives at row nine. */
export function WorkPreviewCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-72 rounded-lg bg-surface-raised p-2 text-foreground",
        "border border-black/8 dark:border-white/10",
        className,
      )}
    >
      {children}
    </div>
  );
}
