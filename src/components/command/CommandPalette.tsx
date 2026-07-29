"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Command, useCommandState } from "cmdk";
import { usePathname, useRouter } from "next/navigation";

import { useTheme } from "@/components/theme/ThemeProvider";
import { SuccessMark } from "@/components/ui/success-mark";
import { buildGroups, type Action, type ActionContext, type Confirm } from "./actions";

/* ── The palette ──────────────────────────────────────────────────────────
   Radix Dialog carries the modal contract (focus trap, Escape, inert
   background, and focus returned to whatever was focused before it opened,
   which covers both entry points: the ⌘K chord (focus goes back to wherever
   it was in the page) and the nav hint (back to the button). cmdk carries
   the list contract: the roving `aria-activedescendant`, the filter, and
   `loop` so ↓ from the last row wraps to the first.

   Nothing here is a second implementation of either. The file's own job is
   three things: the surfaces, the confirmation, and what happens after a
   row is chosen.

   ── The surfaces ──
   Straight quiet tonal, no exceptions asked for. The palette is a `surface`
   (the gray container at the 24px radius with its 8px gutter) holding two
   insets separated by exactly that gutter: the input in one, the results in
   the other. That is the same container→inset relationship the rest of the
   site is built from, so the palette reads as a piece of this page rather
   than as a widget dropped on top of it. No border, no shadow; the overlay
   plus the tonal step is the whole separation.

   ── The confirmation ──
   `run()` returning nothing means the action moved the visitor or the page,
   and the palette gets out of the way. Returning a `Confirm` means the
   action's entire effect was invisible, since a clipboard write leaves no trace,
   so the palette stays open and the row grows a tick (or, on failure, says
   what went wrong instead of claiming success). The distinction is the
   return type rather than a flag, so a new action can't forget to set it.
   See the note in actions.ts. */

/* Long enough to read at a glance, short enough that the palette isn't
   sitting there congratulating itself if the visitor keeps typing. Matches
   DownloadResume's own settle. */
const CONFIRM_MS = 2200;

