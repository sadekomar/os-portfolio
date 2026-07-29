"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { usePathname, useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";

import { TourBubble } from "@/components/tour/TourBubble";
import { TourCursor, type CursorHandle } from "@/components/tour/TourCursor";
import {
  clearStageMarks,
  createStage,
  isSynthetic,
  type TourStage,
} from "@/components/tour/driver";
import { TOUR, TOUR_END, TOUR_VIDEO } from "@/components/tour/script";

/* ── The tour engine ──────────────────────────────────────────────────────
   Mounted once in the root layout, beside the command palette and for the
   same reason: the tour outlives the route. It walks from the index into a
   case study and back, and a per-page mount would tear the video out of the
   DOM mid-sentence and restart it.

   ── The clock ─────────────────────────────────────────────────────────────
   One rAF loop, two possible sources of truth for `t`:

     with a recording   t is `video.currentTime`. The video is the clock, so
                        a cue cannot drift from the sentence it belongs to.
                        Buffering, a slow machine, the reader scrubbing: the
                        page follows the voice, always.

     without one        t is wall-clock since start, and the spoken lines are
                        printed on screen instead. This is not a fallback for
                        production, it is the mode the choreography is built
                        in: run it, watch the page move, adjust the timings in
                        script.ts, and only then record a voice over a tour
                        that already works. Dropping the file into
                        /public/tour switches modes with no other change.

   `timeupdate` would be the obvious listener and it is the wrong one: it
   fires about four times a second, so cues would land up to 250ms off the
   word they illustrate. rAF reading `currentTime` costs nothing and is exact.

   ── Yielding ──────────────────────────────────────────────────────────────
   The tour stops the instant the reader does anything. Not "pauses politely
   after the current step": stops, mid-cue, and parks. An onboarding that has
   to be fought is worse than no onboarding, and the whole premise here is
   that the site is quiet.

   What counts as the reader taking over is wheel, touchmove, keydown and
   pointerdown, and that list is exactly the set of events the tour itself
   never produces. It drives the page with `scrollIntoView`, synthetic
   pointermove and `router.push`, none of which emit any of the four. So the
   test needs no flag to distinguish "the tour scrolled" from "the reader
   scrolled", and there is no window in which a programmatic scroll can
   cancel the tour that caused it. A plain `scroll` listener would have that
   bug and would be undebuggable. */

type TourStatus = "idle" | "playing" | "yielded";

type TourValue = {
  status: TourStatus;
  start: () => void;
  stop: () => void;
  resume: () => void;
  /* The O in the h1 registers itself here so the bubble knows where to bloom
     from and where to go home to. Null anywhere that heading is not rendered,
     which the bubble reads as "fade in place". */
  anchorRef: RefObject<HTMLElement | null>;
};

const TourContext = createContext<TourValue | null>(null);

