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
  // How long after one tooltip closes the next still counts as part of the
  // same gesture. Radix ships 300ms, which is shorter than a deliberate
  // sweep across a row of chips: past that window each trigger pays the
  // 80ms delay and opens from scale again, so dragging along the stack
  // alternates between two different motions depending on how fast the hand
  // happened to be moving. 600ms is long enough that a sweep stays one
  // gesture from end to end, and short enough that coming back to the row a
  // beat later still reads as a new question and re-pays the delay.
  skipDelayDuration = 600,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
      skipDelayDuration={skipDelayDuration}
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
          // 13.3px: the tooltip's own rung, sized in globals.css, where this
          // was reading at the body's 16 by accident. A tooltip is an aside
          // about the control the cursor is already on, so it should read as
          // a label rather than as a line of page copy that happens to
          // float. The vertical padding comes down with it, since 8px around
          // a single short line was the box having air rather than shape.
          "bg-surface-raised text-tooltip text-foreground items-center gap-1.5 rounded-md px-3 py-1.5",
          "border border-black/8 dark:border-white/10",
          // The first one is an arrival: 150ms from a 0.98 scale, on the
          // site's curve rather than Tailwind's weaker `ease-out`.
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-[0.98] ease-out-quint duration-150",
          // `instant-open` is Radix's word for "the reader is already reading
          // tooltips", which it knows because one closed moments ago. This
          // used to be `animate-none`, on the reasoning that the second
          // tooltip is the same object with new text and re-introducing it
          // reads as a flicker.
          //
          // Watching a sweep across the stack says otherwise. The label does
          // not move between chips, because Radix mounts a new element per
          // trigger: the old box vanishes and a new one appears somewhere
          // else at a different size. With no transition at all that is a
          // cut, and a cut every 200ms along a row is the jarring part.
          //
          // So: an 80ms fade, and only a fade. It is short enough to still
          // read as one label keeping up with the cursor rather than a
          // second tooltip being opened, and the scale is dropped because a
          // box zooming up at a new position while another is still fading
          // out at the old one is two objects, which is exactly the thing
          // that shouldn't be happening.
          "data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:duration-80",
          // Out in 50ms so dismissal never lags the cursor, and without the
          // scale: an exit carries less than an entrance, and during a sweep
          // this fade overlaps the next tooltip's. Two boxes cross-fading in
          // two different places is a double image; two boxes cross-fading
          // with only opacity is one label moving.
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-50",
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
