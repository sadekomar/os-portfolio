import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { LOGOMARK } from "@/components/brand/marks";

/* ── The share card ───────────────────────────────────────────────────────
   More people will see this site as a 300px-wide rectangle in iMessage or
   Slack than will ever open it, so the unfurl is not a decoration on the
   page; for most of the audience it *is* the page. That argues for the
   same restraint the site itself is built on rather than against it: the
   card is type on a tonal ground, in the site's own face and its own
   palette, and it says the name of the thing and one line about what the
   thing is. No gradient, no glow, no 3D slab, no screenshot cropped
   through the middle of a UI.

   One template, four callers. Every route hands this function content and
   nothing else. The geometry, the palette, the type ramp and the fonts
   are decided once, here, so a fifth route cannot arrive with its own
   idea of what a card looks like. See docs/north-stars.md.

   ── The frame ────────────────────────────────────────────────────────────
   The card is the site's nesting rule at 1200×630: a `sunken` grey ground
   holding one `raised` white sheet, inset by a gutter, separated by
   nothing but the tonal step between them. That is the same relationship
   every container on the site has with its children, and it is why the
   card reads as this site rather than as a generic OG template. There is
   no border and no shadow anywhere in it, exactly as there is none
   anywhere on the site.

   The grey margin also does real work at unfurl scale: iMessage and Slack
   round and crop the image against their own bubble, and 20px of ground
   means the crop eats ground rather than eating the title. */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/* Literal hex, not the `--surface-*` / `--foreground-*` tokens: satori
   resolves no cascade and no custom properties. These are the light-theme
   values read out of globals.css, since a share card has no dark mode to answer
   to, because every platform composites it against its own chrome and none
   of them tell us which one. */
const SUNKEN = "#f0f0f0"; /* --surface-sunken  0 0% 94.1% */
const RAISED = "#ffffff"; /* --surface-raised  0 0% 100%  */
const FOREGROUND = "#18181b"; /* --foreground        240 6% 10% */
const SUBTLE = "#71717a"; /* --foreground-subtle 240 4% 46% */
const FAINT = "#a1a1aa"; /* --foreground-faint  240 5% 65% */

const FONT_DIR = path.join(process.cwd(), "src", "app", "fonts");
const MARK_DIR = path.join(process.cwd(), "src", "components", "logo", "marks");

/* Inter, as static TTF instances rather than the variable woff2 next/font
   serves the browser. Satori takes a font as bytes and does its own
   shaping, so it needs a format it can parse (woff2 is not one) and a
   fixed instance per weight (it does not interpolate a variable axis).

   Both files are vendored in src/app/fonts rather than fetched from
   fonts.gstatic.com at build time, which is the pattern most next/og
   examples reach for. A build-time fetch makes `pnpm build` depend on a
   third-party host being up, and the failure mode is a broken deploy for
   the sake of a share image. 130KB in-tree, resolved from disk, cannot
   fail that way.

   400 and 500 only, because the card sets only two weights. The site's
   headings are 500, not 600 or 700, because the type ramp does hierarchy with
   size and colour, and the card inherits that rather than shouting. */
let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 500; style: "normal" }[]>;

function ogFonts() {
  fontsPromise ??= Promise.all([
    readFile(path.join(FONT_DIR, "Inter-Regular.ttf")),
    readFile(path.join(FONT_DIR, "Inter-Medium.ttf")),
  ]).then(([regular, medium]) => [
    { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: medium, weight: 500 as const, style: "normal" as const },
  ]);

  return fontsPromise;
}

/* ── Marks ────────────────────────────────────────────────────────────────
   The brand marks are read off disk and inlined as data URIs. They cannot
   come through the `import mark from "./mark.svg"` path the site uses,
   because that yields a `/_next/static/...` URL and satori has no origin
   to resolve it against; it fetches absolute URLs or nothing.

   Intrinsic dimensions are parsed rather than assumed: satori will not lay
   out an image it can't measure, and these files disagree about their
   natural size by an order of magnitude (Instatus ships a 29×25 SVG, TNN a
   512px PNG). Parsing keeps every mark on the same cap-height-equivalent
   box with its own aspect intact, which is the same rule the 20px marks in
   the Work list follow. */
type MarkFile = { file: string; field?: boolean };

/* Keyed by the `MarkName` in components/logo/marks.ts. `field` repeats that
   file's flag for the one mark whose artwork *is* its tile: Argotemp's
   monogram is white on blue, so it needs its corners clipped rather than
   floating on white. */
const MARK_FILES: Record<string, MarkFile> = {
  instatus: { file: "instatus.svg" },
  wholana: { file: "wholana.svg" },
  tnn: { file: "tnn.png" },
  loom: { file: "loom.png" },
  argonaut: { file: "argonaut.svg" },
  argotemp: { file: "argotemp.png", field: true },
  alunaut: { file: "alunaut.png", field: true },
  "little-lads": { file: "little-lads.png", field: true },
  unitar: { file: "unitar.png" },
  dell: { file: "dell.svg" },
};

const MARK_HEIGHT = 56;

