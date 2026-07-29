/* ── Theme ────────────────────────────────────────────────────────────────
   Three states, not two. "Light" and "Dark" are choices; `system` is the
   absence of one, and it has to be its own value rather than a boolean plus
   a flag: a visitor who has never touched the switch and a visitor who
   picked "Light" on a light OS look identical today and diverge the moment
   the OS flips at sunset. Storing only the resolved colour would freeze the
   first of those two into the second.

   `system` is also the default, which is what makes the site theme-*aware*
   rather than merely theme-*able*: the switch exists for the minority who
   want to disagree with their machine, and the majority never has to find
   it. See docs/north-stars.md: light and dark are both the real design. */

export const THEMES = ["system", "light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

/** What `system` currently resolves to, and the only thing the DOM sees. */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export const DARK_QUERY = "(prefers-color-scheme: dark)";

/** The address-bar tint, per resolved theme. `--surface` in both cases. */
export const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: "#fbfbfb",
  dark: "#111113",
};

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/* ── The pre-paint script ─────────────────────────────────────────────────
   Runs in `<head>`, synchronously, before the browser has painted anything.
   That timing is the entire point: React can only decide the theme after
   hydration, and a dark-mode visitor would spend that window looking at a
   white page, the flash every site with a theme switch and no blocking
   script has.

   It is a string rather than a module because it has to execute before the
   bundle exists. Everything it needs is inlined for the same reason; it
   cannot import `THEME_STORAGE_KEY`, so the key is interpolated in below
   and this file stays the one place it is written.

   The `try` is not defensive padding. `localStorage` *throws* on access
   (not returns null) in Safari's private mode and wherever third-party
   storage is blocked, and an uncaught throw in a blocking head script takes
   the rest of the page's scripts with it. A visitor whose browser won't
   remember their choice should still get a working site on their OS's
   preference, which is what the catch leaves them with.

   Only the class is written here. `color-scheme` follows from it in
   globals.css, so there is no second source for it to fall out of sync
   with. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="light"&&t!=="dark"){t=window.matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()`;
