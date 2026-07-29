# Icons

One library, one meaning per glyph, weight as a function of size.

Source: **Hugeicons**, Stroke Rounded (the free tier). Geometry is vendored into
`src/components/icon/glyphs.ts` rather than installed; see the header comment
there for why, and for the `npm pack` recipe that pulls a new master.

## Using one

```tsx
import { Icon, iconGap } from "@/components/icon/Icon";

<span className={`flex items-center ${iconGap("inline")}`}>
  Instatus
  <Icon name="external" />
</span>;
```

`name` is a **meaning**, not a shape. There is no `arrow-up-right`; there is
`external`. That is the whole anti-collision device: you cannot reach for a
drawing, only for an action, so reusing a drawing for a second action requires
adding a second named entry and arguing for it in review.

## The size system

| Token     |  px | Rendered stroke | Label gap | Where                                         |
| --------- | --: | --------------: | --------- | --------------------------------------------- |
| `micro`   |  12 |          1.10px | 6px       | Beside 11–13px meta text                      |
| `inline`  |  14 |          1.20px | 6px       | Beside 15–17px body copy (**default**)        |
| `control` |  16 |          1.30px | 8px       | Inside a button or disclosure                 |
| `nav`     |  20 |          1.40px | 8px       | Standalone in navigation, no label            |
| `feature` |  24 |          1.50px | 10px      | Carrying meaning alone at the head of a block |

Two things that table is doing:

**Stroke is specified in rendered pixels, not grid units.** Hugeicons draws at
1.5 on a 24 grid. Scale that master to 12px and the stroke lands at 0.75px, under
one device pixel, so it renders grey and soft. `Icon.tsx` counter-scales
(`grid units = stroke × grid / px`), so the number in the table is what reaches
the screen. Small icons are therefore _proportionally heavier_ than the master;
that is the correction, not a mistake.

**The targets are set against Inter, not in the abstract.** Inter Regular's stem
is roughly 1.2px at 17px, Medium's roughly 1.4px. An icon beside body copy at
1.2–1.3px reads as the same instrument; the same icon at 0.75px reads as a
different product. That is the unified-weight constraint, and it is why the
curve rises with size but sub-linearly.

## Per-size masters

A glyph may declare a `small` master drawn on a 16 grid, used at render sizes
of 16px and below. It is a **re-cut drawing**, not a scaled one: fewer and
coarser decisions, vertices placed on whole grid units so a 16px render lands
every one of them on a device pixel.

`disclosure` is the clearest case: its small master is `M4 6L8 10L12 6`, all
integers, so both diagonals stay clean at 16px where the 24-grid curve would
soften. `external` keeps Hugeicons' curved arrowhead in its small master rather
than falling back to a generic straight arrow, so 14px and 24px still read as
the same drawing.

Where scaling holds up, omit `small`. Not every glyph earns a second cut.

## Optical centring

`nudge: [x, y]` translates a master in grid units before render. It exists
because the centre of a bounding box is not where the eye puts the centre.

`back` is a left-pointing chevron: its two strokes converge at the tip, so the
ink centroid sits left of the box centre and the glyph reads as hanging left
until it moves right (+0.25 on the 24 grid, +0.17 on the 16). This is the same
correction a play triangle needs.

Only apply a nudge you can state a reason for. `external` and `disclosure` have
none. Their masters are already centred, and an unexplained nudge is just an
error with a comment on it.

## Contextual swap

Not available. The free Hugeicons tier is Stroke Rounded only; there are no
filled counterparts, so outline → filled cannot signal active or selected.

State is signalled with **colour and stroke weight** instead, which suits the
quiet-tonal language better than a filled glyph would. If a real toggle appears
and needs a fill, the solid counterpart gets hand-drawn on the same 24 grid so
the silhouettes match, not pulled from a second library. Mixing two icon
libraries, even similar ones, produces mismatches that compound.

## Accessibility

Icons are decorative by default: `aria-hidden`, out of the accessibility tree.
Every icon on this site repeats something the adjacent text already says, and
the arrow after "Instatus" adds nothing a screen reader needs.

Pass `label` only when the icon is the sole carrier of the meaning. It switches
the element to `role="img"` with an accessible name.

## Adding a glyph

1. Confirm the meaning isn't already served. If it is, use that entry.
2. Confirm the metaphor still holds for someone who has never used a
   floppy-disk drive or a physical mail tray. Metaphor accuracy decays; it is
   worth re-auditing as the audience ages.
3. Pull the master:
   `npm pack @hugeicons/core-free-icons@<version> && tar xzf *.tgz && cat package/dist/esm/<Name>Icon.js`
4. Copy the `d` values into `GLYPHS`. Drop `stroke`, `strokeWidth`,
   `strokeLinecap`, `strokeLinejoin`. `Icon.tsx` owns all four.
5. Record the upstream `source` name so the master stays diffable.
6. Check the bounding box against the grid centre. Nudge if it's off and you
   can say why.
7. Render it at 12 and at 24. If the small size mushes, cut a `small` master.

A dev-only check in `glyphs.ts` logs an error if two names end up sharing the
same path data: the collision the registry's naming is meant to prevent, caught
for the case where naming alone doesn't.
