# Home — Portal wheel (promoted 2026-07-28)

## Decision

Shipping home is the **hold-to-portal wheel** experience (Bolt tunnel + landed chambers). Prototype picker (Worm/Bolt/Fold) removed; iterate on `/`.

## Interaction

1. Surface: floating hero + idle ASCII cosmos (WebGL).
2. Hold arc spoke → charge → wormhole transit → land with section ambient.
3. Home spoke / ← home → return tunnel to surface.
4. Chamber stubs link to real routes (`/work`, `/notes/...`, `/lab`, `/about`) — full portal-route navigation comes next.

## Destinations

| Spoke | Chamber | Routes |
|-------|---------|--------|
| Home | surface | `/` |
| Work | projects + notes stubs | `/work`, `/notes` |
| Craft | stack / learning | `/lab` |
| Studio | CV / origin | `/about` |
| Open | pitch / contact | mailto + agent prompt |

## Source

`components/home/portal/*` — content in `content.ts`, shader in `gl/`.

## Perf notes

- Travel driven inside R3F `useFrame` (no parallel rAF).
- Charge painted from ref on the wheel (no React re-renders during hold).
- One React state commit on land; `startTransition` for chamber mount.
- `dpr={1}`, `cell=16`, no `filter:blur` over the canvas.
- Global navbar/footer gated off on `/` via `ChromeGate`.

## Next

Wire wheel hold → `PortalLink` / shared portal transition into real pages (keep tunnel as the transition).
