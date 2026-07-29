"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatedText } from "@/components/ui/animated-text";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SuccessMark } from "@/components/ui/success-mark";

const FILE = "/resume.pdf";
const SAVE_AS = "resume-omar-sadek.pdf";

/* How long "Downloaded" holds before the label morphs back. Long enough to
   be read, short enough that the button is idle again by the time anyone
   looks twice. */
const SETTLE_MS = 2200;

/* Once the spinner is on screen it stays for at least this long, even if the
   bytes arrived sooner.

   This is the one piece of timing here that isn't bound to real work, so it
   is worth being precise about what it does and doesn't claim. It never
   makes the button *look* busy when nothing is happening: the spinner still
   only appears because a fetch actually started. What it prevents is the
   opposite failure: a cached PDF resolves in single-digit milliseconds and
   the whole loading state renders for less than one frame, which reads as a
   flicker or a glitch rather than as feedback. Measured at 7ms locally
   before this existed.

   600ms is a little over one rotation at 500ms, so the arc completes a
   recognisable circuit rather than being caught mid-sweep and yanked away.
   The cost is bounded and small: a fast download is reported up to 600ms
   late, and a slow one is not delayed at all. */
const MIN_SPIN_MS = 600;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type State = "idle" | "downloading" | "done";

const LABEL: Record<State, string> = {
  idle: "Download résumé",
  downloading: "Downloading",
  done: "Downloaded",
};

/* ── Download résumé ──────────────────────────────────────────────────────
   The first of the two buttons on the index, and the louder one: the résumé
   is the thing a visitor is most likely to want to *take away* rather than
   read. CopyEmail sits beside it and carries the other half of that; see the
   note on the row in page.tsx.

   The pending state is real, not theatre. The PDF is fetched as a blob and
   the download is triggered from the result, so the spinner is bound to
   bytes actually arriving. On a fast connection it flashes for a frame and
   that is the honest reading of the situation. A timed fake would show the
   same spinner whether or not anything was happening, which is the thing
   that makes loading states stop meaning anything.

   Fetching also buys the completion state: a bare `<a download>` hands off
   to the browser and never reports back, so "Downloaded" would be a guess.

   The label morphs through torph rather than snapping (see AnimatedText).
   Button's own note explains why it leaves labels alone by default; a
   swapped label reflows the button's width mid-press and moves the target
   under the pointer. Morphing is what makes the width change a tween
   instead of a jump, which is the condition under which changing the text
   at all is defensible. */
export function DownloadResume() {
  const [state, setState] = useState<State>("idle");

  /* Both cleaned up on unmount: a click followed immediately by a route
     change would otherwise leave the object URL allocated and the timer
     setting state on a component that no longer exists. */
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const objectUrl = useRef<string | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  async function download() {
    if (state === "downloading") return;

    setState("downloading");
    const startedAt = performance.now();

    try {
      const response = await fetch(FILE);
      if (!response.ok) throw new Error(`${response.status}`);

      const blob = await response.blob();

      /* Held before the download is triggered rather than after, so the
         browser's own download chrome doesn't arrive while the button is
         still claiming to be working. */
      await wait(MIN_SPIN_MS - (performance.now() - startedAt));
      const url = URL.createObjectURL(blob);
      objectUrl.current = url;

      const link = document.createElement("a");
      link.href = url;
      link.download = SAVE_AS;
      link.click();

      /* Revoking synchronously races Safari, which reads the blob after the
         click returns. One frame is enough and costs nothing. */
      setTimeout(() => {
        URL.revokeObjectURL(url);
        objectUrl.current = undefined;
      }, 0);

      setState("done");
      timer.current = setTimeout(() => setState("idle"), SETTLE_MS);
    } catch {
      /* Fall back to letting the browser fetch it the ordinary way. If that
         also fails the user gets the browser's own error, which is more
         use than an error state invented here. */
      window.location.href = FILE;
      setState("idle");
    }
  }

  return (
    <Button
      variant="outline"
      onClick={download}
      /* Not Button's `loading`: that prop disables the button, and a
         disabled control drops out of the tab order mid-interaction, which
         moves focus for anyone driving this from the keyboard. The action
         guards itself on `state` instead, so the button stays focusable and
         merely busy. */
      aria-busy={state === "downloading"}
      /* The label is animating, so the accessible name would otherwise be
         read off text mid-morph. `aria-live="polite"` announces the state
         change once it settles rather than on every frame. */
      aria-live="polite"
      /* gap-0 because the spinner's slot carries its own trailing space. The
         base `gap-2` would apply to a zero-width slot too, leaving 8px of
         dead air to the left of an idle label. */
      className="text-body-sm text-foreground-muted h-9 gap-0 rounded-full px-4 font-medium"
    >
      {/* The slot opens rather than appears: 24px is the 16px mark plus the
          8px gap it needs, tweened on the same 250ms curve the rest of the
          site uses, so the label slides over instead of being shoved.
          Reserving the width permanently would balance the button while it's
          busy and unbalance it the 99% of the time it isn't.

          It stays open across `done` as well, because the check is the other
          half of the same gesture. Closing at the moment the tick arrives
          would yank it back off screen just as it lands. */}
      <span
        className={`grid overflow-hidden transition-[width] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          state === "idle" ? "w-0" : "w-6"
        }`}
        aria-hidden="true"
      >
        {/* Both marks occupy the same grid cell and cross-fade in place, so
            the ring dissolves into the disc rather than one being swapped
            for the other. Same 200ms in both directions, matching the
            reference. Neither is unmounted: a mark that mounts mid-fade
            starts its transition from whatever the browser painted first,
            which is how a crossfade turns into a blink. */}
        <span
          className={`col-start-1 row-start-1 transition-opacity duration-200 ${
            state === "downloading" ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* No colour of its own: it inherits the button's
              `foreground-muted`, which puts the arc at exactly the label's
              weight and derives the track from there. */}
          <Spinner size="control" />
        </span>
        <span
          className={`col-start-1 row-start-1 transition-opacity duration-200 ${
            state === "done" ? "opacity-100" : "opacity-0"
          }`}
        >
          <SuccessMark size="control" />
        </span>
      </span>
      <AnimatedText>{LABEL[state]}</AnimatedText>
    </Button>
  );
}
