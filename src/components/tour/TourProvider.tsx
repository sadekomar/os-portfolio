"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import dynamic from "next/dynamic";

import { TourContext, type TourValue } from "@/components/tour/context";

/* ── What ships, and what doesn't ─────────────────────────────────────────
   This is the whole of the tour that the root layout loads: one boolean, one
   ref, and a `start()` that means "fetch the rest". Everything that makes the
   tour a tour, the rAF clock, the driver, the bubble, the cue cursor, the
   2.3MB recording and `motion`, lives in TourEngine and is a separate chunk.

   The reason is that the layout mounts this on every route, so anything in
   here is on the critical path of every page on the site, and none of it was
   earning that. `motion` is ~40KB brotli by itself and the engine another ~8,
   which is roughly a fifth of the site's first-load JavaScript spent on an
   animation runtime whose only job at rest is to render a closed bubble and a
   cursor parked at -100,-100. Nothing in the engine has any server-rendered
   output, so deferring it removes nothing from the HTML and can shift nothing
   in the layout when it arrives: it is machinery, not content, which is what
   makes `ssr: false` the honest call here rather than a way of hiding markup
   from a crawler.

   ── Why the engine hands its value upwards ───────────────────────────────
   The obvious shape is for the engine to be a second, inner provider wrapping
   `children`. It is also a bug. React reconciles by position, so the frame
   where the engine appears is a frame where every child of this component
   changes parent, and changing parent means unmount and remount: the whole
   page torn down and rebuilt, client state lost, scroll and focus with it, for
   the sake of a chunk arriving. So `children` sit in exactly one place, always
   the first child of one provider that is always this one, and the engine
   mounts beside them and reports its context value back up. It renders no
   markup of its own besides the bubble and the cursor, so "beside" costs
   nothing.

   Until that value lands, `useTour()` returns the placeholder below, which is
   what keeps the two entry points, the O in the h1 and the "Play the guided
   tour" row in ⌘K, live from the first paint rather than from the moment a
   chunk finishes.

   ── Why it is warm before it is wanted ───────────────────────────────────
   Arming on the click alone would put a network round trip between pressing
   the letter and the bubble blooming out of it, and that bloom is timed
   against a voice. So the context also carries `warm()`, and the two entry
   points call it on intent rather than on commitment: a pointer entering the
   O, focus landing on it, the palette opening. By the time either of them
   turns into a real request the chunk is in the cache, and `dynamic` dedupes,
   so a warm-up overlapping a `start()` is still one fetch.

   Intent rather than a blanket idle warm-up, and the difference is bytes. An
   idle prefetch would download the animation runtime on every single page
   load whether or not anyone ever goes near the tour, which is most loads.
   Hovering the letter costs nothing to anyone who never hovers it. */
const TourEngine = dynamic(() => import("./TourEngine").then((m) => m.TourEngine), {
  ssr: false,
});

export { useTour } from "@/components/tour/context";
export type { TourStatus, TourValue } from "@/components/tour/context";

/* ── Playing itself on a first visit ──────────────────────────────────────
   Separate from `tour:invited` in TourO, and they are not interchangeable.
   That key records that a reader was *offered* the tour; this one records
   that a page tried to *play* it at them. Sharing one key would mean an
   invitation shown on some earlier build permanently suppressing the
   auto-start, or the reverse, and the two are different promises.

   Written the moment this visit is identified as the first one, not when the
   tour finishes and not even when it starts. What the key means is "this
   browser has had its one unrequested tour", and a reader who scrolls away
   during the delay below has had it: they were shown the offer and declined
   it by moving. Deferring the write until the tour actually plays would give
   that reader the same ambush on their next visit, and the one after. */
const AUTO_KEY = "tour:autoplayed";

/* Longer than TourO's 1500ms invitation, and the gap is the point. The
   invitation is a letter breathing in the corner of a heading, which a reader
   can ignore without deciding to; this takes over the page. So it waits until
   they have read the name and the sentence under it and have visibly not
   started doing anything else, which is a beat later than "they can see the
   page". Any interaction inside the window cancels it outright. */
const AUTO_START_DELAY_MS = 2600;

/* When to go and get the engine chunk. Late enough to be out of the way of the
   page's own first load, early enough that the two seconds left before the
   start timer are more than the fetch needs. A reader who moves in the gap
   cancels this too, so the bytes are only ever spent on a tour that plays. */
