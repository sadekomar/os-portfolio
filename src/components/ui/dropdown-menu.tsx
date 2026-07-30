"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type * as React from "react";

import { cn } from "@/lib/utils";

/* The one place in the system that gets a shadow.

   Everything else separates surfaces with a step along the lightness scale,
   which works because every one of those surfaces is nested inside the one
   above it. A menu is not: it floats over arbitrary content, including
   content it is the same colour as, so tone alone cannot say which of the
   two is in front. It gets a hairline ring and a soft shadow, and it is
   worth naming that as the deliberate exception rather than letting it look
   like the rule was forgotten here. */

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "bg-surface-raised text-body-sm z-50 min-w-52 origin-(--radix-dropdown-menu-content-transform-origin) rounded-xl p-1.5",
          "ring-foreground/8 shadow-foreground/8 ring-1 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "text-foreground/80 relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none select-none",
        /* Highlight follows the keyboard as well as the pointer, which is
           what `highlighted` means in Radix and why it is used here rather
           than a hover class. */
        "data-highlighted:bg-surface-sunken data-highlighted:text-foreground",
        "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("bg-foreground/8 -mx-1.5 my-1.5 h-px", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
