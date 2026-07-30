"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// Adapted from transitions.dev, "Tabs sliding".
// The pill's transform and width are written inline so the CSS transition in
// globals.css tweens between the previous and next measured positions.

export interface SlidingTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  tabs: string[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
}

const SlidingTabs = React.forwardRef<HTMLDivElement, SlidingTabsProps>(
  ({ tabs, value, defaultValue = 0, onChange, className, ...props }, ref) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const pillRef = React.useRef<HTMLSpanElement>(null);
    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);

    const active = value ?? uncontrolled;

    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

    // `animate: false` snaps the pill into place without a transition, used on
    // first paint, on resize, and after webfonts swap, so the pill never
    // visibly slides in from the wrong position.
    const moveTo = React.useCallback((idx: number, animate: boolean) => {
      const tab = tabRefs.current[idx];
      const pill = pillRef.current;
      if (!tab || !pill) return;

      const left = tab.offsetLeft;
      const width = tab.offsetWidth;

      if (animate) {
        pill.style.transform = `translateX(${left}px)`;
        pill.style.width = `${width}px`;
        return;
      }

      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${left}px)`;
      pill.style.width = `${width}px`;
      void pill.offsetWidth; // force reflow so the suspended transition can't replay
      pill.style.transition = prev;
    }, []);

    // Snap on first paint, animate on every subsequent change. Driving the
    // move from here (rather than from onClick) keeps the controlled and
    // uncontrolled paths on one code path.
    const mounted = React.useRef(false);
    React.useEffect(() => {
      moveTo(active, mounted.current);
      mounted.current = true;
    }, [active, moveTo]);

    React.useEffect(() => {
      const root = rootRef.current;
      if (!root) return;

      const resnap = () => moveTo(active, false);
      const observer = new ResizeObserver(resnap);
      observer.observe(root);
      // next/font swaps after first paint, which changes tab widths.
      document.fonts?.ready.then(resnap);

      return () => observer.disconnect();
    }, [active, moveTo]);

    return (
      <div ref={rootRef} className={cn("t-tabs", className)} role="tablist" {...props}>
        <span ref={pillRef} className="t-tabs-pill" aria-hidden="true" />
        {tabs.map((label, i) => (
          <button
            key={label}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            /* `text-meta`, not `text-sm`: 14px is not a rung on this site's
               scale (it runs 13 → 15) and Tailwind's own sizes carry no
               tracking, so a tab row set in it was the one control on the
               page whose type was neither sized nor tracked by the system.
               13px is what every other control label here is set in: the
               back link, the file names, the footer. */
            className="t-tab text-meta font-medium"
            role="tab"
            aria-selected={i === active}
            onClick={() => {
              if (value === undefined) setUncontrolled(i);
              onChange?.(i);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    );
  },
);
SlidingTabs.displayName = "SlidingTabs";

export { SlidingTabs };
