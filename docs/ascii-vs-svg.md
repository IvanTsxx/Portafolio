# ASCII vs SVG

## Decision

**Keep generative fields as ASCII `<pre>`.** Use SVG (or CSS data-URI SVG) only for **static** marks.

## Why ASCII for fields

| Criterion | ASCII `<pre>` | SVG paths |
|-----------|---------------|-----------|
| Brand / identity | Terminal density — unique | Generic illustration |
| Per-frame cost model | String write, O(cells) | DOM/path churn or canvas redraw |
| SSR + reduced-motion | Same snapshot string | Separate static asset pipeline |
| Seeded math → output | Natural (ramps) | Needs tessellation / sampling |
| Portal scramble affinity | Same character vocabulary | Disconnect |

This site’s subject **is** the generative system. Replacing the home field with SVG blobs fails the brand test: the first viewport could belong to another product.

## Where SVG is correct

- Bayer dither tile (`dither-bg` utility) — fixed 4×4 pattern
- Icons / favicons
- Future static diagrams that never animate per cell

## Hybrid rule

```
live density field  → ASCII engine (<pre> + rAF)
static ornament     → SVG / CSS
```

Do not redraw phyllotaxis / flow / moiré as SVG art for “sharpness.” Sharpness comes from mono metrics and token discipline, not vector outlines.

## When to revisit Canvas

Only if profiling shows `<pre>` textContent writes missing frame budget under `MAX_CELLS` with multiple simultaneous fields. Document the branch in `ascii-engine.md` before adding it.

**Prototype exception (2026-07-28):** `/prototypes/ascii-home` explores Canvas 2D / R3F.

**Production exception (promoted):** home hero uses R3F `LexiconVortex` for an interactive 3D spiral of personal lexicon words. All other live fields stay on the ASCII `<pre>` engine (`HomeOrigin`, lab, etc.). Revisit if the hero spiral fails performance budgets.
