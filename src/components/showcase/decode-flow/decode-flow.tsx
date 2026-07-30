"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedText } from "./animated-text";

/**
 * The background pipeline, told as a vertical flow: a trigger event up top, a
 * line down into Wholana's decode hub, three edges fanning out to the craft
 * axes, and everything landing in a decode card that fills itself in, one axis
 * row at a time, with each axis node lighting up as its row types. The loop
 * cycles through real triggers so the diagram reads as "this keeps happening
 * on its own", not a one-off.
 *
 * Connectors, hub, and axis nodes live in one SVG so the curves scale with the
 * container; the trigger pill and the decode card are HTML so their type stays
 * crisp. Both share the container width, so the lines always meet them.
 *
 * Showcase note: every colour here is a literal rather than a theme token. The
 * diagram is a product artifact with its own palette (white paper, Wholana
 * plum, three axis accents), so it has to look the same on a light page and a
 * dark one. Wiring it to `text-foreground` would turn the card's own type
 * white on white the moment the surrounding site flipped to dark.
 */

/** Wholana's ink and plum, as literals, for the reason in the block above. */
const INK = "#1a1a1a";
const PLUM = "#7f055f";

type Scenario = {
  trigger: string;
  /** One typed value per craft axis, in LANES order. Keep each one-line short. */
  values: [string, string, string];
  /** Where the result landed, shown once the card is full. */
  footer: string;
};

const SCENARIOS: Scenario[] = [
  {
    trigger: "Outlier detected",
    values: [
      "Bold claim, first second",
      "Listicle, four beats",
      "Talking head",
    ],
    footer: "Saved to your feed",
  },
  {
    trigger: "New video posted",
    values: ["Opens on a question", "Three beats, fast cuts", "Green screen"],
    footer: "Logged to your track record",
  },
  {
    trigger: "Profile linked",
    values: [
      "You open on questions",
      "You cut every two seconds",
      "Talking head",
    ],
    footer: "Voice profile mapped",
  },
];

/** The craft axes: node position, packet colour, and card-row label. */
const LANES = [
  { id: "hook", label: "Hook", accent: "#06b6d4", x: 110 },
  { id: "structure", label: "Structure", accent: "#8b5cf6", x: 220 },
  { id: "format", label: "Format", accent: "#10b981", x: 330 },
];

const HUB = { x: 220, y: 130, r: 30, ring: 45 };
const NODE_Y = 300;
const NODE_R = 30;
/** Where the fan leaves the dotted ring and where it enters the nodes. */
const FAN_TOP = HUB.y + HUB.ring + 1;
const FAN_BOTTOM = NODE_Y - NODE_R;

function fanPath(x: number) {
  if (x === HUB.x) {
    return `M ${HUB.x} ${FAN_TOP} L ${HUB.x} ${FAN_BOTTOM}`;
  }
  // Leaves the ring vertically, swings out, and enters the node vertically.
  return `M ${HUB.x} ${FAN_TOP} C ${HUB.x} ${FAN_TOP + 42}, ${x} ${FAN_BOTTOM - 50}, ${x} ${FAN_BOTTOM}`;
}

/**
 * The Wholana W, inlined rather than loaded from /w.svg. An <image href> would
 * be a second network request for a 400-byte glyph, and in a portable showcase
 * component it would also be a path into a /public directory that the host app
 * may not have. Authored on an 806.62 x 591.47 canvas, so the scale factor
 * below lands it in the 28 x 20.5 box the hub circle expects.
 */
const W_MARK_SCALE = 28 / 806.62;

