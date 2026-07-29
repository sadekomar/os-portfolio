"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

/* The Work list's preview panel: one persistent object that travels the list,
   not a card that is born and dies on every row.

   That distinction is the whole design. The panel has exactly one entrance
   (arriving in the list from outside it) and exactly one exit (leaving). Every
   move in between is the same element sliding to a new anchor, because that is
   what it is: the reader hasn't summoned a second panel, they've moved their
   attention one row down and the panel followed. Fading out and back in would
   assert nine panels where there is one, and each fade would cost the reader a
   beat of re-acquisition on an element that never actually went anywhere.

   Three pieces, split for one reason and it is a performance one. The anchor
   state lives inside the layer and is written imperatively through a ref, so a
   pointer sweeping nine rows re-renders one component instead of the entire
   list. `useWorkPreview`'s callbacks are stable across renders, which is what
   lets the rows take them without being re-rendered by them.

     useWorkPreview    geometry + wiring, held by the surface that owns the rows
     WorkPreviewLayer  the travelling element, the only thing that re-renders
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
   by construction (see WorkPreviewCard, where the image sits in a fixed aspect box
   precisely so that travelling between rows can never resize the panel). */
const ASSUMED_PANEL_HEIGHT = 208;

/* How far the panel leans toward the pointer within a row, in px. Small on
   purpose: enough that the panel reads as attached to the pointer rather than
   to the row's bounding box, not enough to be perceived as movement of its
   own. Anything past ~10px stops being weight and starts being a wobble. */
const FOLLOW_RANGE = 7;

/* How long a leave keeps the panel alive: long enough for the pointer to cross
   the PANEL_GAP bridge onto the panel itself, short enough that the panel
   reads as gone the moment its row is exited. */
const HIDE_GRACE_MS = 120;

/* Travel, pointer-driven. A spring rather than a duration because the pointer
   can retarget it mid-flight and a spring keeps its velocity through the
   retarget where a tween would restart from zero. The slight bounce is the
   panel having mass; it is a real object being dragged along the list. */
const POINTER_TRAVEL = { type: "spring", duration: 0.34, bounce: 0.16 } as const;

/* Travel, keyboard-driven, and deliberately half the pointer's duration with
   the bounce taken out. Keyboard navigation is repeated (someone will hold
   ArrowDown through nine rows) and animation on a repeated, keyboard-initiated
   action reads as lag, not as craft. This is the shortest slide that still
   carries the "same panel, new row" claim; any slower and the panel would be
   arriving after the selection it is supposed to be describing. */
const KEY_TRAVEL = { type: "spring", duration: 0.16, bounce: 0 } as const;

/* Entrances ease-out: they start at full speed and settle, so the panel is
   legible before it has finished arriving. Exits get a different, faster
   treatment. The reader has already left, and an exit that takes as long as
   an entrance is the interface holding the door. */
const ENTER = { duration: 0.18, ease: [0.23, 1, 0.32, 1] } as const;
const EXIT = { duration: 0.11, ease: [0.4, 0, 1, 1] } as const;

export type PreviewSource = "pointer" | "keyboard";

export type PreviewAnchor<T> = {
  item: T;
  top: number;
  left: number;
  /* Which side of the row the panel ended up on, so the entrance can scale
     out of the row rather than out of thin air. */
  side: "right" | "left";
  source: PreviewSource;
};

export type WorkPreviewHandle<T> = {
  show: (anchor: PreviewAnchor<T>) => void;
  hide: () => void;
  /* Soft dismissal: hide after HIDE_GRACE_MS unless a show, or the pointer
     landing on the panel itself, cancels it first. */
  scheduleHide: () => void;
  cancelHide: () => void;
  /* Lean toward the pointer. Takes the pointer's offset from the row's
     vertical centre in px; the layer decides how much of that to honour. */
  follow: (offsetFromRowCentre: number) => void;
  height: () => number;
};

export function useWorkPreview<T>() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<WorkPreviewHandle<T>>(null);

  const showRow = useCallback((item: T, row: HTMLElement, source: PreviewSource) => {
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

    const side: "right" | "left" = fitsRight ? "right" : "left";
    const left = fitsRight
      ? rowRect.right - wrapperRect.left + PANEL_GAP
      : rowRect.left - wrapperRect.left - PANEL_GAP - PANEL_WIDTH;

    /* Keep the bottom edge on screen. Resolved here, before the anchor is
       handed over, rather than as a post-layout correction: a clamp applied
       after the panel has already been positioned is a visible second move,
       and with the panel now animating between anchors that second move would
       be animated too. */
    const height = layer.height();
    const maxTop = Math.max(0, window.innerHeight - PANEL_GAP - height - wrapperRect.top);
    const top = Math.min(rowRect.top - wrapperRect.top, maxTop);

    layer.show({ item, top, left, side, source });
  }, []);

  const hide = useCallback(() => layerRef.current?.hide(), []);
  const scheduleHide = useCallback(() => layerRef.current?.scheduleHide(), []);
  const cancelHide = useCallback(() => layerRef.current?.cancelHide(), []);
  const follow = useCallback((offset: number) => layerRef.current?.follow(offset), []);

  return { wrapperRef, layerRef, showRow, hide, scheduleHide, cancelHide, follow };
}

