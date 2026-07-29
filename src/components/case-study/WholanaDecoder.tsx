"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SuccessMark } from "@/components/ui/success-mark";
import { cn } from "@/lib/utils";
import { DECODES, PROVENANCE, STEPS, type Decode } from "@/components/case-study/wholana-decodes";

/* ── The Decoder, frozen ──────────────────────────────────────────────────
   Every other project on this site is described. This one can be used.

   The argument for building it at all: "it ingests TikToks and decodes their
   structure" is a sentence a reader has to take on faith, and the case study
   around this block is already making it twice. A visitor who picks a video
   and watches seventeen fields come out of it has checked the claim rather
   than believed it, and that happens in about two seconds.

   ── What it is, exactly ──────────────────────────────────────────────────
   Three real rows from Wholana's `decoded_video_fields` table, checked into
   this repo verbatim (see wholana-decodes.ts). No fetch, no key, no route,
   no env var. It cannot show a reader an error state because there is
   nothing in it that can fail, which is the only version of a live demo
   that belongs on a portfolio, where the failure mode isn't a retry, it's
   the reader concluding the product doesn't work.

   The honesty line under the trace is load-bearing rather than legal. A demo
   that lets someone believe it is calling a live pipeline has traded the
   thing it was built to earn.

   ── The staged reveal ────────────────────────────────────────────────────
   The five steps are the real ones, in the order they really run: the two
   halves of the ingest boundary, then the three model calls the prompt
   version is composed from. They are listed at rest, before anything is
   pressed, so the shape of the pipeline is readable without running it,
   and so that pressing Decode lights up a diagram already on screen instead
   of pushing a new panel into the page.

   Timing is the demo's own and says so in the fixture. What it buys is the
   sense of five distinct pieces of work: the two model calls are roughly
   twice the length of the plumbing around them, so the sequence has a
   middle rather than being a bar that fills. Nothing waits on a network, so
   the pacing is exact on every machine and every connection.

   ── Reduced motion ───────────────────────────────────────────────────────
   Not a shorter animation: no animation. Pressing Decode lands on the
   finished state in one frame, every step already marked done, the result
   already there. The staged reveal is decoration over information that
   exists either way, and the reader who asked for less movement gets the
   information without the theatre rather than a degraded version of it. */

type Phase = "idle" | "running" | "done";

