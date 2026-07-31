"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image, { type StaticImageData } from "next/image";

import { Row } from "@/components/index/Row";
import { useWorkPreview, WorkPreviewCard, WorkPreviewLayer } from "@/components/index/WorkPreview";
import type { MarkName } from "@/components/logo/marks";

export type WorkItem = {
  href: string;
  title: string;
  description: string;
  logo?: MarkName;
  /* The case study's hero image, or absent where that case study has no
     imagery yet. A row without one still previews; see the note below. */
  preview?: StaticImageData;
  /* The one-line "what this was" from the case study header. Short enough to
     sit under the image without the panel becoming a second description. */
  role?: string;
  /* The case study's period, right-aligned on the row. Optional: a project
     without a recorded span shows no date rather than a guess. */
  meta?: string;
};

export type WorkGroup = {
  /* What kind of thing these are, not what they are about. See the note in
     app/page.tsx for why the answer is three words and not nine. */
  title: string;
  items: WorkItem[];
};

/* The Work list, with a preview panel that follows the selected row.

   This is the one place the index shows imagery, and it is a deliberate
   exception to the rule stated at the top of app/page.tsx: no thumbnails,
   depth lives one click down. The exception holds on a distinction: nothing
   here is in the static layout. The page still loads, prints and screenshots
   as a column of text, and the image appears only once a reader has singled
   out one row, which is intent rather than decoration. A visitor scanning the
   list never sees it; a visitor who has stopped on Argotemp gets a look at
   Argotemp before deciding to spend a click.

   ── Why it is no longer pointer-only ──

   The original argument for pointer-only was that a keyboard tab through the
   list shouldn't fire the panel, because a tab is traversal rather than
   attention. Someone on their way to the footer would get nine images they
   never asked for. That reasoning was right and it survives; what changed is
   that tabbing through the list is no longer how a keyboard reaches a row.

   The list is now a single tab stop with a roving tabindex. Tab enters it
   once and leaves it once; arrows (and j/k) move a selection *inside* it.
   That makes an arrow press exactly the thing a hover was (a reader
   deliberately stopping on one row) and the panel answers it for the same
   reason it answers a pointer. Traversal costs one keystroke and shows one
   panel; attention shows the panel it asked for. The audience that used to
   be excluded here wasn't being spared a worse copy of the page, it was
   being handed a shorter one.

   ── One selection, last input wins ──

   Pointer and keyboard write to the same selection rather than keeping two.
   Whichever spoke last owns the panel: moving the mouse takes it over,
   pressing a key takes it back. The two rules that make that behave:

     A key press moves DOM focus. A pointer move never does. Hovering row
     seven while row two holds focus shows seven and leaves focus on two,
     stealing focus from under a reader's hands to service a hover would be
     the interface deciding it knows better than the caret. When the pointer
     then leaves the list, the panel returns to the focused row rather than
     dismissing, because that selection was never actually cancelled.

     Scrolling under a stationary pointer makes Chrome emit a pointermove at
     unchanged coordinates. Left alone, arrowing down the list would scroll,
     that synthetic move would land on whatever row slid under the cursor,
     and the pointer would silently steal a selection the reader is driving
     with the keyboard. Moves at coordinates identical to the last real one
     are therefore ignored.

   ── Scoping ──

   Every key handler is bound to this container, not to `window`. A ⌘K palette,
   a search field, anything with its own idea of what ArrowDown means. None of
   them can collide with this, because when focus is in them it is not in here.
   It also means the arrows only ever pre-empt page scroll while the reader is
   demonstrably inside the list. */

/* Movement keys, as a lookup rather than a switch: `dir` is the step and null
   means "an end", which Home/End and the arrows can both be expressed in. */
const STEP: Record<string, number | "first" | "last"> = {
  ArrowDown: 1,
  ArrowUp: -1,
  j: 1,
  k: -1,
  Home: "first",
  End: "last",
};

