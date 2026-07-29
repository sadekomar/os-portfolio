#!/usr/bin/env python3
"""Cuts the brand marks out of the site's own Inter face and prints them as
SVG path data for src/components/brand/marks.tsx.

The wordmark is not a drawing. It is the name set in the typeface the whole
site is set in, at the display step of the type scale, with the tracking that
step already carries, outlined so the asset stops depending on the reader
having Inter. Hand-lettering it would have produced a second voice on a site
whose argument is that it only has one.

Run:
    python3 -m venv .venv && .venv/bin/pip install fonttools brotli
    .venv/bin/python scripts/build-brand-marks.py

Then paste the two printed paths into src/components/brand/marks.tsx. This is
deliberately a build-time step and not a runtime dependency: the output is
four lines of geometry that change only when the brand does, and vendoring it
keeps the marks diffable in review, the same argument icon/glyphs.ts makes
about its Hugeicons masters.
"""

import glob
import sys

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

# next/font/google emits Inter's subsets under content-hashed names, so the
# latin one is found by asking which file can actually set the name rather
# than by hard-coding a hash that changes on every font revision.
FONT_GLOB = ".next/static/media/*.woff2"

# Both marks are set at the display step's optical size. `wght` differs: the
# wordmark sits at 500, matching the nav's `font-medium`, so the mark and the
# live name in the header are the same weight. The monogram runs one step
# heavier: at 16px in a menu row, 500 goes thin and grey against the label
# beside it, which is the same counter-scaling argument ICON_SIZES makes.
WORDMARK = {"text": "Omar Sadek", "wght": 500, "tracking": -0.028}
MONOGRAM = {"text": "OS", "wght": 600, "tracking": -0.05}


def load_latin_inter():
    for path in glob.glob(FONT_GLOB):
        try:
            font = TTFont(path, lazy=False)
        except Exception:
            continue
        if not font["name"].getDebugName(4).startswith("Inter"):
            continue
        if "fvar" not in font:
            continue
        cmap = font.getBestCmap()
        if all(ord(c) in cmap for c in "OmarSdek "):
            return path, font
    sys.exit(
        "No latin Inter subset in .next/static/media. Run `pnpm build` (or "
        "`pnpm dev` and load a page) so next/font materialises the woff2 first."
    )


def outline(font, text, tracking):
    """Returns (path_d, ink_bounds) with y already flipped into SVG's
    downward axis, both in font units."""
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    upem = font["head"].unitsPerEm
    kern = kern_table(font)

    path = SVGPathPen(glyph_set, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
    bounds = BoundsPen(glyph_set)
    x = 0.0
    prev = None

    for ch in text:
        name = cmap[ord(ch)]
        if prev is not None:
            x += kern.get((prev, name), 0)
        # Space contributes advance and no contour, so it falls through the
        # draw and only moves the pen. Both pens see the same transform so
        # the box and the path can't drift apart.
        for pen in (path, bounds):
            glyph_set[name].draw(TransformPen(pen, (1, 0, 0, -1, x, 0)))
        x += glyph_set[name].width + tracking * upem
        prev = name

    return path.getCommands(), bounds.bounds


def kern_table(font):
    """Flattens GPOS pair kerning to a {(left, right): value} lookup.

    Only format-1 explicit pairs are read. Inter's latin kerning is class-based
    (format 2) as well, so this is a floor rather than the full picture; the
    marks are two and ten glyphs long, so anything it misses is visible and
    can be corrected by hand in the printed output.
    """
    pairs = {}
    if "GPOS" not in font:
        return pairs
    for lookup in font["GPOS"].table.LookupList.Lookup:
        if lookup.LookupType != 2:
            continue
        for sub in lookup.SubTable:
            if getattr(sub, "Format", None) != 1:
                continue
            for left, pair_set in zip(sub.Coverage.glyphs, sub.PairSet):
                for record in pair_set.PairValueRecord:
                    value = getattr(record.Value1, "XAdvance", 0)
                    if value:
                        pairs[(left, record.SecondGlyph)] = value
    return pairs


def emit(label, font_path, spec):
    font = TTFont(font_path)
    instantiateVariableFont(font, {"wght": spec["wght"], "opsz": 32}, inplace=True)

    d, (x_min, y_min, x_max, y_max) = outline(font, spec["text"], spec["tracking"])

    # The box is the ink, not the font's line box. Trimming here rather than
    # at the call site is what lets a mark be dropped into a row and aligned
    # like any other object: its edges are its own, so nothing downstream has
    # to know that Inter reserves space above the ascender or below the
    # baseline that these particular letters never use. The viewBox carries
    # the offset, so the path data stays exactly as the font drew it.
    print(f"\n/* {label}, Inter {spec['wght']}, opsz 32, tracking {spec['tracking']}em */")
    print(f'viewBox="{x_min:.0f} {y_min:.0f} {x_max - x_min:.0f} {y_max - y_min:.0f}"')
    print(f"/* aspect {(x_max - x_min) / (y_max - y_min):.3f} */")
    print(f'd="{d}"')


def main():
    path, _ = load_latin_inter()
    print(f"/* cut from {path} */")
    emit("LOGOTYPE", path, WORDMARK)
    emit("LOGOMARK", path, MONOGRAM)


if __name__ == "__main__":
    main()