export function WholanaDecoder() {
  const [selected, setSelected] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("idle");
  /* How many steps have finished. `running` treats this as the index of the
     step currently in flight, which is why one number describes the whole
     trace instead of an array of statuses. */
  const [completed, setCompleted] = React.useState(0);

  const reduced = useReducedMotion();
  const decode = DECODES[selected];

  React.useEffect(() => {
    if (phase !== "running") return;

    /* Every step is scheduled up front off one clock rather than each one
       arming the next on completion. A chain accumulates the drift of every
       timer before it, and a tab that is backgrounded mid-run would resume
       into a sequence that had lost its shape. */
    const timers: number[] = [];
    let elapsed = 0;

    STEPS.forEach((step, i) => {
      elapsed += step.ms;
      timers.push(window.setTimeout(() => setCompleted(i + 1), elapsed));
    });

    /* A beat after the last step rather than on it: the trace finishing and
       the result arriving are two events, and collapsing them reads as the
       result having been there all along. */
    timers.push(window.setTimeout(() => setPhase("done"), elapsed + 140));

    return () => timers.forEach(window.clearTimeout);
  }, [phase]);

  /* Reduced motion never enters `running`. Branching here rather than inside
     the effect is the difference between "play the sequence with the
     transitions off" and "there is no sequence". The second is what was
     actually asked for, and it also means the effect below stays a pure
     scheduler with one job. */
  const run = () => {
    if (reduced) {
      setCompleted(STEPS.length);
      setPhase("done");
      return;
    }

    setCompleted(0);
    setPhase("running");
  };

  /* Picking a different video returns the machine to rest. The alternative,
     swapping the result underneath a completed trace, would show a decode
     that no longer matches the steps that produced it. */
  const select = (index: number) => {
    if (index === selected) return;
    setSelected(index);
    setCompleted(0);
    setPhase("idle");
  };

  return (
    /* The three tonal levels the system defines, used at their full depth
       and only once each: `surface` is the sunken container, `surface-inset`
       the raised panels inside it, `surface-recessed` the panels inside
       those. Radii nest with them (24 outside, 16 for a panel, 12 for a
       block within a panel) so depth is legible without a single line
       being drawn. */
    <div className="surface surface-stack">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 pb-1 pt-3">
        {/* Not "The Decoder". The section heading three lines above already
            is, and two identical titles that close together read as a
            rendering bug. An imperative also says the one thing the section
            heading can't: that this one is operable. */}
        <h3 className="font-serif text-case-heading italic text-foreground">Decode a TikTok</h3>
        <p className="text-case-caption text-foreground-faint">
          Three real rows, frozen into this page. Pick one and run it.
        </p>
      </div>

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="surface-inset p-2">
        {/* A radiogroup rather than a listbox: three visible options, one
            chosen, no popup. Arrow keys are handled natively by the roving
            `tabIndex` a radiogroup implies, so the whole picker is one tab
            stop rather than three. */}
        <div role="radiogroup" aria-label="Video to decode" className="flex flex-col gap-1">
          {DECODES.map((item, i) => (
            <SourceRow
              key={item.id}
              decode={item}
              active={i === selected}
              onSelect={() => select(i)}
            />
          ))}
        </div>
      </div>

      {/* ── The pipeline ────────────────────────────────────────────────── */}
      {/* `surface-inset`, not `surface-recessed`. Recessed is the tone for a
          panel sitting *inside* a raised one; against the sunken container
          it is a 2.4% step and reads as the same fill with a rounded corner
          drawn on it. The three panels here are all children of the
          container, so they all sit at the raised level, and the recessed
          tone is kept for the blocks inside the result below. */}
      <div className="surface-inset flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="text-case-caption text-foreground-faint">
            Craft pass · <span className="font-mono">{PROVENANCE.promptVersion}</span>
          </p>

          <Button
            onClick={run}
            loading={phase === "running"}
            disabled={phase === "running"}
            size="sm"
            className="min-w-28"
          >
            {phase === "done" ? "Run again" : "Decode"}
          </Button>
        </div>

        <ol className="flex flex-col gap-2.5" aria-busy={phase === "running"}>
          {STEPS.map((step, i) => {
            const status =
              phase === "done" || i < completed
                ? "done"
                : phase === "running" && i === completed
                  ? "running"
                  : "pending";

            return (
              <li key={step.key} className="flex items-center gap-2.5">
                {/* A fixed 16px box under every mark so the three states
                    swap inside it without the label beside them moving. */}
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {status === "running" ? (
                    <Spinner size="control" className="text-foreground-subtle" />
                  ) : status === "done" ? (
                    <SuccessMark size="control" className="text-wave" />
                  ) : (
                    /* Present, not absent. A pending step still has to read
                       as a step, since an empty slot would make the list look
                       like it began at whichever one was lit. */
                    <span className="size-1.5 rounded-full bg-foreground-ghost" />
                  )}
                </span>

                {/* `shrink-0`: the step's name is the row, and the detail
                    beside it is the row's footnote. Without this the flex
                    line gives way at the label first on a phone, so "Field
                    extraction" breaks over two lines to make room for a
                    string that was already set to truncate. */}
                <span
                  className={cn(
                    "shrink-0 text-case-caption transition-colors duration-200 motion-reduce:transition-none",
                    status === "pending" ? "text-foreground-faint" : "text-foreground",
                  )}
                >
                  {step.label}
                </span>

                {/* The detail is what the step *produced*, so it cannot
                    exist before the step does. Held in the layout at zero
                    opacity rather than mounted on completion, so a row that
                    fills never changes height.

                    `motion-reduce:transition-none` on this and the label
                    beside it is what makes the reduced-motion path actually
                    instant. Pressing Decode with reduced motion sets all
                    five steps done in one update, and without this the row
                    would still spend 300ms fading, a shorter version of the
                    sequence rather than none of it. It also matches how the
                    rest of the site handles it (see the reduce block at the
                    end of globals.css). */}
                <span
                  className={cn(
                    "min-w-0 truncate font-mono text-[0.6875rem] text-foreground-faint transition-opacity duration-300 motion-reduce:transition-none",
                    status === "done" ? "opacity-100" : "opacity-0",
                  )}
                >
                  {step.detail(decode)}
                </span>
              </li>
            );
          })}
        </ol>

        {/* One announcement at the end instead of five as they land. A trace
            narrated step by step is noise; the fact a screen-reader user
            needs is that the result below is now populated. */}
        <p role="status" aria-live="polite" className="sr-only">
          {phase === "done" ? `Decoded ${decode.source.handle}. Result below.` : ""}
        </p>
      </div>

      {/* ── Output ──────────────────────────────────────────────────────── */}
      {phase === "done" && <Result decode={decode} reduced={Boolean(reduced)} />}

      <p className="px-4 pb-2 pt-1 text-case-caption text-foreground-faint">
        A frozen copy of the real thing, not a live call. These three decodes
        were produced by Wholana&rsquo;s craft pass on {PROVENANCE.decodedAt} and
        pasted into this page. The pipeline has moved on since; the fields, the
        wording and the numbers are exactly as it wrote them.
      </p>
    </div>
  );
}

