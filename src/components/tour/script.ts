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

   ── One cue per line of the recording ─────────────────────────────────────
   The recording now exists, and these cues are its transcript: one cue per
   caption in the WebVTT, `at` set to that caption's start, `say` set to the
   words actually spoken. Not one cue per action, which is what this was while
   it was still choreography: several cues carry no `run` at all and exist so
   the caption changes when the sentence does. The caption is read by anyone
   watching with the sound off, and a chip holding two sentences while only
   the first is being said is a subtitle that has drifted.

   The consequence, and it is the useful one: retiming after a re-record is
   mechanical. Line up the array against the new WebVTT, copy the starts
   across, and nothing has to be re-derived. If a line is dropped from a take,
   its cue's `run` has to be rehomed onto a cue that survived before the cue
   itself goes, which is exactly what happened to the two beats named below.

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

/* The component the tour opens on /components, and it is chosen on one
   criterion: it runs itself. The tour has about four seconds to spend on that
   page, and a component that needs to be poked (the colour pills, the
   signature pad) would spend all four being poked. Decode Flow is a
   self-driving pipeline animation, so the cue can land, say the sentence, and
   the reader watches the thing work without the cursor having to earn it.

   The row is opened by pressing it rather than by routing straight there,
   which costs nothing and means the reader sees where the page came from. */
const COMPONENT = "decode-flow";

/* Which talk the tour lands on, by id rather than by position, so reordering
   data/talks.ts moves nothing here.

   The investor pitch, and specifically because the tour has just come out of
   the Loom Cairo case study: it is the same project from the other side, which
   turns two separate stops into one thought. An id also means this survives a
   talk being added above it, which a "first entry" selector would not. */
const TALK = "loom-cairo-auc-venture-lab";

/* ── What this take does not have ─────────────────────────────────────────
   The keyboard line. The Work list is a single tab stop with a roving
   tabindex, which is the one behaviour here nobody discovers by being told
   about it, and demonstrating it silently under the hover line would have the
   page making two arguments while the voice makes one. So the arrow presses
   are out until a take narrates them, and `key` in driver.ts is unused rather
   than deleted: it is four lines, and the line to restore it is one.

   The contributions graph and Resources are still out, for the same reason
   they went in the previous take: nothing says them. `#code`, `#resources`
   and the `data-tour="resources-more"` hook stay put, because the ids are
   worth having on their own and the hook is one attribute. */
