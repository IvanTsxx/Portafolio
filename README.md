# bongi.dev — Portafolio

Portfolio de Ivan Bongiovanni: un **cosmos ASCII WebGL persistente** detrás de todas las rutas, navegación por wormhole (half-wheel), y notes en MDX RSC.

El medio es la prueba. El campo generativo no es decoración — es el artefacto del primer viewport.

## Stack

| Capa | Tecnología |
|------|------------|
| Runtime | **Bun** · Next.js 16 (App Router) · React 19 |
| Estilo | Tailwind v4 · tokens `p-*` (portal) |
| Motion | Motion · Rough Notation · Cuelume (háptica/audio cues) |
| Campo vivo | Three / R3F — `AsciiWorld` (shader ASCII site-wide) |
| Lab fields | Motor `<pre>` + rAF compartido (`lib/ascii`) |
| Notes | `next-mdx-remote/rsc` · remark-gfm · rehype-pretty-code · typeset |
| Tema | `next-themes` · toggle con View Transitions |

## Quick path

```bash
bun install
bun dev
```

Abrí [http://localhost:3000](http://localhost:3000).

| Ruta | Qué es |
|------|--------|
| `/` | Home — panel de identidad sobre el cosmos + cámara local (Open) |
| `/work` | Proyectos |
| `/notes` | Escritos MDX |
| `/lab` | Estudios / stills ASCII |
| `/about` | Perfil |
| `~` | Debug HUD (FPS, portal phase, reduced-motion) |

Chrome fijo: theme + sound (arriba derecha). Nav: half-wheel (abajo).

## Arquitectura (hoy)

```
PortalProvider
├── AsciiWorld          ← canvas WebGL compartido (siempre montado)
├── chrome (theme/sound)
├── route content       ← oculto mientras traveling
└── WheelDock           ← hold spoke → charge → wormhole → land
```

- **Chambers** flotantes con bias L/R (`chamberSide`), no navbar/footer clásicos.
- **Moods** por destino tiñen el land del cosmos (`moodForHref`).
- **Tokens portal** en `@theme` no-inline (`--color-p-*`) para que light mode cascadee.
- **Clases compartidas** en `lib/portal/styles.ts`; nested/utilities en `app/portal.css`.

## Docs

| Doc | Rol |
|-----|-----|
| [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) | Convenciones para agentes |
| [`DESIGN.md`](DESIGN.md) | Sistema visual (north star + tokens) |
| [`PRODUCT.md`](PRODUCT.md) | Posicionamiento y principios |
| [`docs/`](docs/README.md) | Índice + contratos técnicos |
| [`docs/plan.md`](docs/plan.md) | Source of truth técnico |
| Note: [building-the-portal](content/notes/building-the-portal.mdx) | Origen, tokens, estilo |

## Contenido

- Identidad: `content/identity.ts`
- Destinos / copy portal: `components/home/portal/content.ts`
- Work: `content/work.ts`
- Lab: `content/lab.ts`
- Notes: `content/notes/*.mdx`
