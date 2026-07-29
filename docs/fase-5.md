# Fase 5 — Portal

## Status
COMPLETA

## Entregado

- `lib/portal/portal-provider.tsx` — 900ms sequence, double-nav cancel, RM path
- `lib/portal/portal-link.tsx`
- `lib/portal/scramble.ts`
- Wired into navbar, footer, home CTAs, work/notes lists
- Harness: `/portal-test` (renamed from `_portal-test` — underscore folders are private in App Router)

## Timing

| t | Event |
|---|--------|
| 0–120ms | Overlay fade-in |
| 200–700ms | Route label scramble |
| 800ms | `router.push` |
| 900ms | Idle |
| RM | 240ms fade, nav at end, no scramble |

## Bugfix shipped

- `??` mixed with `||` required parens in `portal-provider` (Turbopack parse error).

## Verificar

1. `/portal-test` — click each link, confirm scramble + nav
2. Double-click — first portal aborts
3. OS reduced-motion — short fade only
