"use client";

import * as React from "react";

import {
  DARK_QUERY,
  THEME_COLOR,
  THEME_STORAGE_KEY,
  isTheme,
  type ResolvedTheme,
  type Theme,
} from "@/lib/theme";

/* ── Theme provider ───────────────────────────────────────────────────────
   Holds the *preference* (`system` | `light` | `dark`) and publishes what it
   currently resolves to. The class on `<html>` is already correct before
   this mounts (the blocking script in layout.tsx put it there) so nothing
   here is responsible for the first paint. This owns the changes after it:
   the switch being used, the OS flipping underneath a visitor who is on
   `system`, and a second tab of this site being switched.

   No next-themes. The package is ~3kB to solve a problem that is one class
   toggle, one storage read and one media listener, and it would arrive with
   its own opinions about attribute names and transition suppression that
   this stylesheet already has answers for.

   Both inputs are read through `useSyncExternalStore` rather than copied
   into state by an effect. That is not a lint concession; it is what these
   two things are. `localStorage` and a `MediaQueryList` are external stores
   that this component observes and does not own, and mirroring them into
   `useState` would mean the component renders once with a value it already
   knows is stale and then again with the real one. `useSyncExternalStore`
   also has the hydration case built in: it renders the server snapshot on
   the first pass and swaps to the live one immediately after, which is
   exactly the handshake a themed page needs and is fiddly to hand-roll. */

/* ── The preference store ─────────────────────────────────────────────── */

const listeners = new Set<() => void>();

/* Cached because `getSnapshot` is called on every render and must return a
   stable value; re-reading storage each time would be a synchronous disk-
   backed hit in the render path for no gain. Invalidated by the two things
   that can change it: a write from this tab, and a `storage` event from
   another one. */
let cachedPreference: Theme | null = null;

function loadPreference(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    /* Anything else is treated as absent rather than trusted. The key is a
       public string in the visitor's own storage, and this is what keeps a
       hand-edited value out of `classList`. */
    return isTheme(stored) ? stored : "system";
  } catch {
    /* Reading storage *throws* (it doesn't return null) in Safari's
       private mode and wherever third-party storage is blocked. Someone
       whose browser won't remember their choice still gets a working site
       on their OS's preference. */
    return "system";
  }
}

function subscribePreference(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    cachedPreference = null;
    callback();
  };

  listeners.add(callback);
  /* Two tabs open on this site are one visitor with one preference. The
     `storage` event only fires in the tabs that *didn't* write, which is
     precisely the set that needs telling. */
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getPreference(): Theme {
  cachedPreference ??= loadPreference();
  return cachedPreference;
}

/* `system` on the server, because the server has no way to know and
   guessing would mean shipping markup that contradicts the head script. */
function getServerPreference(): Theme {
  return "system";
}

function writePreference(theme: Theme) {
  cachedPreference = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* The choice still applies for this session; it just won't survive. */
  }
  for (const listener of listeners) listener();
}

/* ── The OS store ─────────────────────────────────────────────────────────
   Tracked rather than sampled: someone reading a case study at dusk on
   macOS's automatic appearance should have the page turn with the rest of
   their desktop, not on their next navigation. */

let query: MediaQueryList | null = null;

function mediaQuery() {
  query ??= window.matchMedia(DARK_QUERY);
  return query;
}

function subscribeSystem(callback: () => void) {
  const q = mediaQuery();
  q.addEventListener("change", callback);
  return () => q.removeEventListener("change", callback);
}

function getSystem(): ResolvedTheme {
  return mediaQuery().matches ? "dark" : "light";
}

/* Light on the server for the same reason the preference is `system`: it is
   the neutral assumption, and the head script has already overruled it in
   the DOM by the time this matters. */
function getServerSystem(): ResolvedTheme {
  return "light";
}

/* ── Hydration ────────────────────────────────────────────────────────────
   `false` through the server render and the hydrating one, `true` after.
   The switch uses it to hold its pill still for that first pass, so a stored
   `dark` doesn't slide the pill across the track on every page load. */

const noopSubscribe = () => () => {};

/* ── The context ──────────────────────────────────────────────────────── */

type ThemeContextValue = {
  /** What the visitor asked for. `system` means "don't ask me". */
  theme: Theme;
  /** What that currently means, once `system` has been resolved. */
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  /** False until the stored preference is live. See above. */
  ready: boolean;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(
    subscribePreference,
    getPreference,
    getServerPreference,
  );
  const system = React.useSyncExternalStore(subscribeSystem, getSystem, getServerSystem);
  const ready = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const resolved: ResolvedTheme = theme === "system" ? system : theme;

  /* The one place the DOM is written, and the one thing in this file that is
     genuinely an effect: pushing React's state out to an external system.
     `color-scheme` is deliberately absent; globals.css derives it from this
     class, so there is a single source for it (see the note in `:root`). */
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");

    /* The mobile address bar. Emitted with a light value in the viewport
       export so the tag exists before hydration; corrected here, which is
       the only moment an explicit override is knowable. */
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLOR[resolved]);
  }, [resolved]);

  const value = React.useMemo(
    () => ({ theme, resolved, setTheme: writePreference, ready }),
    [theme, resolved, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
