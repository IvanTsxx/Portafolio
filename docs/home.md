# Home — Persistent cosmos shell (2026-07-28)

## Decision

The **ASCII WebGL cosmos is site-wide**, not home-only. Every route floats content over the same field. The wormhole runs on that shared canvas for entry/exit.

## Shell

`PortalProvider` mounts:

1. `AsciiWorld` (persistent)
2. Theme toggle
3. Route content layer (hidden while `traveling`)
4. Half-wheel nav (all routes)

## Navigation

- Hold spoke / `PortalLink` → charge → tunnel on shared canvas → mid `router.push` → land with route mood → text emerge
- Home → `land=0` (idle cosmos)
- Work/Notes → mood 0.2 · Lab → 0.45 · About → 0.7
- Open → local chamber on `/` only

## Pages

`PortalPage` wrapper — floating scroll chamber. No traditional navbar/footer.

## Source

- Shell: `lib/portal/portal-provider.tsx`, `components/site/portal-shell.css`
- Pages: `components/site/portal-page.tsx`
- Home content: `components/home/portal/portal-home.tsx`