export function WorkPreviewLayer<T>({
  layerRef,
  children,
}: {
  layerRef: RefObject<WorkPreviewHandle<T> | null>;
  children: (item: T) => ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [entry, setEntry] = useState<{ item: T; side: "right" | "left" } | null>(null);
  const reduced = useReducedMotion();

  /* Position is carried on motion values rather than React state so that a
     slide is a compositor-friendly transform write, not nine renders of the
     list. `visible` mirrors `entry` as a ref because `show` runs imperatively
     and can't wait for a render to learn whether this is an entrance or a
     move. */
  const visible = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const lean = useSpring(0, { stiffness: 140, damping: 22, mass: 0.5 });
  const ty = useTransform(() => y.get() + lean.get());
  const transform = useMotionTemplate`translate3d(${x}px, ${ty}px, 0)`;

  const hideTimer = useRef<number | null>(null);
  const cancelHide = useCallback(() => {
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);
  const dismiss = useCallback(() => {
    visible.current = false;
    setEntry(null);
  }, []);
  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = window.setTimeout(dismiss, HIDE_GRACE_MS);
  }, [cancelHide, dismiss]);

  useImperativeHandle(
    layerRef,
    () => ({
      show: (next: PreviewAnchor<T>) => {
        cancelHide();

        /* The one branch that matters. An entrance places the panel; a move
           animates it. Under reduced motion every show is a placement, which
           is the honest reading of the preference: the panel still appears,
           it just never travels. */
        if (!visible.current || reduced) {
          x.jump(next.left);
          y.jump(next.top);
          lean.jump(0);
        } else {
          const travel = next.source === "keyboard" ? KEY_TRAVEL : POINTER_TRAVEL;
          animate(x, next.left, travel);
          animate(y, next.top, travel);
          /* A keyboard move has no pointer to lean toward, so the lean unwinds
             rather than being left frozen at whatever the pointer last said. */
          if (next.source === "keyboard") lean.set(0);
        }

        visible.current = true;
        setEntry({ item: next.item, side: next.side });
      },
      hide: () => {
        cancelHide();
        dismiss();
      },
      scheduleHide,
      cancelHide,
      follow: (offset: number) => {
        if (reduced) return;
        const clamped = Math.max(-1, Math.min(1, offset / 40));
        lean.set(clamped * FOLLOW_RANGE);
      },
      height: () => panelRef.current?.offsetHeight || ASSUMED_PANEL_HEIGHT,
    }),
    [cancelHide, dismiss, scheduleHide, reduced, x, y, lean],
  );

  return (
    /* Two nested elements, and the nesting is load-bearing: the outer one owns
       the travel transform, the inner one owns the entrance and exit scale. On
       a single element those two would be the same `transform` property and
       the last writer would win. */
    <motion.div
      aria-hidden
      style={{ transform }}
      className="pointer-events-none absolute top-0 left-0 z-30 will-change-transform"
    >
      <AnimatePresence>
        {entry && (
          <motion.div
            key="panel"
            ref={panelRef}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={
              reduced
                ? { opacity: 0, transition: EXIT }
                : { opacity: 0, scale: 0.985, transition: EXIT }
            }
            transition={reduced ? { duration: 0 } : ENTER}
            /* Scaled out of the row it belongs to, not out of its own centre:
               the panel is a thing the row produced, and an origin on the
               far edge would have it growing away from its own source. */
            style={{ transformOrigin: entry.side === "right" ? "0% 16px" : "100% 16px" }}
            onPointerEnter={cancelHide}
            onPointerLeave={scheduleHide}
            className="pointer-events-auto"
          >
            {children(entry.item)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* The chrome. Tonal rather than shadow-lifted, with the same hairline the
   tooltip takes for the same reason: a floating element has no parent to be
   lighter than.

   Its height is fixed by construction and that is a physics decision, not a
   layout one. If the card resized as it travelled (a taller hero here, a
   two-line role there) the "one persistent object" claim would break on
   every move, and the bottom-edge clamp would have to re-run mid-slide. A
   fixed aspect box for the image and a single clamped line for the role means
   the panel that leaves row one is dimensionally the panel that arrives at
   row nine. */
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
