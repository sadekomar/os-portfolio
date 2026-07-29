"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/* A panel that floats beside whatever row the pointer is on. Three pieces,
   deliberately separate:

     useRowPreview   geometry + wiring, held by the surface that owns the rows
     RowPreviewLayer the floating element, and the only thing that re-renders
     RowPreviewShell the chrome

   The split exists for one reason, and it is a performance one. When the hover
   state lived in the consuming surface, every row the pointer crossed
   re-rendered the entire list just to move one card, and on a long index that is
   a main-thread long task per row during a fast sweep. Here the state lives
   inside RowPreviewLayer and is reached imperatively through a ref, so a hover
   updates exactly one component. `onRowEnter` and `clear` are stable across
   renders, so rows can take them as props without being re-rendered by them. */

/* Panel geometry: the w-72 card plus the gap separating it from its row. Kept
   as numbers rather than read from the DOM because the flip decision below has
   to happen before the panel exists to measure. */
const PANEL_WIDTH = 288;
const PANEL_GAP = 12;

/* How long a leave keeps the panel alive: long enough for the pointer to cross
   the PANEL_GAP bridge onto the panel itself, short enough that the panel
   reads as gone the moment its row is exited. Below ~100ms the crossing starts
   to fail on a slow drag; much above ~150ms and the panel feels like it is
   lagging behind the pointer rather than following it. */
const HIDE_GRACE_MS = 120;

export type RowPreviewAnchor<T> = { item: T; top: number; left: number };

/* The layer's imperative surface. `useRowPreview`'s stable callbacks write
   through this ref, which is what keeps a hover from touching the consumer. */
export type RowPreviewHandle<T> = {
  show: (anchor: RowPreviewAnchor<T>) => void;
  hide: () => void;
  /* Soft dismissal: hide after HIDE_GRACE_MS unless a show (another row) or
     the pointer entering the panel itself cancels it first. */
  scheduleHide: () => void;
};

export function useRowPreview<T>() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<RowPreviewHandle<T>>(null);

  const onRowEnter = useCallback((item: T, row: HTMLElement) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();

    /* Right of the row by default; flip to its left edge when the panel would
       otherwise run off the viewport. Measured against `window.innerWidth`
       rather than the wrapper because the wrapper is often narrower than the
       page and the constraint that matters is the screen. */
    let left = rowRect.right - wrapperRect.left + PANEL_GAP;
    if (rowRect.right + PANEL_GAP + PANEL_WIDTH > window.innerWidth - PANEL_GAP) {
      left = rowRect.left - wrapperRect.left - PANEL_GAP - PANEL_WIDTH;
    }

    layerRef.current?.show({
      item,
      top: rowRect.top - wrapperRect.top,
      left,
    });
  }, []);

  const clear = useCallback(() => layerRef.current?.hide(), []);

  /* Soft dismissal for a hover region. Leaving the region should drop the
     panel rather than leave it stranded until the pointer exits the whole
     wrapper, but only after the grace window, so travel across the gap onto
     the panel survives. Attach to each region's onPointerLeave and keep
     `clear` on the wrapper as the hard dismissal. */
  const onRegionLeave = useCallback(() => layerRef.current?.scheduleHide(), []);

  return { wrapperRef, layerRef, onRowEnter, clear, onRegionLeave };
}

/* The floating panel: absolutely positioned inside the wrapper, owning the
   anchor state. Renders nothing until a row shows it. No position tween: the
   panel snaps to the hovered row, so fast sweeps read as instant rather than
   as a card chasing the pointer. */
export function RowPreviewLayer<T>({
  layerRef,
  children,
}: {
  layerRef: RefObject<RowPreviewHandle<T> | null>;
  children: (item: T) => ReactNode;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<RowPreviewAnchor<T> | null>(null);

  const hideTimer = useRef<number | null>(null);
  const cancelHide = useCallback(() => {
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);
  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => setAnchor(null), HIDE_GRACE_MS);
  }, [cancelHide]);
  useEffect(() => cancelHide, [cancelHide]);

  useImperativeHandle(
    layerRef,
    () => ({
      show: (next: RowPreviewAnchor<T>) => {
        cancelHide();
        setAnchor(next);
      },
      hide: () => {
        cancelHide();
        setAnchor(null);
      },
      scheduleHide,
    }),
    [cancelHide, scheduleHide],
  );

  /* Keep the panel's bottom edge on screen: pull `top` up if the panel would
     overflow the viewport. Returning the *unchanged* anchor object when no
     pull is needed is what stops this looping. A new object every pass would
     retrigger the layout effect forever. */
  const clamp = useCallback(() => {
    const el = previewRef.current;
    const wrapper = el?.offsetParent;
    if (!el || !wrapper) return;
    const maxTop = Math.max(
      0,
      window.innerHeight - PANEL_GAP - el.offsetHeight - wrapper.getBoundingClientRect().top,
    );
    setAnchor((cur) => (cur && cur.top > maxTop ? { ...cur, top: maxTop } : cur));
  }, []);

  useLayoutEffect(clamp, [anchor, clamp]);

  /* Re-clamp when the panel's own height changes under the pointer, e.g. an image
     finishing decode is enough to push the bottom edge off screen. */
  const hasAnchor = anchor != null;
  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el || !hasAnchor) return;
    const observer = new ResizeObserver(clamp);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnchor, clamp]);

  if (!anchor) return null;

  return (
    <div
      ref={previewRef}
      style={{ top: anchor.top, left: anchor.left }}
      /* The panel sits above the rows, so while the pointer rests on it no row
         underneath fires a re-anchor. The empty PANEL_GAP is the only bridge,
         and the grace window covers the crossing: entering cancels the timer,
         leaving re-arms it. */
      onPointerEnter={cancelHide}
      onPointerLeave={scheduleHide}
      className="pointer-events-auto absolute z-30"
    >
      {children(anchor.item)}
    </div>
  );
}

/* The chrome. Upstream this was a shadow-lifted popover; here it is the tonal
   equivalent: `surface-raised` on the inset radius, with the same hairline
   the tooltip takes for the same reason (a floating element has no parent to
   be lighter than, see ui/tooltip.tsx). The entry animation is the tooltip's,
   so a panel and a tooltip appearing off the same row arrive on one clock. */
export function RowPreviewShell({
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
        "duration-150 ease-out animate-in fade-in-0 zoom-in-[0.98] motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
