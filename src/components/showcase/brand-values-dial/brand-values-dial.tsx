"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { cn } from "@/lib/utils";

import logoLarge from "./logo-large.webp";
import styles from "./brand-values-dial.module.css";

const LOGO_KNOBS = {
  sizePct: 238,
  offsetXPct: 1,
  offsetYPct: 32,
  // 67° puts the Deep Marine arm in the visible window (red sits at -53°,
  // green at 187°). The display order marine → red → green runs against the
  // artwork's arm arrangement, so each step sweeps -120° (counterclockwise).
  baseRotationDeg: 67,
  rotationStepMultiplier: -1,
  transitionMs: 900,
  opacity: 1,
} as const;

// Strong ease-in-out, Emil's recommendation for elements moving between
// fixed positions. Built-in CSS easings are too weak for this kind of motion.
const ROTATION_EASE = "cubic-bezier(0.77, 0, 0.175, 1)";

type ValueItem = {
  title: string;
  colorName: string;
  hex: string;
  description: string;
};

const VALUES: ValueItem[] = [
  {
    title: "Reliability",
    colorName: "Deep Marine",
    hex: "#082B3A",
    description:
      "Clients rely on us when timing, coordination, and technical follow-through have to stay steady under real project pressure.",
  },
  {
    title: "Innovation",
    colorName: "Argonaut Red",
    hex: "#942429",
    description:
      "We turn complex MEP, HVAC, and fire safety requirements into clear, buildable routes from concept to commissioning.",
  },
  {
    title: "Sustainability",
    colorName: "Systems Green",
    hex: "#3B7A57",
    description:
      "We look for solutions that improve performance, reduce waste, and keep long-term operation in view from the first specification.",
  },
];

// Maps display position to VALUES array index to show: Innovation (left), Reliability (right), Sustainability (top)
const DISPLAY_ORDER = [2, 1, 0];

// Values pre-ordered by display position. Derived from module constants, so it
// never changes: hoisted out of the render path rather than rebuilt per render.
const DISPLAY_VALUES = DISPLAY_ORDER.map((i) => VALUES[i]);

// Linear reading order for the mobile pill row, expressed as display indices.
// Desktop reads left → top → right = Innovation → Sustainability → Reliability,
// so mobile must follow the same sequence rather than the raw display order.
const MOBILE_PILL_ORDER = [1, 0, 2];

// Counter numbering follows the label reading order (Innovation, Sustainability,
// Reliability) as VALUES indices, independent of array or display order.
const NUMBER_ORDER = [1, 2, 0];

const getDisplayIndex = (valuesIndex: number) =>
  DISPLAY_ORDER.indexOf(valuesIndex);
const getValuesIndex = (displayIndex: number) => DISPLAY_ORDER[displayIndex];

const AUTOPLAY_MS = 9000;