type ResolvedMark = { src: string; width: number; height: number; field: boolean };

const markCache = new Map<string, ResolvedMark | null>();

function intrinsicSize(file: string, bytes: Buffer): { width: number; height: number } | null {
  if (file.endsWith(".png")) {
    /* IHDR is the first chunk of every PNG and its position is fixed by the
       spec: 8 bytes of signature, 8 of chunk header, then width and height
       as big-endian uint32s. */
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  const source = bytes.toString("utf8");
  const viewBox = source.match(/viewBox=["']\s*[-\d.]+[ ,]+[-\d.]+[ ,]+([\d.]+)[ ,]+([\d.]+)/);
  if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) };

  const width = source.match(/\bwidth=["']([\d.]+)/);
  const height = source.match(/\bheight=["']([\d.]+)/);
  if (width && height) return { width: Number(width[1]), height: Number(height[1]) };

  return null;
}

async function loadMark(name: string): Promise<ResolvedMark | null> {
  if (markCache.has(name)) return markCache.get(name) ?? null;

  const entry = MARK_FILES[name];
  let resolved: ResolvedMark | null = null;

  if (entry) {
    const bytes = await readFile(path.join(MARK_DIR, entry.file));
    const size = intrinsicSize(entry.file, bytes);

    if (size) {
      const mime = entry.file.endsWith(".png") ? "image/png" : "image/svg+xml";
      resolved = {
        src: `data:${mime};base64,${bytes.toString("base64")}`,
        /* Height-driven, width follows from the aspect, the same rule
           components/brand/marks.tsx states for the wordmark. Two marks of
           different proportions then agree on their letter size rather than
           on their bounding boxes. */
        width: Math.round(MARK_HEIGHT * (size.width / size.height)),
        height: MARK_HEIGHT,
        field: entry.field ?? false,
      };
    }
  }

  markCache.set(name, resolved);
  return resolved;
}

/* The site's own monogram, as outlined geometry rather than live text. It
   is already vendored as a path in components/brand/marks.tsx, cut from
   the very woff2 next/font serves, so the card gets the real letterforms
   with no second font to load and no risk of satori resolving "OS" to a
   fallback face. */
function Logomark() {
  return (
    <svg
      width={Math.round(MARK_HEIGHT * LOGOMARK.aspect)}
      height={MARK_HEIGHT}
      viewBox={LOGOMARK.viewBox}
      fill="none"
    >
      <path fill={FOREGROUND} d={LOGOMARK.d} />
    </svg>
  );
}

export type OgCardProps = {
  /** The line above the title: what kind of page this is. */
  eyebrow?: string;
  title: string;
  subtitle: string;
  /** A `MarkName` from components/logo/marks.ts. Falls back to the monogram. */
  mark?: string;
};

export async function renderOgCard({ eyebrow, title, subtitle, mark }: OgCardProps) {
  const [fonts, brandMark] = await Promise.all([ogFonts(), mark ? loadMark(mark) : null]);

  /* One step down at 25 characters, which is where a title stops fitting on
     a single line at 76px inside the 1016px sheet. Two lines of 76px would
     leave the subtitle nowhere to go; 60px wraps to two comfortably. The
     threshold is measured against this measure, not guessed. "Loom Cairo
     (later Univyr)" and "UN Activity Management Platform" are the two that
     cross it. */
  const titleSize = title.length > 25 ? 60 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: SUNKEN,
          padding: 20,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: RAISED,
            /* --radius-outer is 24px on a page whose gutter is 8px. Both
               are scaled here by the ratio the card sits at relative to
               the site's own 640px column, so the corner stays visually
               the same corner rather than the same number. */
            borderRadius: 40,
            padding: 72,
          }}
        >
          <div style={{ display: "flex" }}>
            {brandMark ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandMark.src}
                width={brandMark.width}
                height={brandMark.height}
                alt=""
                style={brandMark.field ? { borderRadius: 12 } : undefined}
              />
            ) : (
              <Logomark />
            )}
          </div>

          {/* The middle band carries the whole message. Everything above and
              below it is a signature, and is sized to be read second. */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {eyebrow ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 400,
                  letterSpacing: -0.2,
                  color: FAINT,
                  marginBottom: 20,
                }}
              >
                {eyebrow}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                fontSize: titleSize,
                fontWeight: 500,
                lineHeight: 1.05,
                /* Optical tracking, negative and proportional to the size:
                   Inter's own opsz axis does this on the site, and satori
                   has no variable axes to do it with. -0.03em is the value
                   the display sizes in globals.css land on. */
                letterSpacing: titleSize * -0.03,
                color: FOREGROUND,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 400,
                lineHeight: 1.35,
                letterSpacing: -0.3,
                color: SUBTLE,
                marginTop: 22,
                /* The site's measure is 40rem against 17px type. Held to the
                   same ~65 characters here so the subtitle wraps where a
                   paragraph on the site would. */
                maxWidth: 860,
              }}
            >
              {subtitle}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 26, letterSpacing: -0.2, color: FAINT }}>
            sadekomar.com
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  );
}
