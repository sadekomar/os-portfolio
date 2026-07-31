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
  /* When the reader should see this, which is the moment the word is said.
     Copied from the WebVTT, never estimated. */
  at: number;
  say: string;
  /* The return is ignored, and `unknown` rather than `void` so a one-line
     cue can be `(s) => s.point(…)` without the arrow having to swallow the
     stage's own return value in a block body. */
  run?: (s: TourStage) => unknown;
  /* ── Lead ────────────────────────────────────────────────────────────────
     How long before `at` to *start* this cue's action, in seconds, because
     every verb on the stage takes time to land and none of them are
     instant. A cursor travels for 180-620ms, a smooth scroll settles in
     400-600, a press animates for 300 before the route even changes. Fired
     on the word, all of that happens *after* it, and the tour spends the
     whole recording arriving a beat late. That is the single thing that made
     this feel like a page reacting to a voice rather than a voice describing
     a page.

     So `at` is when the reader should see the thing, and `lead` is what it
     costs to get there. The numbers are measured, not guessed, and the
     measurements are in the table above the array below.

     It applies only to `run`. The caption still changes exactly on `at`,
     because a subtitle that anticipates the voice is a worse error than an
     action that follows it: see TOUR_CAPTIONS and TOUR_ACTIONS below, which
     is where the two schedules part company. */
  lead?: number;
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

/* The three rows the middle of the second line names, one per group, in the
   order the voice says them: "the job, ventures I've founded, and client
   work". By slug rather than by position, so reordering `workGroups` in
   app/page.tsx moves nothing here.

   Wholana for the founded beat rather than Loom Cairo, and only because Loom
   Cairo is where the tour is about to go: resting on it here and then resting
   on it again four seconds later for the preview line would spend two
   different sentences on one row. */
const GROUP_ROWS = {
  job: "/work/instatus",
  founded: "/work/wholana",
  client: "/work/argonaut",
};

/* ── Cues below the caption ───────────────────────────────────────────────
   Most captions in this take carry more than one clause, and the page follows
   the clauses rather than the caption. So the array has a second kind of
   entry: silent cues, `say: ""`, timed to a phrase inside a line that is
   already on screen. An empty `say` leaves the chip holding the sentence still
   being spoken while the page moves under it.

   Every `at` in here, silent cues included, is a phrase start copied from a
   phrase-level WebVTT of the recording. An earlier pass had them estimated,
   by reading each line at speaking pace and splitting the caption's span by
   where the clause seemed to land, and it was wrong in the way estimates are:
   not randomly, but drifting further behind as the recording went on, because
   every line read slightly slower than it scanned. The lesson is cheap to
   restate: if a beat needs to move, re-cut the transcript rather than nudge
   the number.

   ── What a verb costs ────────────────────────────────────────────────────
   Measured on a production build, 1280x720, against the shipped recording.
   These are what the `lead` on each cue is drawn from, and they are the
   reason there is a `lead` at all:

     goto                      0.02s   the route swap itself, then a 260ms
                                       wait that nothing downstream needs
     hotkey                    0.13s   dispatch, then the pager's own push
     scrollBy                  0.11s   to the first frame of movement
     scrollTo                  0.24s   a smooth scroll of a section, settled
     hover / point, in view    0.27s   one cursor travel, clamped 180-620ms
                              -0.42s   depending on how far it has to come
     activate                  0.35s   300ms press animation, then the route
     hover needing a scroll    0.55s   the scroll and the travel, in series
     scrollTo the footer       1.22s   the full height of the index

   Two of those are worth reading twice. A `goto` is essentially free, so a
   cue that routes and then does something else should be led by the something
   else, not by the pair. And `hover` varies by a factor of two on travel
   distance alone, which is why the leads on the three group rows are not all
   the same number.

   Two consequences worth knowing before moving any of these. A lead does not
   shorten the beat before it: `hover` holds the previous row's highlight
   until the cursor has arrived, so an early fire overlaps the travel, not the
   state. And vertical and horizontal scrolls do not contend, which is why the
   flick and the scroll under it are allowed to overlap at all.

   ── What this take does have, and what it still does not ─────────────────
   The keyboard line is demonstrated on the case studies' own J/K pager, which
   is what the voice is describing at that point in the recording, and getting
   there took a change in Pager.tsx: it used to refuse every key while the
   tour was running. See the note on `isSynthetic` there. The Work list's
   roving tabindex is still the site's least discoverable good idea and still
   has `key` in driver.ts pointed at it, but no line in this take narrates it,
   and the rule further up this file is that the page does not make an
   argument the voice is not making.

   The contributions graph and Resources are out, for the same reason they
   went in the previous take: nothing says them. `#code`, `#resources` and the
   `data-tour="resources-more"` hook stay put, because the ids are worth
   having on their own and the hook is one attribute. */
