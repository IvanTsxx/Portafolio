# AX Portfolio — Frozen Plan

> Source of truth. If code and plan differ, update the plan (or fix the code to match).
> Last updated: Step 1 complete.

---

## Color Tokens (hex canonical, OKLCH computed)

| Token             | Hex       | OKLCH                      | Role                              |
|-------------------|-----------|----------------------------|-----------------------------------|
| `--color-ax-void`   | `#050505` | `oklch(3% 0 0)`            | Background, deepest black         |
| `--color-ax-ink`    | `#0D0D0D` | `oklch(7% 0 0)`            | Card/frame backgrounds            |
| `--color-ax-line`   | `#1F1F1F` | `oklch(14% 0 0)`           | All 1px borders                   |
| `--color-ax-dim`    | `#4A4A4A` | `oklch(32% 0 0)`           | Inactive / muted text             |
| `--color-ax-mid`    | `#8A8A8A` | `oklch(57% 0 0)`           | Secondary text, nav items         |
| `--color-ax-bright` | `#EDEDED` | `oklch(94% 0 0)`           | Primary text, active nav bg       |
| `--color-ax-paper`  | `#F2EFE8` | `oklch(95% 0.008 88)`      | /about background only            |
| `--color-ax-signal` | `#FF4D00` | `oklch(62% 0.225 32)`      | Accent — one and only             |

---

## Typography

- **Display / UI:** Geist Sans (via `next/font/google`, variable `--font-geist-sans`)
- **Mono / labels / ASCII:** Geist Mono (variable `--font-geist-mono`)
- NO third font. Size scale in `globals.css` under `--text-*`.

---

## Duration Scale (exactly 5, no others allowed)

| Token          | Value  | Usage                                              |
|----------------|--------|----------------------------------------------------|
| `--dur-micro`  | `90ms` | Hover, press, focus ring, nav active swap          |
| `--dur-state`  | `180ms`| Local state changes, stagger entries, clip reveal  |
| `--dur-enter`  | `320ms`| Section entrances, AsciiImage crossfade            |
| `--dur-fade`   | `120ms`| ONLY reduced-motion overrides, portal degrade      |
| `--dur-portal` | `900ms`| ONLY the portal sequence (internal reparto below)  |

Portal reparto (sums to ≤ 900ms):
- ASCII scramble: 0–600ms
- Crossfade: 400–700ms
- Page paint: 600–900ms

---

## Easing Curves (exactly 4)

| Token            | Value                        | Usage                                      |
|------------------|------------------------------|--------------------------------------------|
| `--ease-portal`  | `cubic-bezier(0.65,0,0.35,1)`| Portal: symmetric, decisive                |
| `--ease-out`     | `cubic-bezier(0.16,1,0.3,1)` | Entrances                                  |
| `--ease-in`      | `cubic-bezier(0.7,0,0.84,0)` | Exits                                      |
| `--ease-mono`    | `linear`                     | Scramble, marquees, ASCII fields           |

---

## Animation Inventory (corrected)

| Element                  | Duration          | Easing          | Property                   | Notes                              |
|--------------------------|-------------------|-----------------|----------------------------|------------------------------------|
| Nav active item swap     | `--dur-micro`     | `--ease-out`    | `background-color`, `color`| CSS, no JS                         |
| Nav anticipation wiggle  | `--dur-state`     | CSS spring-ish  | `transform`                | 180ms max (corrected from 200ms)   |
| h1 clip reveal (home)    | `--dur-state`     | `--ease-out`    | `clip-path`                | 60ms stagger per line              |
| Section entrance         | `--dur-enter`     | `--ease-out`    | `transform`, `opacity`     | From scale(0.95) + opacity         |
| AsciiImage crossfade     | `--dur-enter`     | `--ease-out`    | `opacity`                  | Static → animated                  |
| Form secondary wave      | `--dur-enter`     | `--ease-out`    | `transform`, `opacity`     | 320ms (corrected from 400ms)       |
| Portal full sequence     | `--dur-portal`    | `--ease-portal` | Multiple                   | 900ms, reparto above               |
| Reduced-motion fallback  | `--dur-fade`      | `--ease-mono`   | `opacity`                  | 120ms crossfade only               |

---

## File Inventory

### Base (Step 1)

