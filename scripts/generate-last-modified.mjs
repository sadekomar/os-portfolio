/* Writes src/data/lastModified.ts: one honest `lastmod` per sitemap URL,
   taken from the last commit that touched the files that URL is rendered
   from.

   The sitemap used to stamp `new Date()` on nearly every entry, which is
   the one lastmod value that is always a lie: it says the page changed at
   the moment the build ran, so a crawler that fetches the sitemap after
   two unrelated deploys sees twenty pages claiming to be new, refetches
   all twenty, finds them byte-identical, and learns to discount the field
   for this host entirely. A field a crawler has stopped believing is worse
   than no field, because there is no way to earn the trust back quickly.

   Git is the only record of when a page's content actually changed, and it
   is not reachable from a route module at request time, so the lookup runs
   here, at build, and lands in a checked-in TypeScript file the sitemap can
   simply import.

   Why the generated file is committed rather than produced fresh on every
   build: `git log` needs a repository, and a CI checkout may be a shallow
   clone or, on some providers, a source tarball with no `.git` at all.
   When that happens this script leaves the committed snapshot untouched
   and the build still gets real dates, just the ones from the last machine
   that had history. Nothing here is allowed to fail the build.

   Run by the `build` script, so the file is refreshed whenever the site is
   built somewhere with history. */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(repoRoot, "src", "data", "lastModified.ts");

/* The date used when a route has no git history at all: a new page, or a
   checkout with no repository. It is the day the sitemap started reporting
   real dates, which is the earliest claim that cannot be wrong in the
   direction that matters (claiming a page is newer than it is). */
const EPOCH = "2026-07-31T00:00:00.000Z";

/* Which files each URL is rendered from. Coarser than one file per page in
   the two places the repo is itself coarse:

   - Every case study lives in the single `projects.ts` module, so all ten
     /work URLs share one date. That is not a rounding error, it is the
     truth: an edit to any case study rewrites the module all ten import.
   - The component pages share a route shell and a registry, and a change
     to either really does change every rendered page, so they share that
     part of their pathspec and differ by their own component directory.

   Blog posts are absent on purpose. They already carry a publication date
   in data/posts.ts and the sitemap keeps reading it from there. */
const showcaseDir = join(repoRoot, "src", "components", "showcase");
const componentSlugs = existsSync(showcaseDir)
  ? readdirSync(showcaseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

const routes = {
  "/": [
    "src/app/page.tsx",
    "src/components/index",
    "src/components/stack",
    "src/components/contributions",
    "src/components/resume",
  ],
  "/about": ["src/app/about"],
  "/blog": ["src/app/blog/page.tsx", "src/data/posts.ts"],
  "/components": ["src/app/components/page.tsx", "src/data/components.ts"],
  /* Both halves, because a talk's copy and the page's layout change
     independently and either one is a real revision. Omitting this key while
     /talks sits in the sitemap would not error — it would silently report
     LAST_MODIFIED_FALLBACK forever, which is exactly the overstated-lastmod
     failure the sitemap's own header comment exists to prevent. */
  "/talks": ["src/app/talks", "src/data/talks.ts"],
  ...Object.fromEntries(
    componentSlugs.map((slug) => [
      `/components/${slug}`,
      [
        "src/app/components/[component]",
        "src/data/components.ts",
        `src/components/showcase/${slug}`,
      ],
    ]),
  ),
  "/work": ["src/app/work/[project]"],
};

/* `%cI` is the committer date in strict ISO 8601. Author date would be the
   wrong field: a rebased or cherry-picked commit keeps its original author
   date, so a page rewritten last week could report a lastmod from months
   ago and never be refetched. */
function lastCommitDate(pathspecs) {
  const stdout = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...pathspecs], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const iso = stdout.trim();
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/* One cheap probe, so a checkout without history is a clean no-op rather than
   twenty caught exceptions — and, more to the point, so "there is no git here"
   can be told apart from "git is here and something is broken". The bare catch
   below used to treat those as the same event, which meant an authoring bug in
   this script was indistinguishable from a shallow clone: both printed one
   warning and shipped the stale snapshot. */
function hasGitHistory() {
  try {
    execFileSync("git", ["rev-parse", "--git-dir"], { cwd: repoRoot, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const entries = [];
  for (const [route, pathspecs] of Object.entries(routes)) {
    entries.push([route, lastCommitDate(pathspecs) ?? EPOCH]);
  }

  const body = entries
    .map(([route, iso]) => `  ${JSON.stringify(route)}: ${JSON.stringify(iso)},`)
    .join("\n");

  writeFileSync(
    outFile,
    `/* Generated by scripts/generate-last-modified.mjs. Do not edit by hand:
   the next build overwrites it. Each value is the committer date of the
   last commit that touched the files the route is rendered from, so a
   page's \`lastmod\` in the sitemap moves when that page changes and stays
   put when it does not.

   Checked in deliberately. See the header of the script for why. */

/** The earliest date any route may claim, used when a route has no git
    history and by the sitemap when a key is missing from the map below. */
export const LAST_MODIFIED_FALLBACK = ${JSON.stringify(EPOCH)};

export const lastModified: Record<string, string> = {
${body}
};
`,
    "utf8",
  );

  console.log(`lastModified: wrote ${entries.length} routes to src/data/lastModified.ts`);
}

const gitAvailable = hasGitHistory();

try {
  main();
} catch (error) {
  /* With a repo present, a throw in here is a bug in this script or a broken
     git invocation — not an environment doing its best. Those must be loud.
     Swallowing them is how the map silently became eleven stale dates while
     every build reported success.

     Without a repo, the original reasoning stands and the build continues:
     the committed snapshot is still correct as of the last machine that had
     history, and a sitemap with slightly stale dates is a far smaller problem
     than a deploy that does not happen. */
  if (gitAvailable) {
    console.error(
      `lastModified: git is available but the lookup failed, which is a bug rather than a missing checkout — ${
        error instanceof Error ? (error.stack ?? error.message) : String(error)
      }`,
    );
    process.exit(1);
  }

  /* The one case that would be fatal is the snapshot being absent as well,
     because the sitemap imports it: that is a module-resolution error, not
     a stale date. So if it is missing, stub it. */
  console.warn(
    `lastModified: keeping the committed snapshot, git lookup failed (${
      error instanceof Error ? error.message : String(error)
    })`,
  );
  if (!existsSync(outFile)) {
    writeFileSync(
      outFile,
      `/* Stub written by scripts/generate-last-modified.mjs: no git history
   was reachable and no committed snapshot was present. */

export const LAST_MODIFIED_FALLBACK = ${JSON.stringify(EPOCH)};

export const lastModified: Record<string, string> = {};
`,
      "utf8",
    );
  }
}
