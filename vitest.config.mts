import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/* ── Tests ────────────────────────────────────────────────────────────────
   There is no jsdom here and no React Testing Library, on purpose. What is
   worth testing in this repo is not whether a component renders; the build
   already fails if it doesn't, and a snapshot of a div tells nobody
   anything. It is the handful of pure functions that silently produce a
   *wrong* answer instead of an error: a sitemap date that is quietly the
   fallback for every route, a calendar that drops a week, a meta
   description clipped mid-word. Each of those ships green and stays wrong
   until a person happens to look.

   So: node environment, no DOM, and the only files picked up are the
   colocated `*.test.ts` next to the thing they test. Adding jsdom later is
   a two-line change if a component ever earns one. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