export const TOUR: TourCue[] = [
  {
    at: 0,
    say: "Hey, I'm Omar. Let me show you around.",
  },
  {
    /* "Full-stack software engineer" (2.5) into "currently at Instatus" (3.5),
       which is one gesture: the Experience row for Instatus, whose own
       description is the first of those two phrases word for word.

       The longest lead in the array, and the only one that is two verbs in
       series: the page has to scroll to Experience and then the cursor has to
       cross to the row. Firing at 1.88 means both are spending "Let me show
       you around" getting into position, which is the one line in the
       recording that is explicitly about the page being about to move.

       Measured at 0.62 end to end: 0.24 of scroll, then 0.35 of travel. */
    at: 2.5,
    lead: 0.62,
    say: "Full-stack software engineer currently at Instatus, shipping features that serve 10M+ visits for customers like Sketch, Harvard, and Siemens.",
    run: async (s) => {
      await s.scrollTo("#experience");
      await s.hover('[data-tour="row:https://instatus.com"]');
    },
  },
  {
    /* "that serve 10M+ visits". The figure is not in the Experience row, it is
       in the Work row's description a section further down, which is the only
       place on the index those words exist. So the page goes to the words
       rather than the words being duplicated up to the page: `trace` finds
       them in the sentence and underlines them. */
    at: 6.0,
    lead: 0.4,
    say: "",
    run: (s) => s.trace(`[data-tour="row:${GROUP_ROWS.job}"]`, "10M+ visits"),
  },
  {
    /* "Sketch, Harvard, and Siemens." The same sentence, eight words further
       along, so this is a sweep rather than a journey and the lead is shorter
       than it looks: the cursor is already on the line.

       It has to be finished before the scroll on the next cue starts pulling
       the sentence upward, which is what sets the 0.35 rather than the 0.4 on
       the trace above. Measured, the sweep lands at 8.55 and the scroll starts
       at 8.6. */
    at: 8.2,
    lead: 0.35,
    say: "",
    run: (s) => s.trace(`[data-tour="row:${GROUP_ROWS.job}"]`, "Sketch, Harvard, Siemens"),
  },
  {
    at: 9.0,
    lead: 0.4,
    say: "Then the rest of my work group: the job, ventures I've founded, and client work.",
    run: (s) => s.scrollTo("#work"),
  },
  {
    /* One row per named group, on the beat of the name, a second apart. Three
       hovers rather than three points, because the preview panel opening on
       each is what makes them read as one list being walked rather than as the
       cursor wandering.

       The first two are already on screen after the scroll above, so they cost
       a cursor travel and nothing else. */
    at: 10.5,
    lead: 0.45,
    say: "",
    run: (s) => s.hover(`[data-tour="row:${GROUP_ROWS.job}"]`),
  },
  {
    at: 11.5,
    lead: 0.45,
    say: "",
    run: (s) => s.hover(`[data-tour="row:${GROUP_ROWS.founded}"]`),
  },
  {
    /* Client work is three Founded rows below the fold, so this one pays for a
       scroll as well as a travel and fires while the previous phrase is still
       being said. That is not a beat lost: `hover` releases the old row only
       once the cursor has arrived, so Wholana stays lit through its own clause
       and the page is simply already moving when this one starts.

       Measured at 0.58: 0.3 of scroll, then 0.24 of travel. */
    at: 12.5,
    lead: 0.6,
    say: "",
    run: (s) => s.hover(`[data-tour="row:${GROUP_ROWS.client}"]`),
  },
  {
    /* "Rest on a row" (13.5), and the row is Loom Cairo. The preview panel
       that opens under it is what the next two phrases, "and you get a
       preview" and "before you spend a click", are describing, and it needs no
       cue of its own because the hover already opened it.

       The short lead is the interesting one. This reads like it should cost a
       scroll, since Loom Cairo is back up the list from Client work, and it
       was given 0.85 on that assumption and landed 0.59 early. It costs a
       travel and nothing else: the scroll the previous cue paid for to reach
       Client work brought Loom Cairo into view on its way past, so
       `ensureVisible` finds it already on screen and does nothing. Measured at
       0.26, and given 0.3 rather than 0.26 because that "already on screen" is
       a fact about a 720px viewport rather than about the page. */
    at: 13.5,
    lead: 0.3,
    say: "Rest on a row and you get a preview before you spend a click.",
    run: (s) => s.hover(`[data-tour="row:${CASE_STUDY}"]`),
  },
  {
    /* "Click one" (17.0). The press animation is 300ms before the route even
       changes, which is most of this lead; measured at 0.35 end to end. */
    at: 17.0,
    lead: 0.4,
    say: "Click one for the full case study: what it did, the real screens, and the thinking behind them.",
    run: (s) => s.activate(`[data-tour="row:${CASE_STUDY}"]`),
  },
  {
    /* "what it did," (19.0). The outcome row, and a loop around it rather than
       a point at it: the figures have no affordance, nothing lights up under a
       cursor resting on them, so a stationary dot beside a number reads as the
       tour having stalled. A circle is the gesture for "these". */
    at: 19.0,
    lead: 0.4,
    say: "",
    run: (s) => s.circle('[data-tour="case-stats"]'),
  },
  {
    /* "the real screens," (19.6). The tightest passage in the recording: three
       phrases in 1.8s, each needing about half of that to land. The scroll
       starts while the circle above is still closing, and that is the intended
       reading rather than a collision, because it is one continuous movement
       down the page: the cursor finishes on the figures, the page carries on
       to the strip, the strip gets thrown. */
    at: 19.6,
    lead: 0.55,
    say: "",
    run: async (s) => {
      await s.scrollTo("[data-case-bleed]", "center");
      await s.flick("[data-case-bleed] .snap-x", 700);
    },
  },
  {
    /* "and the thinking behind them." (20.1), which is the prose under the
       strip. Allowed to overlap the flick above, and this is the one place in
       the array where two cues are deliberately in flight at once: that one
       moves a scroller sideways and this one moves the window down, so they
       are not competing for anything and the pair reads as a single gesture
       rather than as two. */
    at: 20.1,
    lead: 0.15,
    say: "",
    run: (s) => s.scrollBy(700),
  },
  {
    /* "You can also hit your Arrow keys" (20.8), and it presses an arrow key.
       The pager binds both pairs, so the sentence's own two halves can each
       get the key they name instead of J standing in for both. */
    at: 20.8,
    lead: 0.15,
    say: "You can also hit your Arrow keys or JK for quick keyboard navigation.",
    run: (s) => s.hotkey("ArrowRight", 1),
  },
  {
    /* "or JK for quick keyboard navigation." (22.0), split across the two
       letters it names: J forward, then K back, so the reader sees the key go
       both ways rather than watching a list scroll one direction.

       With the arrow above that is three route changes, and they are the point
       rather than a cost: the case study under the bubble changes twice and
       steps back once. It does not end where it started, and it should not:
       K undoes one press, not two. */
    at: 22.2,
    lead: 0.15,
    say: "",
    run: (s) => s.hotkey("j", 1),
  },
  {
    at: 23.2,
    lead: 0.15,
    say: "",
    run: (s) => s.hotkey("k", 1),
  },
  {
    /* "Here's a roster of the components" (24.0). Led by the route change
       rather than by the cursor that follows it, and that is the general rule
       for a `goto`: what the reader registers is the page becoming a different
       page, and the cursor finding its row is the next beat, not this one.
       Leading by the pair put the roster on screen half a second early. */
    at: 24.0,
    lead: 0.15,
    say: "Here's a roster of the components I'm proudest of, also fully keyboard-navigable.",
    run: async (s) => {
      await s.goto("/components");
      await s.point(`[data-tour="component:${COMPONENT}"]`);
    },
  },
  {
    /* "I'm proudest of," (25.5) opens the one it is pointing at. Same 0.35 as
       the case study above: an `activate` is a press animation and a push. */
    at: 25.5,
    lead: 0.4,
    say: "",
    run: (s) => s.activate(`[data-tour="component:${COMPONENT}"]`),
  },
  {
    /* "also fully keyboard-navigable." (26.5) brings the preview up, which is
       the last two seconds of this stop and the reason the component is Decode
       Flow: it animates itself, so it is already making its case by the time
       it is centred. See COMPONENT above.

       The obvious cue for this phrase is an arrow press, since the component
       pages carry the same pager the case studies do. It is not here because
       it would work: the press would land 0.35s after the preview arrived and
       replace it with the next component's page, so the thing the whole stop
       was building to would be on screen for a third of a second. */
    at: 26.5,
    lead: 0.4,
    say: "",
    run: (s) => s.scrollTo('[data-tour="component-preview"]', "center"),
  },
  {
    /* "Talks is where you can watch" (28.5). Landing, then moving. The talk is
       deliberately not played: the tour is already speaking, and starting a
       second video would put two voices in the room at once, one of which the
       reader cannot pause without stopping the other.

       Split between the two things this cue does, rather than led by either.
       At 0.6 the route landed 0.58 early and cut into the phrase before it; at
       a `goto`'s usual 0.15 the talk would settle 0.35 late. 0.35 puts the
       page change and the talk arriving about 0.15 either side of the word. */
    at: 28.5,
    lead: 0.35,
    say: "Talks is where you can watch my pitches and session recaps.",
    run: async (s) => {
      await s.goto("/talks");
      await s.scrollTo(`#${TALK}`, "center");
    },
  },
  {
    /* "my pitches and session recaps." (29.5), plural, so the list moves. What
       the line claims is that there are recordings, and a list going past says
       that better than one frozen poster does. */
    at: 29.5,
    lead: 0.2,
    say: "",
    run: (s) => s.scrollBy(620),
  },
  {
    /* "Finally, there's an About page" (31.2) and "and a Blog with some of my
       writings." (32.2), a second apart, one route each. Long enough to see
       what a page is and too short to start reading it, which is the correct
       length for a line that is listing rather than describing: the reader is
       being told these exist and where they are. */
    at: 31.2,
    lead: 0.15,
    say: "Finally, there's an About page and a Blog with some of my writings.",
    run: (s) => s.goto("/about"),
  },
  {
    at: 32.2,
    lead: 0.15,
    say: "",
    run: (s) => s.goto("/blog"),
  },
  {
    /* "An email is the quickest way to reach me." (33.8): home, and to the
       bottom of it, where the address actually is.

       The longest single cue in the array at 1.2s measured, almost all of it
       the scroll: it is the full height of the index, and the route change
       under it costs 0.02. The lead is 0.9 rather than the 1.2 that would put
       the footer exactly on the word, and the 0.3s of lateness is bought
       deliberately. At 1.2 this fires at 32.6 and the blog, which arrived at
       32.07, is on screen for half a second. Under a second is already "very
       quickly"; half is a flicker.

       ── Why the tour no longer comes home ──────────────────────────────────
       There was a cue after this one, silent, on "Thank you!" (35.5), that
       scrolled back to the top so the bubble could fly into the O it bloomed
       out of. It measured 0.98s, so landing it on the word means firing at
       34.5, and the footer only arrives at 34.1. It was a 0.4s stop at the
       contact details on the way to somewhere else, which is worse than not
       going: the whole reason this cue exists is to leave the reader on the
       address.

       So the tour ends at the footer, and TourBubble fades the circle in place
       rather than returning it, because the letter is three thousand pixels
       up. The return gesture is the nicer ending and this is the more useful
       one. The reader gets nearly three seconds on the contact details, which
       is what the last line of the recording is for. */
    at: 33.8,
    lead: 0.9,
    say: "An email is the quickest way to reach me. Thank you!",
    run: async (s) => {
      await s.goto("/");
      await s.scrollTo("footer", "end");
    },
  },
];