export function BrandValuesDial({ className }: { className?: string } = {}) {
  // Track a cumulative step count so the logo's rotation always increases:
  // every selection sweeps forward to the next state instead of snapping back.
  // Starts at 1 so the reading order begins on Innovation (VALUES[1]); each
  // step then advances Innovation → Sustainability → Reliability.
  const [step, setStep] = useState(1);
  // Off-screen / hidden-tab pause and the explicit user pause are tracked
  // separately, matching the Strategic Partnerships carousel: autoplay only
  // runs when the section is visible and the user hasn't paused it. Defaults to
  // paused so the section stays inactive until the observer confirms it's shown.
  const [autoPaused, setAutoPaused] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const paused = autoPaused || userPaused;
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValuesIndex =
    ((step % VALUES.length) + VALUES.length) % VALUES.length;
  const currentDisplayIndex = getDisplayIndex(currentValuesIndex);
  const active = VALUES[currentValuesIndex];

  // Pause autoplay while the section is off-screen, the tab is hidden, or the
  // window is not focused so the timer never runs in the background.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let onScreen = false;
    const sync = () =>
      setAutoPaused(!onScreen || document.hidden || !document.hasFocus());
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(el);
    window.addEventListener("focus", sync);
    window.addEventListener("blur", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      window.removeEventListener("focus", sync);
      window.removeEventListener("blur", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // Advance once the timer bar finishes a cycle. Driving the advance off the
  // bar's animation keeps the indicator and the rotation in lockstep, and a
  // manual selection remounts the bar (keyed on step) so the countdown always
  // restarts from full rather than firing a stale pending tick.
  const handleCycleComplete = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleSelect = useCallback((displayIndex: number) => {
    setStep((prev) => {
      const currentIdx =
        ((prev % VALUES.length) + VALUES.length) % VALUES.length;
      const targetValuesIdx = getValuesIndex(displayIndex);
      if (currentIdx === targetValuesIdx) return prev;
      const offset =
        (targetValuesIdx - currentIdx + VALUES.length) % VALUES.length;
      return prev + offset;
    });
  }, []);

  const togglePause = useCallback(() => setUserPaused((value) => !value), []);

  return (
    <section
      className={cn(
        styles.root,
        "relative overflow-hidden bg-white py-12 text-[var(--brand-ink)] lg:py-16",
        className,
      )}
    >
      <div
        ref={containerRef}
        className="mx-auto flex w-full max-w-[80rem] flex-col gap-8 px-6 sm:gap-9 md:px-8 lg:gap-10"
      >
        <div className="grid grid-cols-1 items-baseline gap-x-8 gap-y-2 lg:grid-cols-12">
          <div className="col-span-1 flex items-baseline gap-x-4 lg:col-span-3 lg:flex-col lg:border-r lg:border-[var(--brand-line)] lg:pr-6">
            <p className="text-xs leading-[1.5] font-bold tracking-[0.22em] text-[var(--brand-blue)] uppercase">
              Our values
            </p>
            <p className="font-mono text-xs leading-[1.5] text-[var(--brand-steel)] lg:mt-2">
              Palette · 03 tones
            </p>
          </div>
          <div className="col-span-1 lg:col-span-9">
            <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] text-[var(--brand-ink)] sm:text-[2.5rem] lg:text-[3.157rem]">
              Our Colors, Our Values.
            </h2>
            <p className="mt-2 max-w-3xl text-base leading-[1.55] font-medium tracking-[-0.01em] text-[var(--brand-steel)]">
              Three colors, three commitments. Each tone in the Argonaut palette
              represents a way we design, deliver, and partner.
            </p>
          </div>
        </div>

        <ValueDiagram
          active={active}
          currentDisplayIndex={currentDisplayIndex}
          step={step}
          paused={paused}
          onSelect={handleSelect}
          onCycleComplete={handleCycleComplete}
        />

        <div className="flex flex-col items-center gap-5">
          <ActiveValueStack currentDisplayIndex={currentDisplayIndex} />
          <PlaybackControls
            counter={NUMBER_ORDER.indexOf(currentValuesIndex) + 1}
            total={VALUES.length}
            userPaused={userPaused}
            onTogglePause={togglePause}
          />
        </div>
      </div>
    </section>
  );
}

// Inlined rather than pulled from an icon package: the showcase build ships no
// icon dependency, and these two glyphs are the whole requirement.
function PlayGlyph(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function PauseGlyph(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
    >
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

const PlaybackControls = memo(function PlaybackControls({
  counter,
  total,
  userPaused,
  onTogglePause,
}: {
  counter: number;
  total: number;
  userPaused: boolean;
  onTogglePause: () => void;
}) {
  const number = String(counter).padStart(2, "0");
  const count = String(total).padStart(2, "0");

  // The timer indicator itself lives on the logo's border (see CenterPill);
  // these controls only pause/resume the rotation and report the position.
  return (
    <div className="mx-auto flex items-center gap-4">
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={
          userPaused ? "Resume values rotation" : "Pause values rotation"
        }
        aria-pressed={userPaused}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--brand-line)] text-[var(--brand-ink)] transition-colors duration-200 hover:bg-[var(--brand-mist)] focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/40 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {userPaused ? (
          <PlayGlyph className="h-3.5 w-3.5" />
        ) : (
          <PauseGlyph className="h-3.5 w-3.5" />
        )}
      </button>

      <p className="font-mono text-xs leading-[1.5] tabular-nums text-[var(--brand-steel)]">
        {number} / {count}
      </p>
    </div>
  );
});

const ValueDiagram = memo(function ValueDiagram({
  active,
  currentDisplayIndex,
  step,
  paused,
  onSelect,
  onCycleComplete,
}: {
  active: ValueItem;
  currentDisplayIndex: number;
  step: number;
  paused: boolean;
  onSelect: (displayIndex: number) => void;
  onCycleComplete: () => void;
}) {
  const [top, left, right] = DISPLAY_VALUES;

  return (
    <div className="mx-auto w-full">
      {/* Desktop / tablet: hub-and-spoke layout */}
      <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:grid-rows-[auto_auto] sm:items-center sm:justify-items-center">
        {/* Row 1: empty | top satellite + connector | empty */}
        <div aria-hidden="true" />
        <div className="flex flex-col items-center">
          <SatellitePill
            value={top}
            isActive={currentDisplayIndex === 0}
            step={step}
            paused={paused}
            onSelect={() => onSelect(0)}
            onCycleComplete={onCycleComplete}
          />
          <Connector orientation="vertical" />
        </div>
        <div aria-hidden="true" />

        {/* Row 2: left satellite + connector | center pill | connector + right satellite */}
        <div className="flex w-full items-center justify-end">
          <SatellitePill
            value={left}
            isActive={currentDisplayIndex === 1}
            step={step}
            paused={paused}
            onSelect={() => onSelect(1)}
            onCycleComplete={onCycleComplete}
          />
          <Connector orientation="horizontal" />
        </div>

        <CenterPill activeHex={active.hex} step={step} />

        <div className="flex w-full items-center justify-start">
          <Connector orientation="horizontal" />
          <SatellitePill
            value={right}
            isActive={currentDisplayIndex === 2}
            step={step}
            paused={paused}
            onSelect={() => onSelect(2)}
            onCycleComplete={onCycleComplete}
          />
        </div>
      </div>

      {/* Mobile: stacked center pill with pills row underneath. Pills follow the
          desktop left → top → right reading order (Innovation, Sustainability,
          Reliability) rather than the raw display order. */}
      <div className="flex flex-col items-center gap-6 sm:hidden">
        <CenterPill activeHex={active.hex} step={step} />
        <div className="flex flex-wrap items-center justify-center gap-2">
          {MOBILE_PILL_ORDER.map((displayIndex) => {
            const value = DISPLAY_VALUES[displayIndex];
            return (
              <SatellitePill
                key={value.title}
                value={value}
                isActive={currentDisplayIndex === displayIndex}
                step={step}
                paused={paused}
                onSelect={() => onSelect(displayIndex)}
                onCycleComplete={onCycleComplete}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

const CenterPill = memo(function CenterPill({
  activeHex,
  step,
}: {
  activeHex: string;
  step: number;
}) {
  const stepDeg = (360 / VALUES.length) * LOGO_KNOBS.rotationStepMultiplier;
  // Cumulative: never resets, always sweeps in one consistent direction.
  const rotation = LOGO_KNOBS.baseRotationDeg + step * stepDeg;
  const tx = -50 + LOGO_KNOBS.offsetXPct;
  const ty = -50 + LOGO_KNOBS.offsetYPct;

  // Arrival accent: when the value changes, the hub catches the light, its glow
  // swells and settles in the value's colour while the logo briefly brightens
  // and deepens, peaking as the spin lands. Light, not scale, to stay premium.
  // Run via the Web Animations API rather than a keyed remount so the rotating
  // logo (and its in-flight spin transition) is never torn down. Skipped on
  // first mount and under reduced motion.
  const pillRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const pill = pillRef.current;
    const logo = logoRef.current;
    if (!pill || !logo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const duration = 820;
    const easing = "cubic-bezier(0.23, 1, 0.32, 1)";
    const resting = `0 0 80px -10px ${activeHex}66, 0 30px 60px -30px rgba(6,23,34,0.25)`;
    const peak = `0 0 120px -2px ${activeHex}cc, 0 30px 60px -30px rgba(6,23,34,0.25)`;

    const glow = pill.animate(
      [
        { boxShadow: resting, offset: 0 },
        { boxShadow: peak, offset: 0.72 },
        { boxShadow: resting, offset: 1 },
      ],
      { duration, easing },
    );
    const light = logo.animate(
      [
        { filter: "brightness(1) saturate(1)", offset: 0 },
        { filter: "brightness(1.14) saturate(1.18)", offset: 0.72 },
        { filter: "brightness(1) saturate(1)", offset: 1 },
      ],
      { duration, easing },
    );

    return () => {
      glow.cancel();
      light.cancel();
    };
  }, [step, activeHex]);

  return (
    <div className="relative flex items-center justify-center">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-full border border-[var(--brand-line)]/60 sm:-inset-3"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 rounded-full border border-[var(--brand-line)]/35 sm:-inset-6"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-7 rounded-full border border-[var(--brand-line)]/20 sm:-inset-10"
      />
      <div
        ref={pillRef}
        className="relative flex h-28 w-60 items-center justify-center overflow-hidden rounded-full border border-[var(--brand-line)] transition-[background-color,box-shadow] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none sm:h-32 sm:w-80 lg:h-36 lg:w-96"
        style={{
          backgroundColor: `${activeHex}33`,
          boxShadow: `0 0 80px -10px ${activeHex}66, 0 30px 60px -30px rgba(6,23,34,0.25)`,
        }}
      >
        <div
          ref={logoRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 aspect-square motion-reduce:transition-none"
          style={{
            height: `${LOGO_KNOBS.sizePct}%`,
            opacity: LOGO_KNOBS.opacity,
            transform: `translate(${tx}%, ${ty}%) rotate(${rotation}deg)`,
            transitionProperty: "transform",
            transitionDuration: `${LOGO_KNOBS.transitionMs}ms`,
            transitionTimingFunction: ROTATION_EASE,
          }}
        >
          <Image
            src={logoLarge}
            alt=""
            fill
            sizes="(min-width: 1024px) 700px, (min-width: 640px) 600px, 500px"
            className="object-contain"
            priority={false}
          />
        </div>
      </div>
    </div>
  );
});

const SatellitePill = memo(function SatellitePill({
  value,
  isActive,
  step,
  paused,
  onSelect,
  onCycleComplete,
}: {
  value: ValueItem;
  isActive: boolean;
  step: number;
  paused: boolean;
  onSelect: () => void;
  onCycleComplete: () => void;
}) {
  // --pill-color is the single source for the fill, the track tint, and the
  // hover affordances, so each pill previews its own value. When active, the
  // pill doubles as the timer: a colour fill sweeps left-to-right over one
  // interval, then onAnimationEnd advances. The unfilled track is a light tint
  // (ink label); the fill overlay carries the full colour (white label), keyed
  // on step so a manual selection restarts the countdown.
  // Hover idiom borrowed from .about-cta-button, a deepening fill with a slow,
  // luxurious ease, made grander with a soft double-ring halo that radiates
  // outward. No lift; the halo (box-shadow) clears the pill's overflow-hidden.
  const base =
    "group relative inline-flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-full px-4 text-sm font-medium tracking-[-0.005em] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue)] motion-reduce:transition-none sm:px-5";
  const stateClass = isActive
    ? "bg-[color-mix(in_srgb,var(--pill-color)_18%,var(--brand-mist))] text-[var(--brand-ink)] hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--pill-color)_35%,transparent),0_0_0_11px_color-mix(in_srgb,var(--pill-color)_14%,transparent)]"
    : "bg-[var(--brand-mist)] text-[var(--brand-ink)] hover:bg-[color-mix(in_srgb,var(--brand-ink)_10%,var(--brand-mist))] hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand-ink)_9%,transparent),0_0_0_11px_color-mix(in_srgb,var(--brand-ink)_4%,transparent)]";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={`Show ${value.title}`}
      className={`${base} ${stateClass}`}
      style={{ "--pill-color": value.hex } as CSSProperties}
    >
      <span className="whitespace-nowrap">{value.title}</span>
      {isActive ? (
        <span
          key={step}
          aria-hidden="true"
          onAnimationEnd={onCycleComplete}
          style={{
            animationDuration: `${AUTOPLAY_MS}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
          className={cn(
            styles.pillFill,
            "absolute inset-0 flex items-center justify-center bg-[var(--pill-color)] px-4 text-white sm:px-5",
          )}
        >
          <span className="whitespace-nowrap">{value.title}</span>
        </span>
      ) : null}
    </button>
  );
});

const Connector = memo(function Connector({
  orientation,
}: {
  orientation: "vertical" | "horizontal";
}) {
  if (orientation === "vertical") {
    return (
      <span
        aria-hidden="true"
        className="my-2 block h-10 w-px bg-[var(--brand-line)] lg:h-14"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="mx-2 block h-px w-12 bg-[var(--brand-line)] sm:w-16 lg:w-24"
    />
  );
});

const ActiveValueStack = memo(function ActiveValueStack({
  currentDisplayIndex,
}: {
  currentDisplayIndex: number;
}) {
  return (
    <div className="mx-auto grid">
      {DISPLAY_VALUES.map((value, index) => {
        const isActive = index === currentDisplayIndex;
        return (
          <div
            key={value.title}
            className={`flex flex-col items-center text-center transition-[opacity,filter] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] [grid-area:1/1] motion-reduce:transition-none ${
              isActive
                ? "opacity-100 blur-[0px]"
                : "pointer-events-none opacity-0 blur-[6px]"
            }`}
            aria-hidden={!isActive}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: value.hex }}
              />
              <p
                className="text-xs leading-[1.5] font-bold tracking-[0.22em] uppercase"
                style={{ color: value.hex }}
              >
                {value.colorName}
              </p>
            </div>
            <h3 className="mt-3 text-[2rem] leading-[1.08] font-semibold tracking-[-0.04em] text-balance text-[var(--brand-ink)] sm:text-[2.5rem] lg:text-[3.157rem]">
              {value.title}
            </h3>
            <p className="mt-3 max-w-xl text-base leading-[1.55] font-medium tracking-[-0.01em] text-pretty text-[var(--brand-steel)]">
              {value.description}
            </p>
          </div>
        );
      })}
    </div>
  );
});
