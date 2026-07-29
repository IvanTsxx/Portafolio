# ASCII Engine

## Status
COMPLETA

## Contract

- One shared `RafProvider` drives all live fields.
- `useAsciiField` mutates `<pre>.textContent` — **zero React re-renders per frame**.
- Returns `{ ref, snapshot, controls }`.
- `MAX_CELLS = 9000`. Above that, grid scales cell size up.
- Reduced-motion: show `snapshot` at t=0, pause rAF.

## Modules

| Path | Role |
|------|------|
| `raf-provider.tsx` | Shared rAF registry |
| `hooks/use-ascii-grid.ts` | ResizeObserver → cols/rows (150ms debounce) |
| `hooks/use-ascii-field.ts` | Field evaluation → DOM write |
| `hooks/use-ascii-frame.ts` | Register callback with RafProvider + IO pause |
| `hooks/use-ascii-pointer.ts` | Normalized pointer over container |
| `hooks/use-reduced-motion.ts` | `prefers-reduced-motion` |
| `ramps.ts` | CLASSIC / BLOCKS / DOTS / TECH / ORGANIC |
| `fields/*` | Pure `FieldFn` + `*StaticFrame` |
| `components/ascii-canvas.tsx` | Generic live panel |
| `components/phyllotaxis-canvas.tsx` | Buffer strategy home field |
| `components/barnsley-canvas.tsx` | Buffer strategy fern |
| `components/ascii-rule.tsx` | 1-row divider |

## Prototype explorations

See `docs/prototype-ascii-home.md`. Round 2 may use Canvas 2D / R3F outside this engine; Chamber reuses `AsciiCanvas` + pointer-aware `FieldFn`.

## Field strategies

1. **Pure O(1)/cell** — wave, moiré, flow (noise).
2. **Buffer precalc on resize** — phyllotaxis, barnsley. Per-frame = read + modulate.
3. **Sampled curve** — lissajous (samples capped; document if grids grow).

## Renderer decision

`<pre>` only for v1. Canvas/WebGL deferred until a field proves the text path is the bottleneck. See `docs/ascii-vs-svg.md`.

## Cómo verificar

1. `bun dev` → `/` shows phyllotaxis background
2. `/lab` shows 6 explorations
3. `~` opens debug HUD (FPS, portal state, reduced-motion)
4. Toggle OS reduced-motion → fields freeze on snapshot