/* ── The two schedules ────────────────────────────────────────────────────
   Derived, so that the array above can stay in the order the recording is
   spoken in, which is the order it has to be read and edited in.

   They part company because `lead` applies to one of them and not the other.
   An action fires early so that it arrives on its word; a caption fires on its
   word exactly, because it *is* the word. A subtitle that anticipates the
   voice is a worse error than an action that follows it: the action reads as
   the page keeping up, and the caption reads as the transcript being wrong.

   Sorted after the shift, because a long lead can move a cue before the one
   authored ahead of it, and the engine walks these with an index rather than
   searching. The captions need no sort: no lead is applied to them, so they
   are already in order. */
export const TOUR_CAPTIONS: { at: number; say: string }[] = TOUR.filter((cue) => cue.say).map(
  (cue) => ({ at: cue.at, say: cue.say }),
);

export const TOUR_ACTIONS: { at: number; run: (s: TourStage) => unknown }[] = TOUR.filter(
  (cue) => cue.run,
)
  .map((cue) => ({ at: cue.at - (cue.lead ?? 0), run: cue.run! }))
  .sort((a, b) => a.at - b.at);

/* Where the tour is over, and now only a stand-in for it: the recording is
   37.2s and the provider reads its duration off the video, so this governs
   rehearsal and the handful of frames before `loadedmetadata` lands. Kept in
   step with the file anyway, because the one thing worse than an unused
   number is one that used to be right.

   Two pieces of copy quote a rounded version of this and neither imports it:
   the "40s tour" label in TourInvite.tsx and the button description in
   TourO.tsx. Restated rather than derived, because both of those are in the
   always-loaded path and importing this module to format one number would
   pull the whole cue array, closures and all, into the first-load bundle that
   TourProvider exists to keep it out of. Round up when it changes: a tour
   that comes in under its own estimate is the only direction of that error a
   reader forgives. */
export const TOUR_END = 37.2;

/* The recording. 540x540, which is a square crop of a 1080x1920 phone take:
   the bubble is a circle, so anything outside the middle square was never
   going to be seen, and shipping 30MB of portrait video to display 128px of
   it is bandwidth spent on pixels behind a mask. The crop is offset to the
   face rather than to the frame's centre, so its Y moves between takes. For
   this one, from portfolio-final.MOV:

     ffmpeg -i take.MOV -vf "crop=1080:1080:0:480,scale=540:540" \
       -c:v libx264 -profile:v high -level 3.0 -pix_fmt yuv420p \
       -crf 26 -preset slow -r 30 \
       -c:a aac -b:a 96k -ac 1 -ar 44100 \
       -movflags +faststart public/tour/tour.mp4

   The 480 is the only number to re-derive for a new take: pull a frame, put
   the top of the head about 18% down the crop, and the framing matches every
   take before it. Everything else is fixed by the player rather than by
   taste, and +faststart matters because the file is fetched at the moment the
   reader asks for the tour, not before it (`preload="none"`, see TourBubble).

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
