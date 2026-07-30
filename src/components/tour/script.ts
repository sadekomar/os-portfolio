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

/* ── Two beats the take dropped ───────────────────────────────────────────
   The recording goes straight from the case study to the components page, so
   the two lines that used to sit between them are gone: the contributions
   graph ("a year of commits, and whether one of them was today") and the
   Resources list ("what shaped the pages you're looking at"). They are not
   commented out below, because a cue that is not in the recording is not a
   cue; it is a note about a different tour.

   What had to move rather than go: the graph's cue was also the trip home
   from the case study, and without it the tour would have been standing on
   /work/loom-cairo when the components cue fired. Nothing needed adding,
   as it turns out. `goto` is a route change from wherever it is called, so
   the components cue goes there directly and the tour does not pass through
   the index at all until the closing line brings it home.

   `#code`, `#resources` and the `data-tour="resources-more"` hook in
   Resources.tsx are all left in place. The ids are worth having regardless
   (they are what makes a link to one section of the index possible), and the
   hook costs one attribute against the chance of a retake putting the beat
   back. */
export const TOUR: TourCue[] = [
  {
    at: 0,
    say: "Hey, I'm Omar. Let me show you around my own site for a minute.",
  },
  {
    at: 3.5,
    say: "It's one page of text. No hero, no logo grid.",
    run: (s) => s.scrollTo("#experience"),
  },
  {
    at: 6.5,
    say: "If something is here, it says something.",
  },
  {
    at: 9.0,
    say: "Top of the page is where I am now.",
    run: (s) => s.point('[data-tour="row:https://instatus.com"]'),
  },
  {
    at: 11.5,
    say: "Instatus. Status pages doing ten million visits a month.",
  },
  {
    at: 14.0,
    say: "For Sketch, Harvard, and Siemens.",
  },
  {
    at: 16.5,
    say: "Then the work, grouped by how it came about.",
    run: (s) => s.scrollTo("#work"),
  },
  {
    at: 18.5,
    say: "One job, three I founded, and the client work.",
  },
  {
    at: 22.0,
    say: "Rest on a row and you get a look at it before you spend a click.",
    run: (s) => s.hover(`[data-tour="row:${CASE_STUDY}"]`),
  },
  {
    /* Demonstrated rather than mentioned: this presses the arrow key. The
       list is a single tab stop with a roving tabindex (see WorkRows), which
       is the kind of thing nobody discovers by being told about it.

       Two seconds for two presses, which the 520ms beat between them in
       driver.ts fits with room to spare. The spoken line lost its second half
       in the take ("if you'd rather not reach for the mouse"), so what is left
       is short enough that the demonstration has to carry it. */
    at: 25.5,
    say: "Arrow keys do the same.",
    run: (s) => s.key(`[data-tour="row:${CASE_STUDY}"]`, "ArrowDown", 2),
  },
  {
    at: 27.5,
    say: "Open one and you get the whole story.",
    run: (s) => s.activate(`[data-tour="row:${CASE_STUDY}"]`),
  },
  {
    /* Two moves under one sentence, awaited in order, because they are one
       gesture: bring the strip into view, then show that it moves. Scrolling
       to it and leaving it still would be pointing at a photograph. */
    at: 30.0,
    say: "What it did up top, then the real screens. You can drag them.",
    run: async (s) => {
      await s.scrollTo("[data-case-bleed]", "center");
      await s.drag("[data-case-bleed] .snap-x", 700);
    },
  },
  {
    at: 34.0,
    say: "And underneath, why each decision went the way it did.",
    run: (s) => s.scrollBy(700),
  },
  {
    /* The second cross-route trip, and the reason it is worth one: everything
       up to here has been the site talking about work, and this is the work
       itself, running. A list of nine case studies is a claim; a component
       lifted out of one of them and still working on a page it was never
       built for is the evidence. */
    at: 37.5,
    say: "There's a components page too.",
    run: async (s) => {
      await s.goto("/components");
      await s.point(`[data-tour="component:${COMPONENT}"]`);
    },
  },
  {
    /* The press lands here rather than on the line after it, and the recording
       is what decided that. This sentence describes the component ("pulled out
       of the products they shipped in") while the one at 43.5 describes what it
       is not, so opening it here puts the running thing on screen for both of
       them: six seconds of Decode Flow rather than the two and a half that
       waiting for the next line would have left. */
    at: 40.0,
    say: "Real interface pieces pulled out of the products they shipped in.",
    run: async (s) => {
      await s.activate(`[data-tour="component:${COMPONENT}"]`);
      await s.scrollTo('[data-tour="component-preview"]', "center");
    },
  },
  {
    at: 43.5,
    say: "Not demos built to look right.",
  },
  {
    /* Landing only. The talk is deliberately not played: the tour is already
       speaking, and starting a second video would put two voices in the room
       at once, one of which the reader cannot pause without stopping the
       other. The poster and the frame are the whole point here anyway, which
       is that the recordings exist. */
    at: 46.0,
    say: "Talks, if you want to hear me think out loud.",
    run: async (s) => {
      await s.goto("/talks");
      await s.scrollTo(`#${TALK}`, "center");
    },
  },
  {
    at: 48.5,
    say: "That's the pitch for the project you just looked at.",
  },
  {
    /* About and the blog are named rather than visited, and that is the whole
       decision. Two more route changes at the end of a tour is the point where
       a guided tour stops being a tour and becomes a slideshow, and the
       Elsewhere section already links both of them in one sentence, so the
       line can point at the thing instead of travelling to it. */
    at: 51.5,
    say: "There's an About page and some writing.",
    run: async (s) => {
      await s.goto("/");
      await s.scrollTo("#elsewhere");
    },
  },
  {
    at: 53.5,
    say: "Email is the quickest way to reach me. I do answer.",
  },
  {
    /* The last cue is a return rather than a fade. The bubble came out of the
       O and it goes back into it, and it cannot do that from the footer, so
       the page comes home first. A tour that ends by dumping the reader at
       the bottom of the page has taken them somewhere and left them there.

       1.7s before the recording ends, and it is the one `at` in this array
       that is not a caption start: the provider stops the tour the frame
       `currentTime` passes the video's duration, so this has to be early
       enough for a full-page smooth scroll to land before the bubble starts
       shrinking, and late enough not to pull the Elsewhere links off screen
       while the line about email is still being said. `scrollSettled` caps a
       scroll at 1400ms, which is what set the number. */
    at: 54.8,
    say: "",
    run: (s) => s.scrollTop(),
  },
];

/* Where the tour is over, and now only a stand-in for it: the recording is
   56.5s and the provider reads its duration off the video, so this governs
   rehearsal and the handful of frames before `loadedmetadata` lands. Kept in
   step with the file anyway, because the one thing worse than an unused
   number is one that used to be right. */
export const TOUR_END = 56.5;

/* The recording. 540x540, which is a centre crop of a 1080x1920 phone take:
   the bubble is a circle, so anything outside the middle square was never
   going to be seen, and shipping 41MB of portrait video to display 128px of
   it is bandwidth spent on pixels behind a mask.

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