export function WorkRows({ groups }: { groups: WorkGroup[] }) {
  /* Flattened once so that "the row after this one" is arithmetic and not a
     walk across group boundaries: the selection crosses from Founded into
     Client work without noticing there was a boundary, which is the same
     thing the pointer already did. */
  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  const { wrapperRef, showRow, hide, scheduleHide, cancelHide, layerRef } =
    useWorkPreview<WorkItem>();

  /* The only piece of selection in React state, and it is here because the
     roving tabindex is rendered. It moves on keyboard and focus only: letting
     a hover rewrite it would re-render every row on every row the pointer
     crossed, which is the long task this component was built to avoid, and
     would move the tab stop somewhere the reader never went. */
  const [tabStop, setTabStop] = useState(0);

  /* Which row the panel is currently showing, and which row the keyboard
     believes it is on. Refs because both are read and written inside handlers
     that must not render. */
  const shown = useRef(-1);
  const focused = useRef(-1);

  /* Guards the synthetic-pointermove case described above. */
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const pointerMuted = useRef(false);

  const rowAt = useCallback(
    (index: number) =>
      wrapperRef.current?.querySelector<HTMLElement>(`[data-row-index="${index}"]`) ?? null,
    [wrapperRef],
  );

  const selectByKey = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(flat.length - 1, index));
      const el = rowAt(next);
      if (!el) return;

      focused.current = next;
      shown.current = next;
      pointerMuted.current = true;
      setTabStop(next);

      /* Focus without the browser's own scroll, then bring the row in with
         `block: "nearest"`: the default focus scroll centres the row, which
         on a nine-row list means every arrow press heaves the page. Nearest
         moves nothing at all until the selection actually reaches an edge. */
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: "nearest" });

      showRow(flat[next], el);
    },
    [flat, rowAt, showRow],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      /* Modified presses belong to the browser or to the palette, never to a
         list: ⌘K, ⌘↓, alt-arrow word motion all pass straight through. */
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      /* Belt and braces. Focus cannot currently be in a field inside this
         container, but j and k are letters, and a handler that eats letters
         is one composed field away from being a bug someone else has to find. */
      if (target?.closest("input, textarea, select, [contenteditable]")) return;

      const from = target?.closest<HTMLElement>("[data-row-index]");
      const current = from ? Number(from.dataset.rowIndex) : focused.current;

      if (event.key === "Escape") {
        /* Dismisses the panel without dismissing the selection: focus stays
           where it is, so the next arrow press resumes rather than restarts. */
        hide();
        shown.current = -1;
        return;
      }

      /* Space activates the focused row the way Enter already does natively.
         Anchors ignore Space by default, which on a list this obviously
         list-shaped reads as a dead key rather than as correct semantics. */
      if (event.key === " " && from) {
        event.preventDefault();
        from.click();
        return;
      }

      const step = STEP[event.key];
      if (step === undefined) return;

      const next =
        step === "first"
          ? 0
          : step === "last"
            ? flat.length - 1
            : (current < 0 ? (step > 0 ? -1 : flat.length) : current) + step;

      /* Only claimed once the move is real. At the ends of the list the arrows
         fall back to the page, so holding ArrowDown past the last row carries
         on scrolling instead of stopping dead on a row the reader is trying to
         get past. No wrap-around for the same reason: a list of nine is short
         enough that wrapping reads as a jump backwards, not as continuity. */
      if (next < 0 || next > flat.length - 1) return;
      event.preventDefault();
      selectByKey(next);
    },
    [flat.length, hide, selectByKey],
  );

  /* Focus arriving from outside: a Tab into the list, or a click. Only the
     keyboard case shows a panel: `:focus-visible` is precisely the browser's
     own answer to "did this focus come from a keyboard", and a click that
     focuses a row is a reader already on their way to the case study. */
  const onFocus = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>("[data-row-index]");
      if (!el) return;
      const index = Number(el.dataset.rowIndex);
      focused.current = index;
      setTabStop(index);
      if (!el.matches(":focus-visible")) return;
      shown.current = index;
      showRow(flat[index], el);
    },
    [flat, showRow],
  );

  const onBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && wrapperRef.current?.contains(next)) return;
      focused.current = -1;
      shown.current = -1;
      hide();
    },
    [hide, wrapperRef],
  );

  /* Pointer tracking as a native listener on the container rather than a
     handler per row: one subscription, no per-row props, and no row that has
     to be re-rendered to learn the pointer is over it. */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onPointerMove = (event: PointerEvent) => {
      /* Touch has no hover, and a tap would otherwise flash a panel on the
         way to a navigation. Pen keeps it: a hovering stylus is a pointer
         resting on a row, which is the gesture this was built for. */
      if (event.pointerType === "touch") return;

      const prev = lastPointer.current;
      lastPointer.current = { x: event.clientX, y: event.clientY };

      /* Unchanged coordinates are the scroll artefact, never a reader. And the
         first move after a key press with no prior coordinates to compare
         against could be either, so it is spent establishing the baseline,
         one swallowed event, and the reader's second millimetre of movement
         hands the selection back to the pointer. */
      if (prev && prev.x === event.clientX && prev.y === event.clientY) return;
      if (pointerMuted.current) {
        pointerMuted.current = false;
        if (!prev) return;
      }

      const el = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-row-index]");
      if (!el) return;
      const index = Number(el.dataset.rowIndex);

      if (index !== shown.current) {
        shown.current = index;
        showRow(flat[index], el);
      } else {
        /* Same row, but the pointer may have arrived back from the panel with
           a dismissal already armed. Coming home cancels it. */
        cancelHide();
      }
    };

    /* Leaving a row but not the list only schedules a dismissal; leaving the
       list is the hard one. Either way, a row still holding focus wins the
       panel back; the keyboard's selection outlives the pointer's visit. */
    const onPointerOut = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const to = event.relatedTarget as Node | null;
      if (to && wrapper.contains(to)) return;

      lastPointer.current = null;
      const back = focused.current;
      if (back >= 0) {
        const el = rowAt(back);
        if (el) {
          shown.current = back;
          showRow(flat[back], el);
          return;
        }
      }
      shown.current = -1;
      scheduleHide();
    };

    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerout", onPointerOut);
    return () => {
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerout", onPointerOut);
    };
  }, [cancelHide, flat, rowAt, scheduleHide, showRow, wrapperRef]);

  /* A resize invalidates the side the panel chose and the clamp it was placed
     under, and re-deriving both from a pointer that may no longer be over
     anything is guesswork. Dropping it is the honest move: the next pointer
     move or arrow press re-anchors it correctly, and a resize is not a moment
     anyone is reading a preview. */
  useEffect(() => {
    const onResize = () => {
      shown.current = -1;
      hide();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hide]);

  /* Where each group starts in the flat index, so a row can be told its
     position without the render walking a counter across groups. */
  const groupStart = useMemo(
    () =>
      groups.map((_, i) =>
        groups.slice(0, i).reduce((count, group) => count + group.items.length, 0),
      ),
    [groups],
  );

  return (
    /* The positioned ancestor the panel anchors inside: one wrapper around
       every group rather than one per group, so a selection travelling from
       the last row of Founded into the first row of Client work moves the
       existing panel instead of dismissing and reopening it. */
    <div ref={wrapperRef} className="relative" onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur}>
      {groups.map((group, i) => (
        <div key={group.title || i} className={i > 0 ? "mt-8" : undefined}>
          {/* One rung quieter than the "Work" heading above it, and at
              regular weight where that one is medium. Two tonal steps is
              enough to read as a level down. A second heading at the same
              weight would compete with the section it lives inside, and a
              rule or an all-caps label would be louder than the distinction
              it is drawing. */}
          {group.title && (
            <h3 className="text-meta mb-1 px-3 text-foreground-ghost">{group.title}</h3>
          )}

          {/* Real list markup, which the flat column of anchors was not. It
              costs nothing visually and it is what makes the roving tabindex
              defensible: a screen reader announces "list, nine items" and
              then a link per row, so the one tab stop reads as a widget the
              arrows drive rather than as eight links gone missing. */}
          <ul>
            {group.items.map((item, j) => {
              const index = groupStart[i] + j;
              return (
                <li key={item.href}>
                  <Row
                    href={item.href}
                    title={item.title}
                    description={item.description}
                    logo={item.logo}
                    meta={item.meta}
                    index={index}
                    tabIndex={index === tabStop ? 0 : -1}
                    tourId={`row:${item.href}`}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <WorkPreviewLayer layerRef={layerRef}>
        {(item) => (
          <WorkPreviewCard>
            {item.preview ? (
              /* Fixed aspect box, `fill` and `object-cover` rather than the
                 image's own ratio: the panel has to be the same size on every
                 row or it isn't one object travelling, and a hero that is
                 taller than the last one would resize the card mid-slide.
                 `surface-recessed` behind it gives the blur placeholder
                 something to resolve out of, so a first show doesn't flash
                 the panel's own white. */
              <div className="bg-surface-recessed relative aspect-video w-full overflow-hidden rounded-md">
                <Image
                  src={item.preview}
                  alt=""
                  fill
                  placeholder="blur"
                  sizes="272px"
                  className="object-cover"
                />
              </div>
            ) : (
              /* No hero yet for this case study. The panel still opens rather
                 than the row going quietly dead. An affordance that works on
                 eight rows and silently does nothing on the ninth is worse
                 than one that always answers. Set to the same aspect as a
                 real one so the empty case doesn't resize the card either. */
              <div className="bg-surface-recessed text-meta flex aspect-video w-full items-center justify-center rounded-md text-foreground-faint">
                No preview yet
              </div>
            )}

            {/* One line, clamped. A role that wrapped to two would make the
                card taller than the card beside it, which is the resize this
                whole shape exists to prevent. */}
            <p className="text-meta line-clamp-1 px-1 pt-2 pb-1 text-foreground-subtle">
              {item.role ?? " "}
            </p>
          </WorkPreviewCard>
        )}
      </WorkPreviewLayer>
    </div>
  );
}
