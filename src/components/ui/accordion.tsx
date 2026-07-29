"use client";

import * as React from "react";

import { Icon } from "@/components/icon/Icon";
import { cn } from "@/lib/utils";

// Adapted from transitions.dev, "Accordion expand".
// Height animates via grid-template-rows 0fr <-> 1fr (see globals.css), so
// there is no height measuring. The chevron flips with scaleY rather than a
// CSS `d:` path morph, which is Chromium-only.

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ title, children, open, defaultOpen = false, onOpenChange, className, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
    const panelId = React.useId();

    const isOpen = open ?? uncontrolled;

    const toggle = () => {
      if (open === undefined) setUncontrolled((v) => !v);
      onOpenChange?.(!isOpen);
    };

    return (
      <div ref={ref} className={cn("t-acc", className)} data-open={isOpen} {...props}>
        <button
          type="button"
          className="t-acc-head flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-medium"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggle}
        >
          {title}
          {/* `control`, the in-a-control size. The drawing that used to be
              inlined here is now the 16-grid small master of `disclosure`
              (see icon/glyphs.ts), re-centred on the grid and re-weighted
              from 1.5 to the 1.3px the size system asks for at 16px. */}
          <span className="t-acc-chevron shrink-0" aria-hidden="true">
            <Icon name="disclosure" size="control" />
          </span>
        </button>
        {/* The collapsed panel stays in the DOM so it can animate, so it also
            needs hiding from assistive tech and taken out of the tab order. */}
        <div id={panelId} role="region" className="t-acc-panel" {...{ inert: !isOpen }}>
          <div className="t-acc-panel-inner">
            <div className="pb-4 text-sm text-muted-foreground">{children}</div>
          </div>
        </div>
      </div>
    );
  },
);
Accordion.displayName = "Accordion";

export { Accordion };
