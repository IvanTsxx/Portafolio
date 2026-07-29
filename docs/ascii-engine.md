# ASCII Engine (`<pre>` + rAF)

## Status

COMPLETA — motor de fields Lab / dissolve / image-to-ASCII.
El **fondo del sitio** no usa este engine; usa WebGL `AsciiWorld` (ver `docs/home.md`).

## Contract

- Un `RafProvider` compartido registra callbacks.
- `useAsciiField` muta `<pre>.textContent` — **cero re-renders React por frame**.
- Retorna `{ ref, snapshot, controls }`.
- `MAX_CELLS = 9000`. Por encima, sube el tamaño de celda.
- Reduced-motion: muestra `snapshot` en t=0, pausa rAF.

## Modules

| Path | Role |
|------|------|
| `raf-provider.tsx` | Registry rAF compartido |
| `hooks/use-ascii-grid.ts` | ResizeObserver → cols/rows |
| `hooks/use-ascii-field.ts` | Eval field → DOM write |
| `hooks/use-ascii-frame.ts` | Register + IntersectionObserver pause |
| `hooks/use-ascii-pointer.ts` | Pointer normalizado |
| `hooks/use-reduced-motion.ts` | `prefers-reduced-motion` |
| `ramps.ts` | CLASSIC / BLOCKS / DOTS / TECH / ORGANIC |
| `fields/*` | `FieldFn` puras + static frames |
| `components/ascii-canvas.tsx` | Panel live genérico |
| `image-to-ascii.ts` / dissolve | Stills y crossfades |

## Field strategies

1. **Pure O(1)/cell** — wave, moiré, flow.
2. **Buffer precalc on resize** — phyllotaxis, barnsley.
3. **Sampled curve** — lissajous.

## Lab hoy

`/lab` usa **stills** (`content/lab.ts` + assets en `public/`) en lugar de montar todos los fields live a la vez (congelaba al entrar). El engine sigue disponible para exploraciones puntuales.

## Cómo verificar

1. `bun dev` → `/` muestra cosmos WebGL (no phyllotaxis full-bleed).
2. `/lab` lista estudios con stills ASCII.
3. `~` abre debug HUD (FPS, portal phase, reduced-motion).
4. OS reduced-motion → fields/`travel` degradan.
