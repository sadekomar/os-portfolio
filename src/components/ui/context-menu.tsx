"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import type * as React from "react";

import { cn } from "@/lib/utils";

/* Only the four parts the site actually uses. Upstream ships checkboxes,
   radio groups, submenus and labels; none of them have a call site here, and
   a primitive file is the easiest place for unused surface to accumulate
   unnoticed. They can come back when something needs them. */

function ContextMenu({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          // The same escape hatch tooltip.tsx takes, taken for the same
          // reason and worth restating rather than cross-referencing: this
          // portals to <body> and floats over whatever happens to be
          // underneath, so it has no parent to be a tone lighter *than*. The
          // tonal system can't separate it, so a hairline does: one pixel
          // instead of the lifted-card shadow upstream uses, and it holds
          // against any background.
          //
          // `--radius-inner`, the control rung, because a menu is smaller
          // than any card that would hold one, same rung as a tooltip.
          "z-50 min-w-40 origin-(--radix-context-menu-content-transform-origin) overflow-hidden",
          "rounded-md bg-surface-raised p-1 text-foreground",
          "border border-black/8 dark:border-white/10",
          // Opens in 150ms from 0.98; closes in 50ms, so dismissing never
          // lags behind the pointer. The tooltip's motion contract, and for
          // the same reason: appearing is an event, leaving is not.
          "duration-150 ease-out data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=closed]:duration-50",
          "motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item>) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      className={cn(
        // `--radius-inner` minus 4px, since the item is inset in the menu by the
        // 4px of `p-1` above, so its radius is the container's less the
        // inset. That is the concentric rule the whole radius scale is built
        // on, applied one rung down.
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2.5 py-1.5",
        "text-body-sm outline-none",
        // Highlight is a tone step, not a tint: `surface-sunken` is the same
        // recessed step a card uses against the canvas, so a hovered row
        // reads as pressed into the menu rather than painted over it. Radix
        // drives `data-highlighted` from pointer *and* keyboard, so this one
        // rule covers both without a separate focus style.
        "transition-colors duration-100 ease-out data-[highlighted]:bg-surface-sunken",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger };
