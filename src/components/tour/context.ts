"use client";

import { createContext, useContext, type RefObject } from "react";

/* The context lives in its own file, apart from both the shell that mounts it
   and the engine that fills it in, for one reason: TourProvider needs to
   `dynamic()` the engine, and the engine needs the same context object the
   shell hands out before it arrives. If either of those two modules owned the
   context, importing it from the other would be an import cycle, and the
   half-initialised module you get out of one of those is a `createContext`
   that evaluates to undefined at exactly the wrong moment. A third module
   with no dependencies of its own cannot be the one that loses that race. */

export type TourStatus = "idle" | "playing" | "yielded";

export type TourValue = {
  status: TourStatus;
  start: () => void;
  stop: () => void;
  resume: () => void;
  /* "I might be about to ask for the tour." Fetches the engine chunk without
     playing anything, so the pointer resting on the O or the palette coming
     open is enough for `start()` to be instant afterwards. Idempotent, and a
     no-op once the engine is mounted. */
  warm: () => void;
  /* The O in the h1 registers itself here so the bubble knows where to bloom
     from and where to go home to. Null anywhere that heading is not rendered,
     which the bubble reads as "fade in place". */
  anchorRef: RefObject<HTMLElement | null>;
};

export const TourContext = createContext<TourValue | null>(null);

export function useTour() {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour must be used inside <TourProvider>");
  return value;
}
