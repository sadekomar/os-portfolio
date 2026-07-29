/* ── The script ───────────────────────────────────────────────────────────
   One array. Every cue is a timestamp, the line spoken over it, and what the
   page does while it is being spoken.

   `at` is seconds into the recording, and the recording is the clock: cues
   fire off the video's own `timeupdate`, so a cue cannot drift from the
   sentence it belongs to no matter how the video buffers or how slow the
   machine is. Scrubbing backwards re-arms them.

   `say` is not a subtitle. It is the line to record, it is what rehearsal
   mode prints on screen before a recording exists, and it is the transcript
   read into the live region for anyone who has the video muted or cannot
   hear it. Keeping one string for all three is the only way the spoken tour
   and the readable tour cannot disagree.

   ── The rule for writing cues ─────────────────────────────────────────────
   The action illustrates the sentence; it never races it. A cue fires at the
   *start* of the line it belongs to and its motion should be over before the
   line is, so the reader is looking at the thing while they are being told
   about it. That means timings get adjusted to the recording, not the other
   way round. Do not tighten these to fit more in.

   Selectors are stable hooks (`#work`, `[data-tour="…"]`) rather than
   structural ones. A cue whose target has gone is dropped after 2.5s and the
   tour carries on; see driver.ts.

   ── The rule for writing lines ────────────────────────────────────────────
   These are spoken, so they are written to be said rather than read: short
   sentences, no clause stacked on a clause, and nothing a mouth trips over
   on the third take. Past that they are held to the same standard as the
   rest of the site's copy (see docs/north-stars.md): name the thing, then
   the fact that makes it worth naming. A tour is the easiest place on a
   portfolio to start selling, and a voice that starts selling is the reason
   most people close one.

   Two specific bans, both learned from the first draft. No line states the
   tour's own length: the recording decides that, and a voice promising
   thirty seconds over a forty-second video is the one error the reader is
   guaranteed to catch. And no line describes what is on screen, because the
   reader can already see it; the line says the part they could not have
   worked out by looking. */

import type { TourStage } from "@/components/tour/driver";

export type TourCue = {
  at: number;
  say: string;
  /* The return is ignored, and `unknown` rather than `void` so a one-line
     cue can be `(s) => s.point(…)` without the arrow having to swallow the
     stage's own return value in a block body. */
  run?: (s: TourStage) => unknown;
};

/* The case study the tour opens. One project, named once, because the tour
   crosses into it and back and both halves have to agree.

   Loom Cairo rather than Wholana, and the reason is a fact about the pages
   rather than about the projects. The cue below says "a strip of real screens
   you can drag", and only three case studies currently render one: Loom
   Cairo, the UN platform and Little Lads. The rest are prose while their
   artifacts are still being imported. Sending the tour into a page with no
   imagery would have the voice describing something the reader is not
   looking at, which is the one failure a guided tour cannot absorb: a missing
   cue degrades silently, a lying one does not.

   Of the three, Loom Cairo is the strongest thing to hand a first-time
   visitor: founded, 40,000 users, and four separate strips to drag. Move this
   to "/work/wholana" the day that page has screens, and change nothing
   else. */
const CASE_STUDY = "/work/loom-cairo";

export const TOUR: TourCue[] = [
  {
    at: 0,
    say: "Hey, I'm Omar. Let me show you around my own site for a minute.",
  },
  {
    at: 4.2,
    say: "It's one page of text. No hero, no logo grid. If something's here, it says something.",
    run: (s) => s.scrollTo("#experience"),
  },
  {
    at: 8.0,
    say: "Top of the page is where I am now. Instatus: status pages doing ten million visits a month, for Sketch, Harvard and Siemens.",
    run: (s) => s.point('[data-tour="row:https://instatus.com"]'),
  },
  {
    at: 12.0,
    say: "Then the work, grouped by how it came about. The job, the three I founded, and the client work.",
    run: (s) => s.scrollTo("#work"),
  },
  {
    at: 15.5,
    say: "Rest on a row and you get a look at it before you spend a click.",
    run: (s) => s.hover(`[data-tour="row:${CASE_STUDY}"]`),
  },
  {
    /* Demonstrated rather than mentioned: this presses the arrow key. The
       list is a single tab stop with a roving tabindex (see WorkRows), which
       is the kind of thing nobody discovers by being told about it. */
    at: 19.0,
    say: "Arrow keys do the same, if you'd rather not reach for the mouse.",
    run: (s) => s.key(`[data-tour="row:${CASE_STUDY}"]`, "ArrowDown", 2),
  },
  {
    at: 22.5,
    say: "Open one and you get the whole story, not a screenshot and three adjectives.",
    run: (s) => s.activate(`[data-tour="row:${CASE_STUDY}"]`),
  },
  {
    /* Two moves under one sentence, awaited in order, because they are one
       gesture: bring the strip into view, then show that it moves. Scrolling
       to it and leaving it still would be pointing at a photograph. */
    at: 25.5,
    say: "What it did, up top. Then the real screens. You can drag them.",
    run: async (s) => {
      await s.scrollTo("[data-case-bleed]", "center");
      await s.drag("[data-case-bleed] .snap-x", 700);
    },
  },
  {
    at: 30.0,
    say: "And underneath, why each decision went the way it did.",
    run: (s) => s.scrollBy(700),
  },
  {
    at: 34.0,
    say: "Back home. A year of commits, and whether one of them was today.",
    run: async (s) => {
      await s.goto("/");
      await s.scrollTo("#code");
    },
  },
  {
    at: 38.5,
    say: "What shaped the pages you're looking at, if you want the sources.",
    run: async (s) => {
      await s.scrollTo("#resources");
      await s.activate('[data-tour="resources-more"]');
    },
  },
  {
    at: 42.5,
    say: "That's the site. Email is the quickest way to reach me, and I do answer.",
    run: (s) => s.scrollTo("#elsewhere"),
  },
  {
    /* The last cue is a return rather than a fade. The bubble came out of the
       O and it goes back into it, and it cannot do that from the footer, so
       the page comes home first. A tour that ends by dumping the reader at
       the bottom of the page has taken them somewhere and left them there. */
    at: 46.5,
    say: "",
    run: (s) => s.scrollTop(),
  },
];

/* Where the tour is over. Past the last cue by enough for the closing line to
   finish and the page to settle, so the bubble does not start shrinking on
   top of the final word. With a recording present the video's own duration
   wins this; this number only governs rehearsal. */
export const TOUR_END = 49;

/* Dropped in as /public/tour/tour.mp4 (and a poster beside it). Absent, the
   whole thing still runs on a rehearsal clock with the lines on screen, which
   is how the choreography gets timed before there is anything to record
   against. See TourProvider. */
export const TOUR_VIDEO = "/tour/tour.mp4";
export const TOUR_POSTER = "/tour/poster.jpg";