function HubMark() {
  return (
    <g
      transform={`translate(${HUB.x - 14} ${HUB.y - 10.3}) scale(${W_MARK_SCALE})`}
      aria-hidden
    >
      <path
        fill={PLUM}
        d="M398.99,524.44l-13.27,13.08c-37.12,30.4-81.75,48.96-129.98,52.91l-45.57.04c-46.85-4.41-90.78-23.11-126.78-53l-27.27-27.07C24,470.98,1.34,423.89,1.17,371.46L0,1.73l64.05.53c36.33,3.16,64.88,28.21,70.36,63.85-.91,4.57,1.37,8.06,1.37,12.72l.2,291.44c4.32,23.62,12.88,44.12,29.81,59.99,22.3,21.04,50.33,30.06,81.39,27.04,46.52-4.52,82.85-41.63,88.85-88.5l.73-309.69c.03-14.44,8.45-28.21,17.3-38.31,15.8-18.05,40.13-24.23,64.09-19.01,26.69,5.81,51.26,29.35,51.37,58.95l1.12,306.48c7.02,53.83,53.06,94.21,106.82,90.92,27.43-1.68,51.49-13.99,68.95-34.41,13.25-13.7,19.5-30.01,24.02-49.18l1.06-291.95c.15-40.22,30.39-72.52,68.86-78.95l38.33-.83c9.17-.2,17.52-2.47,27.95-.49l-1.14,369.49c-.17,53.6-22.99,102.72-57.76,142.32-39.5,44.98-95.75,72.22-155.25,77.1l-18.89.22-18.52-.38c-48.08-.99-112.58-30.08-145.84-66.58-1.46-1.6-2.89-2.57-4.45-2.76-2.3-.27-3.97.9-5.78,2.69Z"
      />
    </g>
  );
}

/** Craft-axis glyphs, drawn centred on (0,0) inside a ~12-unit box. */
function AxisGlyph({ id }: { id: string }) {
  if (id === "hook") {
    // Lightning bolt: the stop-scroll jolt.
    return (
      <path
        d="M1.4 -6 L-3.6 1 H-0.4 L-1.4 6 L3.6 -1 H0.4 Z"
        fill="#06b6d4"
        stroke="#06b6d4"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    );
  }
  if (id === "structure") {
    // Beat sheet: bars shortening like a retention curve.
    return (
      <g stroke="#8b5cf6" strokeWidth="1.6" strokeLinecap="round">
        <line x1="-4.5" y1="-4" x2="4.5" y2="-4" />
        <line x1="-4.5" y1="0" x2="2" y2="0" />
        <line x1="-4.5" y1="4" x2="-0.5" y2="4" />
      </g>
    );
  }
  // Format: a 9:16 frame with a caption bar.
  return (
    <g stroke="#10b981" strokeWidth="1.2" fill="none" strokeLinecap="round">
      <rect x="-3.6" y="-5.4" width="7.2" height="10.8" rx="1.8" />
      <line x1="-1.5" y1="3" x2="1.5" y2="3" />
    </g>
  );
}

type Phase = "trigger" | "decoding" | "typing" | "done";

const DECODING_MS = 1500;
const TYPE_MS = 26;
const ROW_PAUSE_MS = 220;
const HOLD_MS = 3400;
const TRIGGER_MS = 500;