const AUTO_WARM_DELAY_MS = 600;

/* What counts as the reader getting there first, and it is deliberately the
   same four events TourEngine treats as taking the page back mid-tour. Not
   `scroll`: browsers fire it for their own scroll restoration on load, which
   would cancel the auto-start on every reload of a page the reader had
   previously scrolled, for a scroll they did not perform. */
const INTENT_EVENTS = ["wheel", "touchmove", "pointerdown", "keydown"] as const;

export function TourProvider({ children }: { children: ReactNode }) {
  /* "mounted" rather than "started": the engine is mounted both by a real
     request and by a warm-up, and only the first of those should play
     anything. `requested` is what carries that difference across. */
  const [mounted, setMounted] = useState(false);
  const [requested, setRequested] = useState(false);
  /* Null until the engine is running. Non-null, it replaces every field of
     the placeholder, so a consumer that grabbed `start` before the chunk
     landed is holding the real one by the time it presses again. */
  const [engine, setEngine] = useState<TourValue | null>(null);

  const anchorRef = useRef<HTMLElement>(null);

  const warm = useCallback(() => setMounted(true), []);

  const start = useCallback(() => {
    setMounted(true);
    setRequested(true);
  }, []);

  /* No-ops, and they are only ever reachable before the engine exists, which
     is to say only ever while the tour is idle. Stopping or resuming a tour
     that has not been fetched is already what "nothing happens" looks like. */
  const noop = useCallback(() => {}, []);

  /* ── The one tour nobody asked for ──────────────────────────────────────
     Empty deps, and it has to be. This provider is mounted by the root layout
     and survives every client-side navigation under it, so "first visit"
     means the load, not the route: a reader who arrives on /blog and then
     clicks Home has already started reading, and playing a video at them at
     that point is not an introduction, it is an interruption.

     Which is also why it is gated on the landing path. The script opens on
     the index and `start()` will route there from anywhere, so without this
     check a first-time visitor landing on a case study from a search result
     would be yanked back to the homepage by a page they had not touched. */
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    /* Someone who has asked their OS to stop things moving has answered this
       question already. The tour still runs for them on request, without the
       travel; see `reduced` in TourEngine. It just never starts itself. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* The opposite default to TourO's read of the same storage, on purpose.
       There, a throw costs the reader a small label they will never see
       again, so it fails open. Here a throw would mean no key can ever be
       written, and failing open would auto-play the tour on every single page
       load for the rest of that reader's session. So Safari's private mode
       gets no auto-start, and still gets the O. */
    let consumed = true;
    try {
      consumed = window.localStorage.getItem(AUTO_KEY) === "1";
    } catch {
      consumed = true;
    }
    if (consumed) return;

    try {
      window.localStorage.setItem(AUTO_KEY, "1");
    } catch {}

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
      release();
    };
    const release = () => {
      for (const type of INTENT_EVENTS) window.removeEventListener(type, cancel);
    };

    for (const type of INTENT_EVENTS) {
      window.addEventListener(type, cancel, { passive: true, once: true });
    }

    /* Fetch early, play later, and on its own timer rather than immediately.
       The engine chunk, `motion` and the recording are a round trip that would
       otherwise sit between the start delay expiring and the bubble blooming,
       and unlike a press there is no reader waiting on this who would read
       that pause as their own click landing. Not on this tick either, because
       that is the tick the page is still fetching its own fonts and images on,
       and a 1.7MB video is not what should win that race. */
    const warmTimer = window.setTimeout(() => {
      if (!cancelled) setMounted(true);
    }, AUTO_WARM_DELAY_MS);

    const startTimer = window.setTimeout(() => {
      release();
      if (!cancelled) setRequested(true);
    }, AUTO_START_DELAY_MS);

    return () => {
      window.clearTimeout(warmTimer);
      window.clearTimeout(startTimer);
      release();
    };
  }, []);

  const placeholder = useMemo<TourValue>(
    () => ({ status: "idle", start, stop: noop, resume: noop, warm, anchorRef }),
    [start, noop, warm],
  );

  return (
    <TourContext.Provider value={engine ?? placeholder}>
      {children}
      {mounted && (
        <TourEngine anchorRef={anchorRef} autoStart={requested} onValue={setEngine} />
      )}
    </TourContext.Provider>
  );
}
