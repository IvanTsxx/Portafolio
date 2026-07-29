# Home — Persistent cosmos shell

## Decision

El **cosmos ASCII WebGL es site-wide**. Cada ruta flota contenido sobre el mismo campo. El wormhole corre en ese canvas compartido.

## Shell

`PortalProvider` monta:

1. `AsciiWorld` (persistente, `dynamic` ssr:false)
2. Chrome: theme + sound
3. Capa de ruta (opacity 0 mientras `traveling`)
4. Overlay de tránsito (eyebrow + título scramble / highlight)
5. `WheelDock` / half-wheel (todas las rutas)

## Navigation

| Acción | Efecto |
|--------|--------|
| Hold spoke / `PortalLink` | charge → tunnel en canvas → mid `router.push` → land mood → texto emerge |
| Home | mood `0` (idle cosmos) |
| Work / Notes / Lab / About | moods `0.2` / `0.4` / `0.6` / `0.8` |
| Open (solo `/`) | cámara local, sin cambio de ruta |

Cancelación: una segunda navegación aborta la in-flight; gana el destino nuevo.

Reduced-motion: fade corto, sin scramble/tunnel expandido.

## Pages

`PortalPage` — chamber scrolleable con bias L/R (`chamberSide` en `content.ts`).
Home — `PortalHome`: hero izquierda (marca, nombre, status, socials) + `HomeConstellation` (glifos clickeables → `pulseRipple`).

Sin navbar/footer tradicionales en el shell portal.

## Source

| Pieza | Path |
|-------|------|
| Shell | `lib/portal/portal-provider.tsx` |
| Styles | `lib/portal/styles.ts`, `app/portal.css` |
| Page wrapper | `components/site/portal-page.tsx` |
| Home | `components/home/portal/portal-home.tsx` |
| Destinos / copy | `components/home/portal/content.ts` |
| Cosmos | `components/home/portal/gl/ascii-world.tsx` |