export function DecodeFlow({
  className = "mx-auto w-full max-w-[440px]",
}: {
  /** Defaults to the width the diagram was drawn for, so it renders propless. */
  className?: string;
} = {}) {
  const [scenario, setScenario] = useState(0);
  // Pre-hydration and reduced-motion render the first card fully filled in.
  const [phase, setPhase] = useState<Phase>("done");
  const [row, setRow] = useState(2);
  const [chars, setChars] = useState(SCENARIOS[0].values[2].length);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedRef.current) return;
    const t = window.setTimeout(() => {
      setScenario(1);
      setPhase("trigger");
    }, HOLD_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reducedRef.current) return;
    if (phase === "trigger") {
      const t = window.setTimeout(() => setPhase("decoding"), TRIGGER_MS);
      return () => window.clearTimeout(t);
    }
    if (phase === "decoding") {
      const t = window.setTimeout(() => {
        setRow(0);
        setChars(0);
        setPhase("typing");
      }, DECODING_MS);
      return () => window.clearTimeout(t);
    }
    if (phase === "typing") {
      const value = SCENARIOS[scenario].values[row];
      const interval = window.setInterval(() => {
        setChars((c) => {
          if (c < value.length) return c + 1;
          window.clearInterval(interval);
          if (row < 2) {
            window.setTimeout(() => {
              setRow(row + 1);
              setChars(0);
            }, ROW_PAUSE_MS);
          } else {
            setPhase("done");
          }
          return c;
        });
      }, TYPE_MS);
      return () => window.clearInterval(interval);
    }
    // done: hold, then advance the loop.
    const t = window.setTimeout(() => {
      setScenario((s) => (s + 1) % SCENARIOS.length);
      setPhase("trigger");
    }, HOLD_MS);
    return () => window.clearTimeout(t);
  }, [phase, scenario, row]);

  const busy = phase === "decoding" || phase === "typing";
  const current = SCENARIOS[scenario];

  /** What a card row shows right now: its typed slice, or a shimmer bar. */
  function rowState(i: number) {
    if (phase === "decoding") return { skeleton: true, text: "" };
    if (phase === "trigger") return { skeleton: false, text: "" };
    if (phase === "done" || i < row) {
      return { skeleton: false, text: current.values[i] };
    }
    if (i === row) {
      return { skeleton: false, text: current.values[i].slice(0, chars) };
    }
    return { skeleton: false, text: "" };
  }

  return (
    <div className={className} data-busy={busy || undefined}>
      {/* Trigger pill */}
      <div className="flex justify-center">
        <div className="rounded-full bg-white px-6 py-2.5 shadow-[0_1px_2px_rgba(23,23,23,0.05),0_8px_24px_-8px_rgba(23,23,23,0.14)]">
          {/* `adf-pill` carries the literal ink rather than `text-foreground`:
              the pill is always white paper, so its type must not follow the
              host page's foreground into a dark theme. AnimatedText only
              forwards a className, hence a class rather than a style prop. */}
          <AnimatedText className="adf-pill text-body-sm font-medium">
            {current.trigger}
          </AnimatedText>
        </div>
      </div>

      {/* Connectors, hub, and axis nodes */}
      <svg
        viewBox="0 0 440 420"
        className="mt-1 h-auto w-full overflow-visible"
        role="img"
        aria-label="The trigger flows into Wholana's decode pass and fans out to the hook, structure, and format axes"
      >
        <title>Decode pipeline</title>
        <defs>
          <filter id="adf-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dy="1" stdDeviation="1" floodOpacity="0.05" />
            <feDropShadow dy="5" stdDeviation="8" floodOpacity="0.08" />
          </filter>
          <radialGradient id="adf-glow">
            <stop offset="0%" stopColor={PLUM} stopOpacity="0.13" />
            <stop offset="55%" stopColor={PLUM} stopOpacity="0.05" />
            <stop offset="100%" stopColor={PLUM} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="adf-hub" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f7f2f6" />
          </linearGradient>
        </defs>

        {/* Soft glow pooled behind the hub, breathing while a decode runs. */}
        <circle
          className="adf-glow"
          cx={HUB.x}
          cy={HUB.y}
          r="90"
          fill="url(#adf-glow)"
        />

        {/* Trigger feed: pill down into the hub. */}
        <line
          x1={HUB.x}
          y1="0"
          x2={HUB.x}
          y2={HUB.y - HUB.ring - 1}
          stroke="#d9d6d0"
          strokeWidth="1"
        />
        <line
          className="adf-stream"
          x1={HUB.x}
          y1="0"
          x2={HUB.x}
          y2={HUB.y - HUB.ring - 1}
          stroke={PLUM}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 20"
        />

        {/* Fan: hub out to the three craft axes. */}
        {LANES.map((lane, i) => {
          const d = fanPath(lane.x);
          return (
            <g key={lane.id}>
              <path d={d} fill="none" stroke="#d9d6d0" strokeWidth="1" />
              <path
                className="adf-stream"
                d={d}
                fill="none"
                stroke={lane.accent}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 20"
                style={{ animationDelay: `${i * -0.5}s` }}
              />
            </g>
          );
        })}

        {/* Axis nodes down into the decode card. */}
        {LANES.map((lane, i) => (
          <g key={lane.id}>
            <line
              x1={lane.x}
              y1={NODE_Y + NODE_R}
              x2={lane.x}
              y2="420"
              stroke="#d9d6d0"
              strokeWidth="1"
            />
            <line
              className="adf-stream"
              x1={lane.x}
              y1={NODE_Y + NODE_R}
              x2={lane.x}
              y2="420"
              stroke={lane.accent}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 20"
              style={{ animationDelay: `${i * -0.5 - 0.7}s` }}
            />
          </g>
        ))}

        {/* Decode hub: dotted ring around the W mark. */}
        <circle
          className="adf-ring"
          cx={HUB.x}
          cy={HUB.y}
          r={HUB.ring}
          fill="none"
          stroke="#b6aeb9"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="0.1 7.075"
          style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
        />
        <g filter="url(#adf-shadow)">
          <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill="url(#adf-hub)" />
        </g>
        <HubMark />

        {LANES.map((lane, i) => {
          const active = phase === "typing" && i === row;
          return (
            <g key={lane.id}>
              {/* Accent halo while this axis's row is typing in the card. */}
              <circle
                cx={lane.x}
                cy={NODE_Y}
                r={NODE_R + 4.5}
                fill="none"
                stroke={lane.accent}
                strokeWidth="1.5"
                opacity={active ? 0.6 : 0}
                style={{ transition: "opacity 0.35s ease" }}
              />
              <g filter="url(#adf-shadow)">
                <circle cx={lane.x} cy={NODE_Y} r={NODE_R} fill="#ffffff" />
              </g>
              <g transform={`translate(${lane.x} ${NODE_Y}) scale(1.7)`}>
                <AxisGlyph id={lane.id} />
              </g>
            </g>
          );
        })}
      </svg>

      {/* Decode card: one row per craft axis, plus where the result landed. */}
      <div className="rounded-[24px] bg-white px-6 py-5 shadow-[0_1px_2px_rgba(23,23,23,0.04),0_18px_44px_-14px_rgba(23,23,23,0.16),0_0_70px_-12px_rgba(127,5,95,0.22)] sm:px-7 sm:py-6">
        <div className="space-y-3">
          {LANES.map((lane, i) => {
            const state = rowState(i);
            return (
              <div key={lane.id} className="flex h-6 items-center gap-3">
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: lane.accent }}
                />
                <span
                  className="text-meta w-[76px] shrink-0 font-medium"
                  style={{ color: INK }}
                >
                  {lane.label}
                </span>
                {state.skeleton ? (
                  <span
                    className="adf-skeleton h-3.5 rounded-full"
                    style={{ width: `${[62, 48, 36][i]}%` }}
                  />
                ) : (
                  <span className="text-body-sm truncate text-[#6d6878]">
                    {state.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p
          className="text-meta mt-4 h-5 font-medium"
          style={{ color: PLUM }}
        >
          {phase === "decoding" ? (
            <span className="adf-shimmer">Decoding...</span>
          ) : phase === "done" ? (
            current.footer
          ) : (
            " "
          )}
        </p>
      </div>

      <style>{`
        .adf-pill { color: ${INK}; }
        @keyframes adf-stream { to { stroke-dashoffset: -24; } }
        @keyframes adf-ring { to { transform: rotate(360deg); } }
        @keyframes adf-breathe {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes adf-shimmer { to { background-position: -200% 0; } }
        .adf-ring { animation: adf-ring 60s linear infinite; }
        .adf-glow { opacity: 0.55; }
        .adf-stream {
          opacity: 0;
          transition: opacity 0.5s ease;
          animation: adf-stream 1.3s linear infinite;
        }
        [data-busy] .adf-stream { opacity: 1; }
        [data-busy] .adf-glow {
          animation: adf-breathe 1.6s ease-in-out infinite;
        }
        .adf-skeleton {
          background: linear-gradient(
            100deg,
            #e6e3ec 40%,
            #d3ceda 50%,
            #e6e3ec 60%
          );
          background-size: 200% 100%;
          animation: adf-shimmer 1.4s linear infinite;
        }
        .adf-shimmer {
          background: linear-gradient(
            100deg,
            #c9a3bd 42%,
            ${PLUM} 50%,
            #c9a3bd 58%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: adf-shimmer 1.4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .adf-ring, .adf-stream, .adf-skeleton, .adf-shimmer { animation: none; }
          .adf-stream { opacity: 0; }
          .adf-shimmer { background: none; color: ${PLUM}; }
        }
      `}</style>
    </div>
  );
}