/* ── A candidate video ────────────────────────────────────────────────────
   Handle, caption, reach. Deliberately not a thumbnail: a TikTok cover is a
   remote image on a CDN, and the one rule this block cannot break is that it
   never touches the network. A row of text also happens to be the honest
   shape of the input: the craft pass reads a transcript, not a picture. */
function SourceRow({
  decode,
  active,
  onSelect,
}: {
  decode: Decode;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "flex w-full items-baseline gap-x-3 gap-y-0.5 rounded-md px-3 py-2.5 text-left transition-colors duration-150 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
        "max-sm:flex-col max-sm:items-start",
        active ? "bg-surface-sunken" : "hover:bg-wash",
      )}
    >
      <span
        className={cn(
          "shrink-0 text-case-caption transition-colors duration-150 motion-reduce:transition-none",
          active ? "text-foreground" : "text-foreground-subtle",
        )}
      >
        {decode.source.handle}
      </span>

      {/* The caption runs right-to-left, since it is Arabic, as posted. `dir` is
          set on the element rather than left to the browser's guess so the
          trailing emoji and punctuation land on the correct side. */}
      <span dir="auto" className="min-w-0 flex-1 truncate text-case-caption text-foreground-muted">
        {decode.source.caption}
      </span>

      <span className="shrink-0 text-case-caption tabular-nums text-foreground-faint">
        {decode.source.views} views
      </span>
    </button>
  );
}

/* ── The decode ───────────────────────────────────────────────────────────
   Ordered the way the product orders it, which is the order the video is
   experienced in rather than the order the columns sit in the table: the
   spoken hook first and loudest, then the four systems that carry the
   middle, then the beat sheet underneath.

   The hook is quoted at 20px against 13px labels because it is the only
   verbatim thing on the panel; everything else is the model's description
   of the video, and this is the video. */
