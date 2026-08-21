"use client";

/* ── The tour's one lazy entry point ──────────────────────────────────────
   Everything the tour defers is re-exported from here, and every `dynamic()`
   in the tour points at this module rather than at the file it wants.

   The reason is that Turbopack will not share a module between two separate
   `dynamic()` chunk groups. The invite and the engine both reach `motion`,
   so as two groups they were emitted as two chunks carrying a full private
   copy each: 144KB of the same library, twice, on the one visit that pulls
   both. Pointing them at a single module makes them a single group, and the
   copy goes back to being a copy.

   TourInvite.tsx already used this trick for its own two exports, which is
   where the idea comes from. This is the same move one level up.

   Both halves are gated to a first visit, so the merge does not make anyone
   fetch something they were not already going to fetch: the warm timer and
   the invite timer fire on the same load or neither does. What changes is
   that the second one no longer costs a request.

   Nothing may import this module eagerly. It exists to be the thing on the
   far side of an `import()`, and a static import of it would pull the whole
   tour back onto the critical path, which is the cost the split was paying
   to avoid. */

export { TourKnock, TourInviteLabel } from "@/components/tour/TourInvite";
export { TourEngine } from "@/components/tour/TourEngine";
