"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";

import { cn } from "@/lib/utils";

function TooltipProvider({
  // The 80ms open delay is the tooltip's motion contract: it belongs to
  // appearing only, so leaving the trigger dismisses without any wait.
  delayDuration = 80,
  // Off by default. Hoverable content is for tooltips you might want to
  // reach into, and none here hold anything reachable: they are a line of
  // text with no link and no selection to make. Leaving it on is not free.
  // Radix keeps it by tracking pointermove on the document and testing the
  // cursor against a convex hull built from the trigger and content rects
  // (getHull / isPointInPolygon in the primitive), and it will not close the
  // tooltip while the cursor is inside that grace region. On a grid where
  // the next trigger is two pixels away, the cursor is *always* inside the
  // previous tooltip's grace region, so every move pays polygon math and
  // then declines to dismiss. That is the sticky, one-behind feel.
  disableHoverableContent = true,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  // 8px of air between trigger and tooltip. Upstream this gap exists so a
  // shadow-lifted card reads as floating; here there is no shadow to sell,
  // so the gap is doing the separating on its own, which makes it the
  // load-bearing part of the effect rather than a garnish on it. It is one
  // `--surface-gutter`, the same step that separates any inset from its
  // container, so a tooltip sits off its trigger by the same distance a card
  // sits off the edge of the surface holding it.
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // This is the escape hatch globals.css documents, taken deliberately
          // and named at the call site so it reads as an exception in the diff.
          //
          // The tonal system separates surfaces by lightness, which works
          // because nesting makes the parent tone knowable. A tooltip breaks
          // that premise: it portals to <body> and floats over whatever
          // happens to be underneath. `raised` on the canvas is a 1.6% step
          // (faint but legible); `raised` over an already-white card is a 0%
          // step, i.e. an invisible tooltip. There is no tone that solves both,
          // because the problem isn't which tone; it's that a floating element
          // has no parent to be lighter *than*.
          //
          // So the edge is drawn, once, here. A hairline rather than upstream's
          // shadow: it costs one pixel instead of a lifted-card metaphor the
          // rest of the site doesn't use, and it holds against any background.
          // Radius is `--radius-inner`, the control rung, because a tooltip is
          // smaller than any card that would hold one.
          "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin)",
          "items-center gap-1.5 rounded-md bg-surface-raised px-3 py-2 text-meta text-foreground",
          "border border-black/8 dark:border-white/10",
          // Appears in 150ms from a 0.98 scale; leaves in 50ms so dismissing
          // never lags behind the cursor.
          "duration-150 ease-out data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-[0.98]",
          // `instant-open` is Radix's word for "the reader is already reading
          // tooltips", which it knows because one closed moments ago. The
          // 150ms fade is an introduction, and there is nothing left to
          // introduce: the second tooltip is the same object with new text.
          // Animating it again reads as a flicker on the way to the answer,
          // and on a 365-cell grid the reader crosses it constantly. So the
          // transition is skipped and the tooltip simply is where the cursor
          // is, which is what makes a dense grid feel like scrubbing one
          // label rather than opening hundreds.
          "data-[state=instant-open]:animate-none",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=closed]:duration-50",
          "motion-reduce:animate-none",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
