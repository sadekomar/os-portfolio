/* ── The stage ────────────────────────────────────────────────────────────
   The half of the tour that touches the DOM. Everything here is a verb the
   script can call: scroll there, point at that, rest on this row, open that.

   The governing rule, and the reason this file is as small as it is: the
   tour drives the site the way a visitor does, through the events the site
   already listens for. It never reaches into a component's state.

   The clearest case is `hover`. WorkRows subscribes to a native `pointermove`
   on its container and reads `event.target` plus `clientX/clientY` off it
   (see the note at components/index/WorkPreview.tsx). So resting on a row is
   a real PointerEvent dispatched at that row's centre, and the preview panel
   travels, leans and dismisses through exactly the code a mouse would have
   run. There is no second implementation of the hover preview to keep in
   sync, and no way for the tour to demonstrate behaviour the site does not
   actually have. If a row stops previewing, the tour stops previewing.

   Two things are honest exceptions, both because the real thing would be
   worse:

     Navigation is `router.push`, not a synthetic click on the anchor. A
     dispatched click on a Next <Link> works, but it goes through the
     browser's own activation path and a mistimed one during a tour is a full
     page load, which would tear the bubble out of the DOM mid-sentence.

     Hover state is mirrored onto `data-tour-hover` because a synthetic
     pointermove moves no real cursor, so CSS `:hover` never matches. The
     rule that reads it lives beside the real one in globals.css. */

import type { CursorHandle } from "@/components/tour/TourCursor";

/* How long to wait for an element that a route change is still fetching.
   Past this the cue is dropped rather than fired late: a cue that lands two
   seconds after the sentence it illustrates is worse than one that never
   lands, because the reader spends those two seconds wondering what they
   missed. */
const READY_TIMEOUT_MS = 2500;

/* Ceiling on a settle wait. Smooth scroll duration belongs to the browser
   and to the reader's OS settings, so it can only be observed, never known. */
const SETTLE_TIMEOUT_MS = 1400;

export type TourStage = {
  /* Client-side navigation, then a wait for the new route to paint. */
  goto: (href: string) => Promise<void>;
  scrollTo: (selector: string, block?: ScrollLogicalPosition) => Promise<void>;
  scrollBy: (dy: number) => Promise<void>;
  scrollTop: () => Promise<void>;
  /* Glide the cursor onto a target without asserting anything about it. */
  point: (selector: string) => Promise<HTMLElement | null>;
  /* Point, then rest there: the row lights up and its preview opens. */
  hover: (selector: string) => Promise<void>;
  /* Let go of whatever is currently held. */
  release: () => void;
  /* The cursor dips, the target dips with it. A press that goes nowhere. */
  press: (selector: string) => Promise<void>;
  /* Press, then actually activate it. Internal hrefs route, buttons click. */
  activate: (selector: string) => Promise<void>;
  /* Nudge a horizontal scroller, for the case-study strip. */
  drag: (selector: string, dx: number) => Promise<void>;
  /* Two nudges in opposite proportions, which is what a thrown scroller looks
     like next to `drag`'s single push: for showing that a strip of screens is
     a strip rather than a picture. */
  flick: (selector: string, dx: number) => Promise<void>;
  /* Sweep the cursor along a phrase, the way a finger underlines it. The
     second argument is the words themselves, not a selector: see `rectFor`. */
  trace: (selector: string, text?: string) => Promise<void>;
  /* Loop the cursor once around something, for a figure the voice is naming
     that has no affordance to point at. */
  circle: (selector: string, text?: string) => Promise<void>;
  /* Focus an element and press a key on it, for demonstrating the Work
     list's roving tabindex. */
  key: (selector: string, key: string, times?: number) => Promise<void>;
  /* The same press with no element behind it, for the handlers bound to the
     window rather than to a list: the case studies' J/K pager. */
  hotkey: (key: string, times?: number) => Promise<void>;
  reduced: boolean;
};

/* Stamped on every event the tour dispatches. The engine watches keydown to
   decide the reader has taken over, and a tour that presses ArrowDown to show
   off the keyboard list would otherwise read its own keystroke as a takeover
   and stop itself mid-demonstration. A property on the event rather than a
   flag on a module: the flag version has a window between dispatch and
   handler in which a real keypress is misread as the tour's. */
