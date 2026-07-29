"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import dynamic from "next/dynamic";

/* ── Mounting ─────────────────────────────────────────────────────────────
   This provider is what the root layout mounts, and it is deliberately the
   only part of the palette that ships with the first paint. It holds one
   boolean and two keyboard listeners; the palette itself is a separate chunk
   fetched the first time it's actually wanted.

   That split is not premature; it is the difference between the palette
   being free and it not being. `actions.ts` imports `projects.ts` for the
   project list, which is the right call (a second hardcoded list would drift
   from the case studies within one commit) but drags ~60KB of case-study
   prose along with it. On a site whose stated bar is "fast and quiet, no
   loaders on the index" (docs/north-stars.md), putting that on the critical
   path so a chord *might* be pressed is exactly the trade this codebase
   doesn't make. Behind `dynamic`, the cost is paid by the visitor who asked
   for it, in the moment they asked, behind an opening animation.

   Once fetched it stays mounted (`hasOpened` never goes back to false) so
   the second ⌘K of a session is instant. */
const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

type CommandPaletteValue = {
  isOpen: boolean;
  openPalette: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteValue | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) throw new Error("useCommandPalette must be used inside <CommandPaletteProvider>");
  return context;
}

/* `/` is a search shortcut everywhere on the web *except* inside a text
   field, where it is a character. Without this test the chord would make the
   site's own inputs (the palette's, and any that arrive later) unable to
   type a slash. */
function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  /* Bumped on every open, and used as the palette's `key`, so each opening
     is a genuinely new component rather than the last one with its state
     wiped. That is the whole reset mechanism, and it is a `key` rather than
     an effect that clears the query on close for two reasons: an effect
     would fire a second render every time the palette shut, and it would
     have to remember to clear each new piece of state someone adds later.
     Remounting cannot forget.

     It matters more here than in a search box, because the palette's list is
     built from the route: a stale query is a filter the visitor typed
     against a different page's actions. */
  const [session, setSession] = useState(0);

  const openPalette = useCallback(() => {
    setHasOpened(true);
    setSession((n) => n + 1);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const chord = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (chord) {
        /* Chrome binds ⌘K to the omnibox search-engine shortcut and Firefox
           to the search bar, so this has to be prevented rather than merely
           handled. */
        event.preventDefault();
        /* Read from state rather than from a `setIsOpen` updater, which is
           why `isOpen` is in this effect's deps: opening has to bump the
           session counter too, and an updater that calls another setState is
           a side effect in a function React is allowed to run twice. Cost of
           the alternative is rebinding one document listener per toggle. */
        if (isOpen) setIsOpen(false);
        else openPalette();
        return;
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (isTyping(event.target)) return;
        event.preventDefault();
        openPalette();
      }
    };

    /* Not capture-phase, and not on `window`: a listener that fires before
       the focused element has seen the key would take `/` off any input that
       hasn't been given a chance to stop it. Bubbling to the document is
       late enough that `isTyping` above is the whole guard needed. */
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openPalette, isOpen]);

  const value = useMemo(() => ({ isOpen, openPalette }), [isOpen, openPalette]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {hasOpened && <CommandPalette key={session} open={isOpen} onOpenChange={setIsOpen} />}
    </CommandPaletteContext.Provider>
  );
}