export function useTour() {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour must be used inside <TourProvider>");
  return value;
}

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;

  const [status, setStatus] = useState<TourStatus>("idle");
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  /* Whether a recording actually loaded. Starts optimistic and flips on the
     video's own error, which is the only reliable signal that /public/tour is
     still empty. Rehearsal mode is what the false branch means. */
  const [hasVideo, setHasVideo] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<CursorHandle>(null);
  const anchorRef = useRef<HTMLElement>(null);

  const stage = useRef<TourStage | null>(null);
  const abort = useRef<AbortController | null>(null);
  const frame = useRef<number | null>(null);
  const cue = useRef(0);
  /* Rehearsal clock: seconds banked before the current run, plus when the
     current run began. Pausing banks, resuming restarts the offset. */
  const clock = useRef({ base: 0, since: 0 });

  /* The recording's own length is the truth when there is one: the tour is
     over when the sentence is, not when a number in script.ts says so.
     TOUR_END only governs rehearsal, and is the fallback for the window
     before `loadedmetadata` has landed. */
  const duration = useCallback((useVideo: boolean) => {
    const video = videoRef.current;
    if (useVideo && video && Number.isFinite(video.duration) && video.duration > 0) {
      return video.duration;
    }
    return TOUR_END;
  }, []);

  /* Everything that has to be undone, in one place, because there are three
     ways out (finished, skipped, taken over) and three copies of this is
     three chances to leave a row lit up after the tour has gone. */
  const teardown = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    abort.current?.abort();
    abort.current = null;
    stage.current?.release();
    stage.current = null;
    clearStageMarks();
    cursorRef.current?.hide();
    videoRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    teardown();
    cue.current = 0;
    clock.current = { base: 0, since: 0 };
    const video = videoRef.current;
    if (video) video.currentTime = 0;
    setCaption("");
    setProgress(0);
    setStatus("idle");
  }, [teardown]);

  const run = useCallback(() => {
    const controller = new AbortController();
    abort.current = controller;
    stage.current = createStage({
      cursor: () => cursorRef.current,
      push: (href) => router.push(href),
      reduced,
      signal: controller.signal,
    });

    const tick = (useVideo: boolean) => {
      if (controller.signal.aborted) return;

      const t =
        useVideo && videoRef.current
          ? videoRef.current.currentTime
          : clock.current.base + (performance.now() - clock.current.since) / 1000;

      /* A scrub backwards re-arms every cue it passed, so the tour can be
         replayed from anywhere rather than going inert once it has run. */
      while (cue.current > 0 && TOUR[cue.current - 1].at > t + 0.05) cue.current--;

      while (cue.current < TOUR.length && TOUR[cue.current].at <= t) {
        const next = TOUR[cue.current++];
        if (next.say) setCaption(next.say);
        /* Fired, not awaited. A cue owns its own motion and the timeline
           owns the beat; awaiting one here would let a slow route fetch
           delay every sentence after it, which is precisely the drift the
           video clock exists to prevent. */
        void Promise.resolve(next.run?.(stage.current!)).catch(() => {});
      }

      /* Read every frame rather than captured once at the top: with
         `preload="none"` the video's duration is NaN until playback has
         actually begun, so a value taken before the first frame would be the
         rehearsal fallback for the whole run. */
      const total = duration(useVideo);
      setProgress(Math.min(1, t / total));

      if (t >= total) {
        stop();
        return;
      }
      frame.current = requestAnimationFrame(() => tick(useVideo));
    };

    const begin = (useVideo: boolean) => {
      if (controller.signal.aborted) return;
      clock.current.since = performance.now();
      frame.current = requestAnimationFrame(() => tick(useVideo));
    };

    /* ── Which clock, decided once, and only once it is known ──────────────
       This is the one thing in here that cannot be read off state. `hasVideo`
       starts optimistic, and the first version of this captured it when the
       run began: with /public/tour still empty, every frame then read
       `currentTime` off a video that had failed to load, got 0, and the tour
       sat on its first sentence forever while the flag flipped to false in a
       closure nobody was looking at.

       So the decision waits for the medium to answer. `play()` resolving is
       the only proof there is a recording and it is running; a rejection or
       an `error` event is the only proof there is not. Whichever arrives
       first picks the clock, and the tour starts on the same beat as the
       voice rather than a moment before it. */
    const video = videoRef.current;
    if (!video) {
      begin(false);
      return;
    }

    let decided = false;
    const decide = (useVideo: boolean) => {
      if (decided) return;
      decided = true;
      video.removeEventListener("error", onError);
      if (!useVideo) setHasVideo(false);
      begin(useVideo);
    };
    const onError = () => decide(false);

    video.addEventListener("error", onError);
    /* Rejects on a missing or unplayable source, and on a browser refusing
       audio, which will not happen here: the tour only ever starts from a
       click, so the gesture that permits sound is the same one that asked
       for the tour. */
    video.play().then(() => decide(true), () => decide(false));
  }, [duration, reduced, router, stop]);

  const start = useCallback(() => {
    const begin = () => {
      cue.current = 0;
      clock.current = { base: 0, since: performance.now() };
      setCaption("");
      setProgress(0);
      setStatus("playing");
      /* The cursor is shown before the first cue rather than by it, roughly
         where the reader's attention already is, so its first move is a
         travel from somewhere to somewhere and not an appearance on top of
         the thing it is about to point at. */
      cursorRef.current?.show(window.innerWidth * 0.5, window.innerHeight * 0.42);
      run();
    };

    /* The script opens on the index, and it is reachable from anywhere: the
       palette offers it on every page. Starting where it can actually begin
       is this function's problem, not the caller's, and not the script's,
       which would otherwise need a "get home first" cue that does nothing
       eleven times out of twelve. */
    if (pathname !== "/") {
      router.push("/");
      window.setTimeout(begin, reduced ? 120 : 420);
      return;
    }
    begin();
  }, [pathname, reduced, router, run]);

  const resume = useCallback(() => {
    setStatus("playing");
    run();
  }, [run]);

  /* Taking over. The tour keeps its place: the bubble parks with a Resume on
     it rather than dismissing, because a reader who scrolled away from a
     sentence has not necessarily decided they are done with the tour. */
  const yieldToReader = useCallback(() => {
    const video = videoRef.current;
    clock.current.base = video && hasVideo
      ? video.currentTime
      : clock.current.base + (performance.now() - clock.current.since) / 1000;
    teardown();
    setStatus("yielded");
  }, [hasVideo, teardown]);

  useEffect(() => {
    if (status !== "playing") return;

    const onIntent = (event: Event) => {
      /* The tour's own synthetic events, and the bubble's own controls, are
         not the reader taking the page back. */
      if (isSynthetic(event)) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("[data-tour-ui]")) return;
      yieldToReader();
    };
    const onKey = (event: KeyboardEvent) => {
      if (isSynthetic(event)) return;
      if (event.key === "Escape") {
        stop();
        return;
      }
      /* Modifier-only presses are someone reaching for a shortcut, not
         someone navigating. Tab and the arrows are, and they yield. */
      if (["Shift", "Meta", "Control", "Alt"].includes(event.key)) return;
      yieldToReader();
    };

    window.addEventListener("wheel", onIntent, { passive: true });
    window.addEventListener("touchmove", onIntent, { passive: true });
    window.addEventListener("pointerdown", onIntent);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchmove", onIntent);
      window.removeEventListener("pointerdown", onIntent);
      window.removeEventListener("keydown", onKey);
    };
  }, [status, stop, yieldToReader]);

  /* A tab switch mid-tour would otherwise have the voice carry on talking to
     an empty room and the page arriving somewhere the reader never watched it
     go. Yielding is the right answer rather than pausing silently: coming
     back to a parked bubble with Resume on it says what happened. */
  useEffect(() => {
    if (status !== "playing") return;
    const onHidden = () => {
      if (document.hidden) yieldToReader();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [status, yieldToReader]);

  useEffect(() => teardown, [teardown]);

  const value = useMemo<TourValue>(
    () => ({ status, start, stop, resume, anchorRef }),
    [status, start, stop, resume],
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourBubble
        status={status}
        caption={caption}
        progress={progress}
        hasVideo={hasVideo}
        videoRef={videoRef}
        anchorRef={anchorRef}
        reduced={reduced}
        src={TOUR_VIDEO}
        onVideoError={() => setHasVideo(false)}
        onSkip={stop}
        onResume={resume}
      />
      <TourCursor handleRef={cursorRef} reduced={reduced} />
    </TourContext.Provider>
  );
}
