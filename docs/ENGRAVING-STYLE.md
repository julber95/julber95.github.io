# Engraving style guide: *An Atlas of Learned Things*

Each plate has one bespoke engraving: an inline SVG drawn **in code** at build time, in the manner of a
19th-century natural-history plate (copper engraving, stipple, hatching). The reference implementation is
`src/components/engravings/roots.astro` (Plate VII). Read it before drawing anything.

## 1. Contract

- File: `src/components/engravings/<name>.astro`, where `<name>` is the plate's `engraving` key
  (`forest`, `house`, `digits`, `beamtree`, `lymph`, `aorta`, `roots`, `atlas`).
- Props: `{ uid: string; title: string; desc: string }`. Wrap everything in
  `<Frame uid title desc numeral="…" taxon="…" keyText="…">` from `./Frame.astro`. It provides the
  `viewBox="0 0 600 450"`, the double neat-line, `<title>`/`<desc>` and the foot line.
- **Drawing area:** inside the inner frame, x 14–586 and y 14–420. Nothing below y = 424 (the foot line lives there).
- Prefix every `id` (clipPath, pattern) with `uid`, because several engravings can share a page.
- All randomness comes from `rng(seed)` in `src/lib/engrave.ts`, with a fixed seed per plate. **Never** use `Math.random()`.
- No raster images, no `<filter>`, no gradients, no `opacity` on groups, no `<foreignObject>`, no external fonts.

## 2. Colour

Only these classes (defined in `src/styles/engraving.css`):

| class | use |
|---|---|
| `.k` | ink stroke (`currentColor`), round caps and joins |
| `.fk` | ink fill: tapered burin cuts made with `taper()` |
| `.a` / `.fa` | **accent (vermilion)** stroke / fill |
| `.bg` | paper-coloured fill, to knock out what lies behind a shape (pebbles, leaves, labels) |
| `.faint` / `.mid` | stroke-opacity .45 / .7, for depth and recession only |
| `.w04 .w05 .w08 .w10 .w13 .w18` | stroke widths |
| `.lbl` | mono 8.5px UPPERCASE, soft ink: level names, scales |
| `.lbl-k` | mono 8.5px ink: callouts |
| `.lbl-a` | mono 8.5px accent: the one accent callout |
| `.lbl-i` | Fraunces italic 12px: specimen names (rare) |

**Accent rule:** vermilion marks **one idea per plate** (the fraud leaf, the rejected digits, the surviving
beam, the metastatic cluster, the inflamed infiltrate, the traced prediction), and covers ≤ 5% of the inked area.
Never decorate with it.

Both themes must work: ink is `currentColor` (dark ink on paper, cream ink in the darkroom). Never hard-code a colour.

## 3. Line weights (the engraver's three burins, plus one)

| width | role |
|---|---|
| 0.4–0.5 | hatching, stipple shading, root hairs, leader lines |
| 0.75–0.8 | secondary contours, fine structure, dimension lines |
| 1.0–1.3 | primary contours, the ground line, the frame |
| 1.8 / tapered 2–3.5 | the single main subject's heaviest strokes only |

Long straight lines are cut by hand, not ruled: use `wobble(a, b, R, amp)` with amp 0.3–0.6.
Organic forms use `smooth()` / `closed()` through jittered points, or `taper()` for strokes that thin out.

## 4. Tone: hatching and stipple, never fills

- **Hatching:** `hatch(box, angle, gap, R)` clipped to a shape with `<clipPath id={uid+'-…'}>`. Gap 2–3px
  for dark tone, 3.5–5px for mid tone. Light comes from the **upper left**, so shadows hatch at **−35° to −45°**,
  and cross-hatching (a second pass at +40°) is for the deepest shadow only.
- **Stipple:** `stipple(n, box, R, inside, density)` → `dots(points)` rendered as **one** path with class `.k` and
  `stroke-width` = dot diameter (0.8–1.4). Density gradients make form. Use stipple for anything cellular or granular
  (tissue, soil, digit pixels).
- A shape that must hide what lies behind it gets a `.bg` fill first, then its hatching, then its contour.
- Solid ink fills are allowed only for tapered strokes and dots smaller than 3px.

## 5. Labels and apparatus

- Callouts use letters `a.`, `b.`, `c.` (`.lbl-k`), with a 0.4–0.5 leader line; short names below in `.lbl`.
- Scales and measurements: dimension lines with small ticks (0.5), numbers in `.lbl`.
- Keep text sparse: about **6 callouts** per plate, plus the frame foot. When the words *are* the subject (the beam-search tree,
  the digit tray's scores, a dimensioned drawing), more labels are fine, but keep each one short and legible.
- Numbers must be real facts from the plate's content file. Illustrative values (a D(x) score, a log-probability) are
  allowed only when the plate's `figCaption` says they are illustrative.
- Labels are hidden automatically when a plate renders narrower than 520px (cards, phones), so nothing may depend on them.
- `keyText` (bottom right of the frame) explains the lettering or the accent in under 45 characters.

## 6. Composition

- One subject, centred a little high or on a gentle diagonal, with **margin** around it. Atlas plates breathe.
- Add one secondary element at most (a ground line, a scale bar, an inset).
- Keep it legible at 340px wide (mobile): no detail that only works at 1000px.

## 7. Budget

- Rendered SVG markup ≈ **60 KB** per plate at most (check with `node tools/render-engraving.mjs <name>`, which prints the size).
  Engravings are published as static files (`/engravings/<name>.svg`) and injected into pages on demand, so they are cached
  and never weigh on the HTML.
- Merge repeated marks into one `<path>` per class and weight. Round fine detail to whole pixels with `int()`.

## 8. Checking your work

Run `npm run dev`; the file `/engravings/<name>.svg` shows an engraving alone.
Render it to PNG **without a browser**, then look at the image:

```
node tools/render-engraving.mjs <name>        # → .playwright-mcp/eng-<name>.png
node tools/render-engraving.mjs <name> dark   # darkroom theme
```

(The PNG uses system fonts in place of the site fonts, which is expected.)