export const SYNTHETIC = "__tour" as const;

function mark<E extends Event>(event: E): E {
  Object.defineProperty(event, SYNTHETIC, { value: true });
  return event;
}

export function isSynthetic(event: Event) {
  return SYNTHETIC in event;
}

/* Marks every element the tour is currently asserting something about, so
   that abandoning the tour halfway can put the page back exactly as it found
   it without tracking each one individually. */
const HOVER_ATTR = "data-tour-hover";
const PRESS_ATTR = "data-tour-press";

export function clearStageMarks() {
  for (const attr of [HOVER_ATTR, PRESS_ATTR]) {
    for (const node of document.querySelectorAll<HTMLElement>(`[${attr}]`)) {
      node.removeAttribute(attr);
    }
  }
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(done, ms);
    function done() {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    }
    signal.addEventListener("abort", done, { once: true });
  });
}

/* Resolves as soon as the selector matches, which after a route change may
   be several frames out. A MutationObserver rather than a poll because the
   thing being waited for is precisely a mutation, and an interval would add
   up to half its own period of latency to a cue that is trying to be on the
   beat of a spoken sentence. */
function elementReady(selector: string, signal: AbortSignal) {
  return new Promise<HTMLElement | null>((resolve) => {
    const found = document.querySelector<HTMLElement>(selector);
    if (found) return resolve(found);

    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) settle(el);
    });
    const timer = window.setTimeout(() => settle(null), READY_TIMEOUT_MS);

    function settle(el: HTMLElement | null) {
      observer.disconnect();
      window.clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      resolve(el);
    }
    function onAbort() {
      settle(null);
    }

    signal.addEventListener("abort", onAbort, { once: true });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

/* Waits for the page to stop moving. Three consecutive frames at an
   unchanged offset is the cheapest reliable "it has arrived": `scrollend`
   is still missing in Safari, and a fixed delay would either cut a long
   smooth scroll short or hold every short one for nothing. */
