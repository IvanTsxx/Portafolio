# Fase 3 — ASCII Engine

## Status
COMPLETA

## Entregado

- Shared `RafProvider`
- Grid / field / pointer / reduced-motion hooks
- Ramps + mulberry32 + Perlin
- `AsciiCanvas`, `AsciiRule`
- Docs: `docs/ascii-engine.md`

## Decisiones

- Mutation model: `textContent` on `<pre>`, not React state per frame.
- Hard cap 9000 cells.
- `staticFrame()` helpers on every field for SSR / RM.

## Siguiente

Phyllotaxis home + clip-reveal (fase 4) — ya integrado.