export const TOUR: TourCue[] = [
  {
    at: 0,
    say: "Hey, I'm Omar. Let me show you around.",
  },
  {
    at: 2.3,
    say: "Top of the page is where I currently work, Instatus.",
    run: async (s) => {
      await s.scrollTo("#experience");
      await s.point('[data-tour="row:https://instatus.com"]');
    },
  },
  {
    at: 5.5,
    say: "Status pages serving ten million visits a month, built by me, tech lead, two hundred high-end animations.",
  },
  {
    at: 11.0,
    say: "Then the rest of the work, grouped: the job, the venture I founded, and the side project.",
    run: (s) => s.scrollTo("#work"),
  },
  {
    at: 15.8,
    say: "Rest on a row, and you get a look at it before you spend a click.",
    run: (s) => s.hover(`[data-tour="row:${CASE_STUDY}"]`),
  },
  {
    at: 19.2,
    say: "Open one for the full case study:",
    run: (s) => s.activate(`[data-tour="row:${CASE_STUDY}"]`),
  },
  {
    /* Two moves under one clause, awaited in order, because they are one
       gesture: bring the strip into view, then show that it moves. Scrolling
       to it and leaving it still would be pointing at a photograph. */
    at: 20.8,
    say: "what it did, the real screens, and the thinking behind them.",
    run: async (s) => {
      await s.scrollTo("[data-case-bleed]", "center");
      await s.drag("[data-case-bleed] .snap-x", 700);
    },
  },
  {
    /* Silent, and the only cue in the array that is not the start of a
       caption. The line above is a list of three and the page has to keep up
       with all three of them: the screens are dealt with by the drag, and
       this is "the thinking behind them", which lands about here in the read.
       An empty `say` leaves the caption where it is, so the chip still holds
       the sentence being spoken while the page moves under it. */
    at: 22.8,
    say: "",
    run: (s) => s.scrollBy(700),
  },
  {
    at: 24.2,
    say: "Here is a roster of the components I'm proudest of,",
    run: async (s) => {
      await s.goto("/components");
      await s.point(`[data-tour="component:${COMPONENT}"]`);
    },
  },
  {
    /* The press lands on the second clause rather than the first, which buys
       the component three and a half seconds on screen instead of the second
       and a half it would get if the page waited for the next caption. */
    at: 27.2,
    say: "lifted out of the products they shipped in, running here as real files.",
    run: async (s) => {
      await s.activate(`[data-tour="component:${COMPONENT}"]`);
      await s.scrollTo('[data-tour="component-preview"]', "center");
    },
  },
  {
    /* Landing only. The talk is deliberately not played: the tour is already
       speaking, and starting a second video would put two voices in the room
       at once, one of which the reader cannot pause without stopping the
       other. The poster and the frame are the whole point here anyway, which
       is that the recordings exist. */
    at: 30.8,
    say: "Talks, where you can watch my pitches and sessions over the years.",
    run: async (s) => {
      await s.goto("/talks");
      await s.scrollTo(`#${TALK}`, "center");
    },
  },
  {
    /* About and the blog are named rather than visited, and that is the whole
       decision. Two more route changes at the end of a tour is the point where
       a guided tour stops being a tour and becomes a slideshow, and the
       Elsewhere section already links both of them in one sentence, so the
       line can point at the thing instead of travelling to it. */
    at: 34.8,
    say: "Finally, there is an about page and a blog with some of my writing.",
    run: async (s) => {
      await s.goto("/");
      await s.scrollTo("#elsewhere");
    },
  },
  {
    at: 38.2,
    say: "And email is the quickest way to reach me. Thank you.",
  },
  {
    /* The last cue is a return rather than a fade. The bubble came out of the
       O and it goes back into it, and it cannot do that from the footer, so
       the page comes home first. A tour that ends by dumping the reader at
       the bottom of the page has taken them somewhere and left them there.

       1.7s before the recording ends, and it is not a caption start either:
       the provider stops the tour the frame `currentTime` passes the video's
       duration, so this has to be early enough for a full-page smooth scroll
       to land before the bubble starts shrinking, and late enough not to pull
       the Elsewhere links off screen while the line about email is still
       being said. `scrollSettled` caps a scroll at 1400ms, which set the
       number; measured at 1.0s to reach the top from the footer. */
    at: 39.3,
    say: "",
    run: (s) => s.scrollTop(),
  },
];

/* Where the tour is over, and now only a stand-in for it: the recording is
   41s and the provider reads its duration off the video, so this governs
   rehearsal and the handful of frames before `loadedmetadata` lands. Kept in
   step with the file anyway, because the one thing worse than an unused
   number is one that used to be right. */
export const TOUR_END = 41;

/* The recording. 540x540, which is a centre crop of a 1080x1920 phone take:
   the bubble is a circle, so anything outside the middle square was never
   going to be seen, and shipping 30MB of portrait video to display 128px of
   it is bandwidth spent on pixels behind a mask. The crop is offset to the
   face rather than to the frame's centre, so it moves between takes; see the
   ffmpeg line in the tour's notes.

   Absent, the whole thing still runs on a rehearsal clock with the lines
   printed on screen, which is how the choreography was timed before there was
   anything to record against. That path is worth keeping working: it is also
   what happens on a broken deploy. See TourProvider. */
export const TOUR_VIDEO = "/tour/tour.mp4";

/* There is deliberately no poster, and the export for one has gone with it.
   A `poster` on the <video> would be fetched on every page load by everyone,
   including the majority who never take the tour, which is the exact cost
   `preload="none"` in TourBubble exists to avoid; and it would only ever be
   seen for the moment between the bloom and the first decoded frame, because
   the tour does not start its clock until `play()` has resolved. The bubble
   holds its own gray until the video is actually running, which is a load
   state rather than a still of a face that then jumps. */