function scrollSettled(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    let last = window.scrollY;
    let still = 0;
    const deadline = performance.now() + SETTLE_TIMEOUT_MS;

    const step = () => {
      if (signal.aborted) return resolve();
      const now = window.scrollY;
      still = Math.abs(now - last) < 0.5 ? still + 1 : 0;
      last = now;
      if (still >= 3 || performance.now() > deadline) return resolve();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ── Keeping the target out from under the bubble ─────────────────────────
   The bubble, its caption and its controls occupy the bottom-left corner. On
   a 1440px desktop that corner is empty margin and none of this matters: the
   text column is centred and the two never meet. On a phone they do, and the
   first version of this pointed at the Loom Cairo row while sitting directly
   on top of it, which is the tour narrating something the reader cannot see.

   So before the tour asserts anything about an element, the element is moved
   into a band that is clear of both the nav and the bubble. Aiming at 38% of
   the viewport rather than centring: a row and its preview panel read as one
   object, and the panel hangs *below* the row, so a centred row puts its own
   preview into the bottom half this exists to keep clear. */
const NAV_SAFE = 88;
const AIM_RATIO = 0.38;

/* The bubble's own footprint, generously. Restated here rather than imported
   from TourBubble because the two are answering different questions (that
   file asks how big to draw it, this one asks what it is covering) and a
   shared constant would make one of them wrong the day the caption wraps to
   three lines. Overshooting is free; undershooting is the bug above. */
function bubbleZone() {
  const small = window.innerWidth < 640;
  return {
    right: (small ? 16 : 24) + (small ? 96 : 128) + 24,
    top: window.innerHeight - (small ? 300 : 340),
  };
}

/* The point on a row the cursor aims for, and it is deliberately not the
   geometric centre. A Work row is the full 640px column, and a cursor parked
   in the middle of that dead space reads as pointing at nothing. Sixty px in
   from the left edge is on the mark and the title, which is what the sentence
   is actually about. Vertically centred, because the row is short enough that
   the centre is unambiguous. */
function aimPoint(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + Math.min(rect.width * 0.5, 60),
    y: rect.top + rect.height / 2,
  };
}

/* ── Pointing at words ────────────────────────────────────────────────────
   `trace` and `circle` are aimed at a phrase inside a sentence: "10M+
   visits", the three customer names, a figure in the outcome row. None of
   those is an element, and the obvious fix is to make them one, by wrapping
   every phrase the tour wants in a span with a hook on it.

   That fix is worse than this function. It puts the tour's choreography into
   the site's editorial copy, where the next person to reword a description
   silently breaks a cue, and it makes the prose a worse thing to read in the
   source for the benefit of a forty-second video. A Range over the text node
   asks the browser the same question the reader's eye is asking, needs no
   markup at all, and degrades the way every other selector here degrades: the
   words are gone, the rect is null, the cue is skipped.

   Single text node only. A phrase split by a <strong> or a link mid-way
   through returns nothing rather than the wrong box, which is the correct
   failure: the cue drops and the tour carries on. */
function rectFor(el: HTMLElement, text?: string): DOMRect | null {
  if (!text) {
    /* The union of the children rather than the element's own box, when it
       has element children. A block-level container is as wide as the column
       whatever is in it, and the case study's outcome row is the case that
       showed why that matters: three figures ending 165px short of a 640px
       <dl>, so a loop around the box spent its whole right-hand arc in empty
       margin, pointing at nothing on the one gesture whose entire meaning is
       "these". The union stops at the last figure.

       Falls back to the element for a leaf, which is every other caller. */
    const kids = Array.from(el.children) as HTMLElement[];
    const boxes = kids.map((kid) => kid.getBoundingClientRect()).filter((r) => r.width > 0);
    if (boxes.length > 0) {
      const left = Math.min(...boxes.map((r) => r.left));
      const top = Math.min(...boxes.map((r) => r.top));
      const right = Math.max(...boxes.map((r) => r.right));
      const bottom = Math.max(...boxes.map((r) => r.bottom));
      return new DOMRect(left, top, right - left, bottom - top);
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 ? rect : null;
  }

  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const index = node.textContent?.indexOf(text) ?? -1;
    if (index >= 0) {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + text.length);
      const rect = range.getBoundingClientRect();
      return rect.width > 0 ? rect : null;
    }
    node = walker.nextNode();
  }
  return null;
}

/* How long a sweep or a loop takes. Tied to the size of the thing rather than
   fixed, for the same reason `travelMs` in TourCursor is tied to distance: the
   cursor is being read, and a long phrase and a short one cannot take the same
   time without one of them being wrong. */
const TRACE_MS_PER_PX = 1.1;
const TRACE_MIN_MS = 220;
const TRACE_MAX_MS = 900;

const paceFor = (length: number) =>
  Math.min(TRACE_MAX_MS, Math.max(TRACE_MIN_MS, length * TRACE_MS_PER_PX));

function pointerEvent(type: string, x: number, y: number, extra: PointerEventInit = {}) {
  return mark(
    new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: x,
    clientY: y,
    /* "mouse", not "pen" or "touch": WorkRows drops touch pointers on
       purpose (a tap is on its way to a navigation, not resting on a row),
       and the tour is imitating a reader with a mouse. */
    pointerType: "mouse",
      pointerId: 1,
      isPrimary: true,
      ...extra,
    }),
  );
}