export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolved, setTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<(Confirm & { id: string }) | undefined>();
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(confirmTimer.current), []);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  /* Deferred to the frame after the dialog has closed. Scrolling while the
     modal is still mounted fights Radix's focus restoration, which scrolls
     the restored element back into view and lands the reader 800px from
     where they asked to be. */
  const jumpTo = useCallback(
    (id: string) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = document.getElementById(id);
          if (!target) return;

          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
          /* replace, not push: a jump within a page the visitor is already
             on shouldn't cost them a Back press to leave it. The hash is
             written anyway so the position is copyable and shareable. */
          history.replaceState(null, "", `#${id}`);
        });
      });
    },
    [],
  );

  /* `href` is read straight off `window` rather than reassembled from
     `pathname`, so it carries the origin, the query and any hash the visitor
     is actually standing on, which is what "copy link to this page" has to
     mean. That is only safe because the provider remounts this component on
     every open (see the `key` there), so a render is never reusing an href
     from a page the visitor has since left. */
  const context: ActionContext = useMemo(
    () => ({
      pathname,
      href: typeof window === "undefined" ? "" : window.location.href,
      navigate: (href) => router.push(href),
      jumpTo,
      theme,
      resolved,
      setTheme,
    }),
    [pathname, router, jumpTo, theme, resolved, setTheme],
  );

  const groups = useMemo(() => buildGroups(context), [context]);

  async function execute(action: Action) {
    clearTimeout(confirmTimer.current);

    const outcome = await action.run();

    if (!outcome) {
      close();
      return;
    }

    setConfirm({ ...outcome, id: action.id });
    confirmTimer.current = setTimeout(() => setConfirm(undefined), CONFIRM_MS);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="cmd-overlay bg-background/60 fixed inset-0 z-50 backdrop-blur-[2px]" />

        {/* Top-anchored rather than centred: the list grows downward as the
            query narrows it, and a vertically centred panel would slide the
            input under the reader's eye on every keystroke. 12vh keeps it
            clear of the sticky nav without floating in the middle. */}
        <Dialog.Content
          className="cmd-panel fixed top-[8vh] left-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[34rem] -translate-x-1/2 sm:top-[12vh]"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>

          <Command
            label="Command palette"
            loop
            className="surface surface-stack"
            /* cmdk's own filter, with keywords folded in. Left as the
               default substring-scoring rather than swapped for a fuzzy
               matcher: nine projects and ~twenty actions is a list you
               read, not one you have to guess at, and fuzzy matching at
               this size mostly buys false positives. */
          >
            <div className="surface-inset flex h-12 items-center px-4">
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search pages, projects, actions…"
                aria-label="Search pages, projects and actions"
                className="text-body-sm placeholder:text-foreground-faint text-foreground w-full bg-transparent outline-none"
              />
            </div>

            <Command.List
              /* Capped rather than sized to content: an unbounded list on a
                 short viewport pushes the input off the top of the screen,
                 which is the one element that must never move. */
              className="surface-inset max-h-[min(22rem,52vh)] overflow-y-auto overscroll-contain p-2"
            >
              <Command.Empty className="text-body-sm text-foreground-faint px-3 py-6 text-center">
                No matches
              </Command.Empty>

              {groups.map((group) => (
                <Command.Group
                  key={group.heading}
                  heading={group.heading}
                  className="[&_[cmdk-group-heading]]:text-micro [&_[cmdk-group-heading]]:text-foreground-faint [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-medium [&:first-child_[cmdk-group-heading]]:pt-1"
                >
                  {group.actions.map((action) => (
                    <Row
                      key={action.id}
                      action={action}
                      confirm={confirm?.id === action.id ? confirm : undefined}
                      onSelect={() => execute(action)}
                    />
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            <Announce confirm={confirm} />

            {/* The keyboard model, stated once, in the quietest type on the
                site. Anyone who found ⌘K knows ↑↓ and ↵; this is for the
                visitor who arrived by clicking the nav hint. */}
            <p className="text-micro text-foreground-faint flex justify-between px-3 pt-0.5 pb-1">
              <span>↑↓ to move · ↵ to run</span>
              <span>esc to close</span>
            </p>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Row({
  action,
  confirm,
  onSelect,
}: {
  action: Action;
  confirm?: Confirm;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={`${action.label} ${action.meta ?? ""}`}
      keywords={action.keywords}
      onSelect={onSelect}
      /* `data-[selected=true]` and not `:hover`, because cmdk moves selection with
         the pointer as well as the arrows, so one state covers both inputs
         and the row under the cursor is always the row ↵ will run. */
      className="text-body-sm text-foreground-subtle data-[selected=true]:bg-wash data-[selected=true]:text-foreground flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2 transition-colors duration-150 ease-out select-none"
    >
      <span className="truncate">{action.label}</span>

      {confirm ? (
        <span
          className={`flex shrink-0 items-center gap-1.5 ${
            confirm.ok ? "text-foreground" : "text-foreground-faint"
          }`}
        >
          <span className="text-micro">{confirm.message}</span>
          {confirm.ok && <SuccessMark size="control" />}
        </span>
      ) : (
        action.meta && (
          <span className="text-micro text-foreground-faint max-w-[45%] shrink-0 truncate">
            {action.meta}
          </span>
        )
      )}
    </Command.Item>
  );
}

/* The result count has to be announced, and it has to be announced from
   *inside* `<Command>`, since `useCommandState` reads cmdk's store through
   context, so this can't be hoisted into the parent. A confirmation takes
   the region over while it is showing, because "Link copied" is the more
   urgent of the two things a screen reader could be told at that moment. */
function Announce({ confirm }: { confirm?: Confirm }) {
  const count = useCommandState((state) => state.filtered.count);

  return (
    <p aria-live="polite" role="status" className="sr-only">
      {confirm ? confirm.message : `${count} ${count === 1 ? "result" : "results"}`}
    </p>
  );
}
