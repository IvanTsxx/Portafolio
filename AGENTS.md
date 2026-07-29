# AGENTS.md — bongi.dev

Guía para agentes (Cursor, Claude, etc.) que trabajan en este repo. Si el código y esta guía divergen, **actualizá la guía** (o corregí el código para que coincida).

## Qué es este proyecto

Portfolio personal (`bongi.dev`) cuyo producto es un **cosmos ASCII WebGL persistente** + shell portal. Las rutas flotan como chambers sobre el mismo campo. Bun + Next 16 App Router + React 19 + Tailwind v4.

## Quick path

```bash
bun install
bun dev          # http://localhost:3000
bun run build    # verificar SSG notes/work
```

Package manager: **Bun only** (hay `bun.lock`).

## Principios (no negociables)

1. **Field first** — no tapar el cosmos con cards opacas ni un segundo WebGL en home.
2. **RSC first** — pages/lists Server Components. Client solo para portal, ASCII rAF, theme/sound, Motion de entrada, `PortalLink`.
3. **Un accent** — signal orange (`p-signal`) ≤ ~10% del viewport.
4. **ASCII vivo vs SVG estático** — site field = `AsciiWorld` WebGL; Lab fields = `<pre>` engine; SVG = marcas fijas. Ver `docs/ascii-vs-svg.md`.
5. **Reduced motion** — travel, ripples, emerge deben degradar.
6. **Agent-readable** — copy/status en `content/identity.ts` es first-class.

## Mapa mental

| Área | Dónde |
|------|--------|
| Shell portal | `lib/portal/portal-provider.tsx` |
| Clases portal | `lib/portal/styles.ts` + `app/portal.css` |
| Tokens color | `@theme` en `app/globals.css` (`--color-p-*`, **no** `@theme inline`) |
| Duraciones / easings | `app/globals.css` (`--dur-*`, `--ease-*`) |
| Cosmos GL | `components/home/portal/gl/*` |
| Home UI | `components/home/portal/portal-home.tsx` |
| Wheel | `half-wheel.tsx` + `wheel-dock.tsx` |
| Notes MDX | `content/notes/*.mdx` · `lib/notes.ts` · `components/mdx/*` |
| Identidad | `content/identity.ts` |
| Design north star | `DESIGN.md` · `PRODUCT.md` |

## Tokens portal (`p-*`)

| Token | Dark | Light | Uso |
|-------|------|-------|-----|
| `p-void` | `#0c0b0a` | `#e8e4dc` | Fondo shell |
| `p-bright` | `#e8e4dc` | `#1a1816` | Texto primario |
| `p-mid` | `#cfc9bf` | `#3a3530` | Secundario |
| `p-dim` | `#b8b2aa` | `#5c564e` | Meta / labels |
| `p-signal` | `#e85d2a` | `#c44a1f` | Accent raro |

Light overrides: `.portal-shell[data-theme=light]` / `html.light .portal-shell` en `portal.css`.
Variante Tailwind: `p-light:`.

### Duraciones (exactamente 5)

`--dur-micro` 90ms · `--dur-state` 180ms · `--dur-enter` 320ms · `--dur-fade` 120ms · `--dur-portal` 900ms

### Easings (exactamente 4)

`--ease-portal` · `--ease-out` · `--ease-in` · `--ease-mono`

## Convenciones de código

- Imports **arriba del archivo** (no inline).
- Switches sobre uniones: `default` con `never` exhaustivo.
- Estilos portal: reutilizá `portal.*` de `lib/portal/styles.ts`.
- Tipografía: **Geist + Geist Mono only**.
- Notes: frontmatter `title` / `date` / `excerpt`; componentes en `noteComponents`; prose via `.typeset-notes`.
- Code fences: Shiki `github-dark-dimmed`, fondo `notes-code.css`.
- Theme toggle: no snapshotear canvases WebGL en View Transitions.
- No commits a menos que el usuario lo pida.

## Anti-patrones

- Navbar/footer marketing clásicos en rutas portal.
- Cards en el hero / home.
- Purple SaaS / cream-serif editorial / glow stacks.
- `useMemo`/`useCallback` “por si acaso”.
- Segundo R3F canvas compitiendo con `AsciiWorld` en home.
- `@theme inline` para `--color-p-*` (rompe light cascade).

## Docs a leer según tarea

| Tarea | Leer |
|-------|------|
| Cambiar home / nav / travel | `docs/home.md`, `DESIGN.md` |
| Nuevo field Lab / rAF | `docs/ascii-engine.md` |
| Elegir renderer | `docs/ascii-vs-svg.md` |
| Nueva note | `docs/plan.md` § Notes |
| Producto / voz | `PRODUCT.md` |
| Origen / tokens narrados | `/notes/building-the-portal` |

## Verificación mínima

1. `bun dev` — cosmos visible en `/`, wheel responde.
2. Hold spoke → wormhole → land con emerge de texto.
3. Toggle theme (sin crash de tab).
4. `prefers-reduced-motion` → travel degradado.
5. `/notes/<slug>` renderiza MDX + callouts.
6. `~` muestra HUD.