export function createStage({
  cursor,
  push,
  reduced,
  signal,
}: {
  cursor: () => CursorHandle | null;
  push: (href: string) => void;
  reduced: boolean;
  signal: AbortSignal;
}): TourStage {
  /* The element currently being hovered, so that moving to the next one can
     send the `pointerout` the previous one is owed. Left un-sent, WorkRows
     would keep the old row's panel armed and the two selections would fight. */
  let held: HTMLElement | null = null;

  const scrollSmooth = async (dy: number) => {
    if (Math.abs(dy) < 2) return;
    window.scrollBy({ top: dy, behavior: reduced ? "auto" : "smooth" });
    if (!reduced) await scrollSettled(signal);
  };

  /* A no-op whenever the target is already somewhere the reader can see it,
     which on desktop is nearly always. It only earns its keep on a narrow
     viewport, and on the last rows of a list. */
  const ensureVisible = async (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const zone = bubbleZone();
    const overlapsBubble = rect.left < zone.right && rect.bottom > zone.top;

    const floor = overlapsBubble ? zone.top : window.innerHeight;
    if (rect.top >= NAV_SAFE && rect.bottom <= floor) return;

    await scrollSmooth(rect.top - window.innerHeight * AIM_RATIO);
  };

  const moveCursor = async (el: HTMLElement) => {
    const { x, y } = aimPoint(el);
    await cursor()?.moveTo(x, y);
    return { x, y };
  };

  const release = () => {
    if (!held) return;
    const { x, y } = aimPoint(held);
    held.removeAttribute(HOVER_ATTR);
    /* relatedTarget null is "the pointer left for somewhere outside", which
       is what makes WorkRows schedule its dismissal rather than treat this
       as a move within the list. */
    held.dispatchEvent(pointerEvent("pointerout", x, y, { relatedTarget: null }));
    held = null;
  };

  const resolve = async (selector: string) => {
    const el = await elementReady(selector, signal);
    return signal.aborted ? null : el;
  };

  const scrollToEl = async (el: HTMLElement, block: ScrollLogicalPosition) => {
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block });
    if (reduced) return;
    await scrollSettled(signal);
  };

  return {
    reduced,
    release,

    async goto(href) {
      release();
      push(href);
      /* Next scrolls the new route to the top itself. Waiting for that to
         happen before the next cue tries to scroll somewhere means the two
         are not competing for the same scroll position. */
      await sleep(reduced ? 60 : 260, signal);
    },

    async scrollTo(selector, block = "start") {
      const el = await resolve(selector);
      if (!el) return;
      await scrollToEl(el, block);
    },

    async scrollBy(dy) {
      await scrollSmooth(dy);
    },

    async scrollTop() {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      if (!reduced) await scrollSettled(signal);
    },

    async point(selector) {
      const el = await resolve(selector);
      if (!el) return null;
      await ensureVisible(el);
      await moveCursor(el);
      return el;
    },

    async hover(selector) {
      const el = await resolve(selector);
      if (!el) return;
      await ensureVisible(el);
      const { x, y } = await moveCursor(el);
      if (signal.aborted) return;

      release();
      held = el;
      el.setAttribute(HOVER_ATTR, "");
      /* `pointerover` then `pointermove`, in that order and both of them:
         the first is what a real pointer entering an element sends, the
         second is the one WorkRows actually subscribes to. Sending only the
         move works today and would break silently the day any component
         here starts listening for enter instead. */
      el.dispatchEvent(pointerEvent("pointerover", x, y));
      el.dispatchEvent(pointerEvent("pointermove", x, y));
    },

    async press(selector) {
      const el = await resolve(selector);
      if (!el) return;
      await ensureVisible(el);
      await moveCursor(el);
      if (signal.aborted) return;

      el.setAttribute(PRESS_ATTR, "");
      await cursor()?.press();
      el.removeAttribute(PRESS_ATTR);
    },

    async activate(selector) {
      const el = await resolve(selector);
      if (!el) return;
      await this.press(selector);
      if (signal.aborted) return;

      /* An anchor to somewhere on this site routes rather than clicks; see
         the note at the top. Everything else (the Resources disclosure, a
         theme switch) is a button, and a button is exactly the case where a
         real click is both safe and the only thing that works. */
      const href = el.getAttribute("href");
      if (href?.startsWith("/")) {
        release();
        push(href);
        await sleep(reduced ? 60 : 260, signal);
        return;
      }
      el.click();
    },

    async drag(selector, dx) {
      const el = await resolve(selector);
      if (!el) return;
      await ensureVisible(el);
      await moveCursor(el);
      if (signal.aborted) return;
      /* The strip is a native snap scroller, so nudging its scrollLeft is
         the same thing a trackpad flick does, snap points and all. */
      el.scrollBy({ left: dx, behavior: reduced ? "auto" : "smooth" });
      await sleep(reduced ? 0 : 420, signal);
    },

    async flick(selector, dx) {
      const el = await resolve(selector);
      if (!el) return;
      await ensureVisible(el);
      await moveCursor(el);
      if (signal.aborted) return;
      /* The long push, then a short one on its heels. A single `drag` proves
         the strip moves; the second nudge is what makes it read as a hand
         throwing it rather than as the page animating on its own, and it
         lands on a different snap point, so the reader sees two screens
         change rather than one. */
      el.scrollBy({ left: dx, behavior: reduced ? "auto" : "smooth" });
      await sleep(reduced ? 0 : 380, signal);
      if (signal.aborted) return;
      el.scrollBy({ left: Math.round(dx * 0.55), behavior: reduced ? "auto" : "smooth" });
      await sleep(reduced ? 0 : 320, signal);
    },

    async trace(selector, text) {
      const el = await resolve(selector);
      if (!el) return;
      await ensureVisible(el);
      if (signal.aborted) return;

      const rect = rectFor(el, text);
      if (!rect) return;

      /* Under the words rather than through them: a dot travelling across the
         middle of a line covers the thing it is drawing attention to, which
         is the one job it has. Two pixels below the box is where a hand would
         hold a pen. */
      const y = rect.bottom + 2;
      await cursor()?.moveTo(rect.left, y);
      if (signal.aborted) return;
      await cursor()?.glide(
        [
          { x: rect.left, y },
          { x: rect.right, y },
        ],
        paceFor(rect.width),
      );
    },

    async circle(selector, text) {
      const el = await resolve(selector);
      if (!el) return;
      await ensureVisible(el);
      if (signal.aborted) return;

      const rect = rectFor(el, text);
      if (!rect) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      /* Clear of the glyphs on both axes, and never tighter than a dot's own
         width, so a one-word figure still gets a loop rather than a wobble. */
      const rx = Math.max(24, rect.width / 2 + 16);
      const ry = Math.max(16, rect.height / 2 + 12);

      /* Sixteen points, starting and ending at the same place on the right,
         which is where the cursor is brought before the loop opens: a circle
         that starts wherever the cursor happened to be has a tail on it. */
      const STEPS = 16;
      const path = Array.from({ length: STEPS + 1 }, (_, i) => {
        const angle = (i / STEPS) * Math.PI * 2;
        return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
      });

      await cursor()?.moveTo(path[0].x, path[0].y);
      if (signal.aborted) return;
      await cursor()?.glide(path, paceFor((rx + ry) * 2));
    },

    async hotkey(key, times = 1) {
      /* No element, no cursor move and no scroll. The handler this is for is
         bound to the window (see the pager in components/sequence/Pager.tsx),
         so there is nothing to focus and nothing to point at: the press is
         the whole gesture. Dispatched on the body because a `window` target
         is not something a keydown can have. */
      release();
      for (let i = 0; i < times; i++) {
        if (signal.aborted) return;
        document.body.dispatchEvent(mark(new KeyboardEvent("keydown", { key, bubbles: true })));
        /* Longer than `key`'s beat: each of these is a route change, and two
           presses inside one navigation would be the second one landing on a
           page that is still the first one. */
        await sleep(reduced ? 0 : 640, signal);
      }
    },

    async key(selector, key, times = 1) {
      const el = await resolve(selector);
      if (!el) return;
      /* The pointer lets go first. WorkRows keeps one selection and the last
         input wins it, so leaving a hover held while pressing an arrow would
         be demonstrating the exact contention the list is built to resolve,
         with the tour on both sides of it. */
      release();
      await ensureVisible(el);
      await moveCursor(el);
      el.focus();

      for (let i = 0; i < times; i++) {
        if (signal.aborted) return;
        el.dispatchEvent(mark(new KeyboardEvent("keydown", { key, bubbles: true })));
        /* A beat between presses. Firing three arrows in one frame is a
           selection teleporting three rows, which demonstrates nothing: the
           point being made is that the panel *travels*. */
        await sleep(reduced ? 0 : 520, signal);
      }
    },
  };
}
