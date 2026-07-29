# AX Portfolio — Frozen Plan

> Source of truth. If code and plan differ, update the plan (or fix the code to match).
> Last updated: Steps 1–6 complete · notes switched to MDX RSC.

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

## Architecture rules

1. **RSC first.** Pages and lists are Server Components. Client only for: portal, ASCII rAF fields, clip-reveal, contact dialog, debug HUD, `PortalLink` leaves.
2. **Notes = MDX.** `content/notes/*.mdx` + `next-mdx-remote/rsc` (`compileMDX`) + `components/mdx/note-components.tsx`. Custom components stay RSC unless they need interactivity.
3. **ASCII for live fields, SVG for static marks.** See `docs/ascii-vs-svg.md`.
4. **Bun** as package manager.

---

## File Inventory

### Base (Step 1) — DONE

- [x] `app/globals.css` — all tokens, @theme, utilities, reduced-motion
- [x] `app/layout.tsx` — fonts, metadata, site chrome, `className="dark"`, providers
- [x] `components/primitives/*` — Text, Heading, Label, Container, Stack, Row, Frame, Field
- [x] `components/site/navbar.tsx` — PortalLink nav
- [x] `components/site/footer.tsx` — ASCII name + PortalLink
- [x] `components/site/status-bar.tsx`
- [x] `components/site/contact-panel.tsx`

### ASCII Engine (Step 2) — DONE

- [x] `lib/ascii/utils/mulberry32.ts`
- [x] `lib/ascii/ramps.ts`
- [x] `lib/ascii/raf-provider.tsx`
- [x] `lib/ascii/hooks/*`
- [x] `lib/ascii/components/ascii-canvas.tsx`
- [x] `lib/ascii/components/ascii-rule.tsx`
- [x] `lib/ascii/index.ts`
- [x] `docs/ascii-engine.md`

### Phyllotaxis + Index (Step 3) — DONE

- [x] `lib/ascii/fields/phyllotaxis.ts`
- [x] `lib/ascii/components/phyllotaxis-canvas.tsx`
- [x] `components/transitions/clip-reveal-heading.tsx`
- [x] `app/page.tsx` — home with clip-reveal + phyllotaxis
- [x] `docs/fase-4.md`

### Portal (Step 4) — DONE

- [x] `app/portal-test/page.tsx` — harness at `/portal-test` (not `_` private folder)
- [x] `lib/portal/portal-provider.tsx` — cancelation + reduced-motion
- [x] `lib/portal/portal-link.tsx` — wired into navbar, footer, home, lists
- [x] `docs/fase-5.md`

### Lab + Explorations (Step 5) — DONE

- [x] `lib/ascii/fields/{flow,wave,moire,lissajous,barnsley}.ts`
- [x] `app/lab/page.tsx` (RSC) + `lab-explorations.tsx` (client island)
- [x] `components/site/debug-panel.tsx` — `~` toggle
- [x] `docs/fase-6.md`

### Content Pages (Step 6) — DONE

- [x] `app/work/page.tsx` + `app/work/[slug]/page.tsx`
- [x] `app/notes/page.tsx` + `app/notes/[slug]/page.tsx` (MDX RSC)
- [x] `app/about/page.tsx` — paper theme
- [x] `content/notes/*.mdx`
- [x] `content/work.ts`

### Audit (Fase 3) — PENDING

- [ ] review-animations pass
- [ ] 12 principles table
- [ ] acceptance criteria checklist

### Prototype — ASCII home directions (2026-07-28) — SUPERSEDED BY HOME

Round 2 picker kept for reference. **Shipping home** is documented in `docs/home.md`.

- [x] Round 1 rejected · Round 2 reactive
- [x] Promoted: Horizon + lexicon vortex + multi-section home
- [x] `content/identity.ts` (Tucumán + agent card)
- [x] `docs/home.md`
- [ ] Optional: delete `app/prototypes/ascii-home/` when no longer needed

### Home (2026-07-28) — DONE

- [x] `app/page.tsx` — hero + work + origin + agents + close
- [x] `components/home/*`
- [x] About page location/agents fields updated
- [x] `docs/home.md`

---

## Corrections log

1. Duration scale consolidated to exactly 5 values.
2. `useAsciiField` returns `{ ref, snapshot, controls }` — no React re-render per frame.
3. Phyllotaxis uses buffer precalculation: O(cols×rows) per frame after resize.
4. h1 uses clip-path reveal; scramble is portal route name only.
5. Renderer: `<pre>` only. `MAX_CELLS = 9000`. Canvas deferred.
6. **Notes use MDX** (`next-mdx-remote/rsc` + custom RSC components). Typed block arrays superseded.
7. Hex is source of truth in @theme; OKLCH computed.
8. Documentation uses "chose Motion because…" framing.
9. debug-panel, mulberry32, staticFrame(), portal double-nav cancel shipped.
10. `/_portal-test` renamed to `/portal-test` — Next.js `_` folders are private and 404.
11. Home redesign explored via `/prototypes/ascii-home`. Round 1 (Horizon/Stub/Nebula) rejected. Round 2: Vortex (R3F) / Ripple (Canvas2D) / Chamber (reactive fields). Production home untouched until `keep <variant>`.
12. Prototype may use Canvas/R3F; production renderer policy still `<pre>` until a promote updates `ascii-vs-svg.md`.
13. Home promoted (2026-07-28): Horizon split + R3F lexicon vortex (personal words: Tucumán, stack) + full sections. Identity in `content/identity.ts`. WebGL exception for hero spiral only — see `docs/home.md` + `ascii-vs-svg.md`.
