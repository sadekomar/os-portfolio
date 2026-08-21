"use client";

import { useSyncExternalStore } from "react";

import { useCommandPalette } from "./CommandPaletteProvider";

/* ── The affordance ───────────────────────────────────────────────────────
   One quiet thing, in the nav, sized and coloured like the site's meta text
   (11px at `foreground-subtle`, the same rung as the footer's copyright).
   Subtle rather than the `faint` it started on, because this is a label
   someone is meant to read: at 11px on the page canvas, faint lands at
   2.5:1 and the quietest rung that clears AA is subtle. A layperson will
   never press ⌘K unbidden, and the
   fix for that is to show them the chord where they are already looking, not
   to put a floating button over the page or a banner above it. It sits at
   the end of the nav list because that is where the row already ends, so it
   costs no new position on the page.

   It is a real `<button>`, not a decorative `<kbd>`: someone who reads it as
   a label and clicks it should get the thing it names. The `<kbd>` inside
   carries the semantics of "this is a key to press"; the button carries the
   behaviour.

   ── Mobile ──
   Hidden below `sm`, which is the "hide the trigger on touch" answer rather
   than the "adapt it" one, and the reason is that there is nothing left to
   adapt *to*. Strip the chord and the palette on a phone is a list of the
   same destinations the nav and footer already hold, reached through an
   extra modal and a soft keyboard that eats half the viewport, a worse
   version of the footer, plus a chunk to download. The one thing a palette
   is actually for is being faster than the mouse, and there is no mouse.

   The palette itself is still built to work at that width (full-bleed minus
   the page gutter, top-anchored so the soft keyboard can't push the input
   off screen) because the trigger is not the only way in: an iPad with a
   keyboard, or anything else with a physical `/`, opens it on a viewport
   this narrow. What's hidden is the invitation, not the door. */

/* The platform is an external, unchanging fact about the machine, not
   component state, so it is read the same way ThemeProvider reads the OS
   colour scheme: through `useSyncExternalStore` with a no-op subscribe. That
   is what gives the server snapshot (⌘, the canonical name for this control)
   and the real one on the pass straight after hydration, with no markup
   mismatch and without a setState in an effect. */
const noopSubscribe = () => () => {};
const readIsApple = () => /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
const serverIsApple = () => true;

export function CommandHint() {
  const { openPalette } = useCommandPalette();
  const isApple = useSyncExternalStore(noopSubscribe, readIsApple, serverIsApple);
  const chord = isApple ? "⌘K" : "Ctrl K";

  return (
    <button
      type="button"
      onClick={openPalette}
      /* The chord is repeated into the name rather than left out of it. The
         label has to start with what the control does, since "⌘K" alone
         tells a screen-reader user nothing, but a name that drops the
         visible text leaves voice control with nothing to say either: "click
         ⌘K" would match no control on the page. Both, in that order. */
      aria-label={`Open command palette (${chord})`}
      aria-keyshortcuts="Meta+K Control+K"
      className="text-micro text-foreground-subtle hover:text-foreground hover:bg-wash focus-visible:ring-ring/20 hidden rounded-full px-2.5 py-1.5 font-medium tabular-nums transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:outline-none sm:inline-flex"
    >
      <kbd className="font-sans">{chord}</kbd>
    </button>
  );
}
