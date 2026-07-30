import { readFile } from "node:fs/promises";
import path from "node:path";

/* ── Reading a component's own source ─────────────────────────────────────
   The Code panel shows the file that is running in the Preview panel above
   it, and the only way to be sure of that is to read the file rather than
   keep a copy of it in the registry. A copy is a second version of the
   truth, and the moment one is edited the page starts lying about what it
   is demonstrating.

   This runs at build time, in a server component, on a route whose params
   are fully enumerated by `generateStaticParams`. So the read happens once
   per component during `next build` and never in a request, and `fs` never
   reaches the client bundle.

   Paths are joined from the slug and a filename that both come out of the
   registry, not out of a URL, and the route 404s on an unknown slug before
   this is ever called. Even so the resolved path is checked to be inside
   the showcase directory, because a traversal here would read arbitrary
   files off the build machine into a public page, and the check costs one
   comparison. */

const SHOWCASE_ROOT = path.join(process.cwd(), "src", "components", "showcase");

export type SourceFile = { name: string; code: string; language: string };

function languageOf(file: string) {
  if (file.endsWith(".css")) return "css";
  if (file.endsWith(".ts")) return "ts";
  return "tsx";
}

export async function readShowcaseSource(slug: string, files: string[]): Promise<SourceFile[]> {
  const read = files.map(async (file) => {
    const full = path.join(SHOWCASE_ROOT, slug, file);
    const rel = path.relative(SHOWCASE_ROOT, full);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new Error(`Refusing to read outside the showcase directory: ${file}`);
    }

    return {
      name: file,
      language: languageOf(file),
      /* Trailing newline trimmed so the panel doesn't open with a blank
         final row that reads as a rendering bug. */
      code: (await readFile(full, "utf8")).replace(/\s+$/, ""),
    };
  });

  return Promise.all(read);
}