- [x] `app/globals.css` — all tokens, @theme, utilities, reduced-motion
- [x] `app/layout.tsx` — fonts, metadata, site chrome
- [x] `components/primitives/text.tsx` — polymorphic body text
- [x] `components/primitives/heading.tsx` — h1/h2/h3 with decoupled visual size
- [x] `components/primitives/label.tsx` — mono uppercase with index/tone
- [x] `components/primitives/container.tsx` — max-width, gutter, bleed
- [x] `components/primitives/stack.tsx` — Stack (col) + Row (row)
- [x] `components/primitives/frame.tsx` — 1px border card with header/footer slots
- [x] `components/primitives/field.tsx` — 1px box CTA / kbd
- [x] `components/primitives/index.ts` — barrel
- [x] `components/site/navbar.tsx` — floating centered nav
- [x] `components/site/footer.tsx` — ASCII name + links
- [x] `components/site/status-bar.tsx` — bottom-left time indicator
- [x] `components/site/contact-panel.tsx` — bottom-right + panel
- [x] `components/site/index.ts` — barrel
- [x] `app/page.tsx` — placeholder (replaced in Step 3)

### ASCII Engine (Step 2)

- [ ] `lib/ascii/utils/mulberry32.ts` — seeded RNG
- [ ] `lib/ascii/utils/ramps.ts` — all ramp functions
- [ ] `lib/ascii/hooks/use-raf-provider.tsx` — shared rAF context
- [ ] `lib/ascii/hooks/use-ascii-grid.ts` — grid dimensions (cols/rows)
- [ ] `lib/ascii/hooks/use-ascii-field.ts` — field hook (snapshot + rAF mutation)
- [ ] `lib/ascii/components/ascii-canvas.tsx` — `<pre>` renderer
- [ ] `lib/ascii/components/ascii-rule.tsx` — 1-row horizontal divider
- [ ] `lib/ascii/index.ts` — barrel
- [ ] `docs/ascii-engine.md` — full engine docs
- [ ] `docs/fase-3.md`

### Phyllotaxis + Index (Step 3)

- [ ] `lib/ascii/fields/phyllotaxis.ts` — buffer algorithm, correct O(cols*rows) per frame
- [ ] `app/page.tsx` — final home with clip-reveal h1, phyllotaxis background
- [ ] `docs/fase-4.md`

### Portal (Step 4)

- [ ] `app/_portal-test/page.tsx` — isolated prototype
- [ ] `components/site/portal-provider.tsx` — PortalProvider + router integration
- [ ] Portal cancelation on double navigation
- [ ] Reduced-motion: 120ms crossfade only
- [ ] `docs/fase-5.md`

### Lab + Explorations (Step 5)

- [ ] `lib/ascii/fields/flow.ts`
- [ ] `lib/ascii/fields/wave.ts`
- [ ] `lib/ascii/fields/moire.ts`
- [ ] `lib/ascii/fields/lissajous.ts`
- [ ] `lib/ascii/fields/barnsley.ts`
- [ ] `app/lab/page.tsx` — all explorations
- [ ] `components/site/debug-panel.tsx` — `~` key toggle
- [ ] `docs/fase-6.md`

### Content Pages (Step 6)

- [ ] `app/work/page.tsx`
- [ ] `app/notes/page.tsx`
- [ ] `app/about/page.tsx`
- [ ] `content/notes/` — typed block content

---

## The Nine Corrections Applied

1. Duration scale consolidated to exactly 5 values. 400ms dropped, 200ms → 180ms, 320ms used for wave.
2. `useAsciiField` returns `{ ref, snapshot, controls }` — no string, no React re-render per frame.
3. Phyllotaxis uses buffer precalculation: one O(cols×rows) pass per frame after resize.
4. Scramble reverted from h1. h1 uses clip-path reveal (clip-reveal utility). Scramble: portal route name only.
5. Renderer scope: `<pre>` only. `MAX_CELLS = 9000`. Canvas branch deferred, documented in ascii-engine.md.
6. No MDX. Article content is a typed `.tsx` with `{ type, content }` block array.
7. Hex is source of truth in @theme; OKLCH computed. No OKLCH-only tokens without hex comment.
8. Documentation uses "chose Motion because…" framing; no framework comparisons.
9. Added to checklist: debug-panel.tsx, mulberry32, staticFrame() on each field, portal double-navigation cancel.
