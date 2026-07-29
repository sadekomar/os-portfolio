"use client";

import * as React from "react";

import { useTheme } from "@/components/theme/ThemeProvider";
import { THEMES, type Theme } from "@/lib/theme";

/* ── Theme switch ─────────────────────────────────────────────────────────
   Three words in a pill, in the footer, opposite the copyright line.

   Words rather than a sun / monitor / moon triple, for two reasons. The
   first is honesty about the icon system: every glyph in components/icon is
   a named Hugeicons master, hand-corrected and diffable against upstream
   (see glyphs.ts). Three shapes drawn here to fill this control would be
   the first entries in that registry with no source behind them. The second
   is that a moon means "dark" only by convention, where "Dark" means it in
   any language a translation would reach, and on a site whose whole
   argument is that the content is the design, a word is the cheaper mark.

   The footer, not the nav. The nav has two destinations and a wordmark; the
   theme is not a third place to go. Nobody arrives looking for this, and
   the people who do want it are the people who scroll to the bottom of a
   page looking for exactly this kind of control.

   `role="radiogroup"` rather than a tablist or three toggle buttons: this
   is one setting with three mutually exclusive values, which is what a
   radio group *is*. That brings the expected keyboard contract with it
   (one tab stop for the whole control, arrows to move between options)
   which three plain buttons would not have. */

const LABELS: Record<Theme, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle() {
  const { theme, setTheme, ready } = useTheme();
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const index = THEMES.indexOf(theme);

  /* Arrows wrap, per the radio-group pattern: the options are a cycle with
     no first or last, so stopping at either end would be a dead key press
     rather than a boundary that means anything. Selection follows focus,
     which is also the pattern, and is right here because the setting is
     free to try: moving onto "Dark" and seeing the page turn is the whole
     preview, and there is nothing to undo but one more key press. */
  function onKeyDown(event: React.KeyboardEvent) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;

    event.preventDefault();
    const next = (index + step + THEMES.length) % THEMES.length;
    setTheme(THEMES[next]);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      onKeyDown={onKeyDown}
      className="t-switch text-micro w-fit font-medium"
    >
      <span
        aria-hidden="true"
        className="t-switch-pill"
        style={
          {
            "--t-switch-index": index,
            /* Held still until the stored preference has been read, so the
               pill doesn't slide from System to Dark on every page load for
               someone who chose Dark. After that it animates normally. */
            transition: ready ? undefined : "none",
          } as React.CSSProperties
        }
      />

      {THEMES.map((option, i) => {
        const selected = option === theme;

        return (
          <button
            key={option}
            ref={(element) => {
              refs.current[i] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            /* Roving tabindex: the group is one stop in the tab order and
               the arrows do the rest. */
            tabIndex={selected ? 0 : -1}
            onClick={() => setTheme(option)}
            className="t-switch-option"
          >
            {LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
