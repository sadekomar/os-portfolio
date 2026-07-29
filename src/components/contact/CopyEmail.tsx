"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatedText } from "@/components/ui/animated-text";
import { Button } from "@/components/ui/button";
import { SuccessMark } from "@/components/ui/success-mark";
import { EMAIL } from "@/data/contact";

/* Matches DownloadResume's settle exactly, and deliberately: the two sit on
   one row, and a reader who presses both wants them to behave like one pair
   of controls rather than two components that happen to be adjacent. */
const SETTLE_MS = 2200;

type State = "idle" | "copied" | "failed";

const LABEL: Record<State, string> = {
  idle: "Copy email",
  copied: "Copied",
  failed: "Couldn’t copy",
};

/* ── Copy email ───────────────────────────────────────────────────────────
   The second thing a visitor might want to take away, next to the first.

   A `mailto:` is the obvious alternative and it is worse for most readers:
   it hands off to whatever the OS has registered, which is frequently
   nothing, or a client the reader abandoned years ago and cannot cancel out
   of gracefully. The address on the clipboard works regardless of what they
   write mail in. The `mailto:` links elsewhere on the page are kept for the
   readers for whom it is genuinely the fast path.

   ── Why there is no pending state ────────────────────────────────────────
   DownloadResume spins because it is waiting on bytes, and it holds that
   spinner for a floor of 600ms because the real work can finish inside one
   frame. Nothing here waits on anything: `writeText` resolves against a
   local buffer. A spinner would be pure theatre, and it is the same argument
   that makes the sibling's spinner mean something: the loading state appears
   when, and only when, there is something to load. So this button has two
   outcomes and no middle.

   ── The failure state is real ────────────────────────────────────────────
   Clipboard writes are refused outright on an insecure origin, and by Safari
   when the write lands outside the gesture that started it. "Copied" in that
   case is a lie the reader only discovers at the paste, which is the worst
   possible place to discover it. So the failure gets its own label and,
   pointedly, no success mark: the mark slot stays shut, so the button looks
   the way it looked before it was pressed, because nothing happened.

   It reverts rather than sticking, because the address is still reachable in
   plain text further down the page (the Elsewhere line and the footer both
   carry it) and a control stuck in an error state implies it is broken
   rather than that this one attempt was. */
export function CopyEmail() {
  const [state, setState] = useState<State>("idle");

  /* A second press before the first has settled would otherwise leave the
     earlier timer to fire against the newer state and reset it early. */
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);

    /* Called first thing in the handler, with nothing awaited before it.
       Safari ties clipboard permission to the user gesture, and a write that
       happens after an `await` has, as far as it is concerned, happened on
       its own. */
    try {
      await navigator.clipboard.writeText(EMAIL);
      setState("copied");
    } catch {
      setState("failed");
    }

    timer.current = setTimeout(() => setState("idle"), SETTLE_MS);
  }

  return (
    <Button
      variant="outline"
      onClick={copy}
      /* The label is animating, so the accessible name would otherwise be
         read off text mid-morph. Announced once it settles instead. */
      aria-live="polite"
      className="text-body-sm text-foreground-muted h-9 gap-0 rounded-full px-4 font-medium"
    >
      {/* Same 24px slot on the same curve as DownloadResume: the geometry and
          the reasoning are documented there. Only the success half exists
          here, since there is no pending state for the other half to hold. */}
      <span
        className={`grid overflow-hidden transition-[width] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          state === "copied" ? "w-6" : "w-0"
        }`}
        aria-hidden="true"
      >
        {/* Never unmounted, for the reason its sibling gives: a mark that
            mounts mid-fade starts from whatever the browser painted first,
            which turns a crossfade into a blink. */}
        <span
          className={`col-start-1 row-start-1 transition-opacity duration-200 ${
            state === "copied" ? "opacity-100" : "opacity-0"
          }`}
        >
          <SuccessMark size="control" />
        </span>
      </span>
      <AnimatedText>{LABEL[state]}</AnimatedText>
    </Button>
  );
}