function Result({ decode, reduced }: { decode: Decode; reduced: boolean }) {
  const { stopScroll, retention, stakes, engagement, metadata } = decode;

  /* Ease-out, short, and up rather than down: the panel is arriving from
     the work that just finished above it, so it settles into place instead
     of dropping in. Reduced motion skips the transform entirely; see the
     header note. */
  const enter = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <motion.div {...enter} className="surface-inset flex flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="font-serif text-[1.25rem] italic leading-snug text-foreground">
          &ldquo;{stopScroll.spokenHook}&rdquo;
        </p>
        {stopScroll.sideHook && (
          <p className="text-case-caption text-foreground-subtle">
            Side hook &mdash; &ldquo;{stopScroll.sideHook}&rdquo;
          </p>
        )}
      </div>

      <p className="text-case-caption leading-relaxed text-foreground-muted">{decode.logline}</p>

      {/* Two columns from `sm` up, one below. Grouping is by gap and fill,
          never by a divider: five recessed blocks with 8px between them
          read as five things without a single rule being drawn.

          `items-start` because the fields are wildly uneven: Stakes & value
          carries four, two of them a sentence long, and Engagement often
          has a null in it. Stretched to a common height the shorter card
          ends in a tall panel of empty fill, and in a system with no borders
          an empty filled rectangle doesn't read as breathing room; it reads
          as content that failed to load. Letting each card end where its
          content ends turns that into plain space, which is the thing this
          page uses to separate everything else anyway. */}
      <div className="grid items-start gap-2 sm:grid-cols-2">
        <System
          title="Hook"
          fields={[
            ["Archetype", stopScroll.hookArchetype],
            ["Specificity", stopScroll.specificityLevel],
            ["Why it stops", stopScroll.whyItStops],
          ]}
        />
        <System
          title="Retention"
          fields={[
            ["Narrative structure", retention.narrativeStructure],
            ["Payoff timing", retention.payoffTiming],
            ["Re-engagement", retention.reEngagementMechanic],
          ]}
        />
        <System
          title="Stakes & value"
          fields={[
            ["Stake type", stakes.stakeType],
            ["Perceived stakes", stakes.perceivedStakes],
            ["What viewers gain", stakes.viewerGain],
            ["Pain avoided", stakes.painAvoidance],
          ]}
        />
        <System
          title="Engagement"
          fields={[
            ["Shareability driver", engagement.shareabilityDriver],
            ["Explicit CTA", engagement.explicitCta],
            ["Comment bait", engagement.commentBait],
          ]}
        />
        <System
          title="Metadata"
          className="sm:col-span-2"
          fields={[
            ["Keywords", metadata.primaryKeywords.join(", ")],
            ["Classification anchor", metadata.classificationAnchor],
          ]}
        />
      </div>

      <div className="surface-recessed flex flex-col gap-3 p-4">
        <h4 className="text-case-caption text-foreground-faint">
          Beat sheet
          <span className="ml-2 tabular-nums text-foreground-ghost">
            {decode.beatSheet.length} beats
          </span>
        </h4>

        {/* Numbered, because the beat sheet's whole claim is that it is in
            order. Tabular figures and a fixed marker column so the sentences
            start on one line however far the count runs. */}
        <ol className="flex flex-col gap-1.5">
          {decode.beatSheet.map((beat, i) => (
            <li key={beat} className="flex gap-3 text-case-caption text-foreground-muted">
              <span className="w-4 shrink-0 tabular-nums text-right text-foreground-ghost">
                {i + 1}
              </span>
              <span className="min-w-0">{beat}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-case-caption text-foreground-faint">
        AI-generated analysis. Verify before quoting.
      </p>
    </motion.div>
  );
}

function System({
  title,
  fields,
  className,
}: {
  title: string;
  fields: [label: string, value: string | null][];
  className?: string;
}) {
  return (
    <section className={cn("surface-recessed flex flex-col gap-3 p-4", className)}>
      <h4 className="text-case-caption text-foreground-faint">{title}</h4>

      <dl className="flex flex-col gap-2.5">
        {fields.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            {/* `faint`, which the scale defines as the rung for labels that
                name a thing beside them. These were `ghost` at first and it
                was the wrong read. Ghost is for marks that exist only to be
                not quite absent, and a field name the reader has to decipher
                is worse than no field name. */}
            <dt className="text-[0.6875rem] uppercase tracking-wide text-foreground-faint">
              {label}
            </dt>
            {/* A null is rendered, not skipped. The model was asked for this
                field and declined it, and "no explicit CTA in this video" is
                a finding, and dropping the row would quietly turn an answer
                into a gap in the schema. */}
            <dd
              className={cn(
                "text-case-caption",
                value ? "text-foreground-muted" : "text-foreground-ghost",
              )}
            >
              {value ?? "–"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
