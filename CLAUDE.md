# CLAUDE.md

Instrucciones para Claude (y herramientas compatibles) en este repo.

**Leé primero [`AGENTS.md`](AGENTS.md)** — es la fuente operativa. Este archivo solo ancla el contexto del producto.

## Producto en una frase

Portfolio generativo donde un **cosmos ASCII WebGL compartido** es el artefacto; las rutas son chambers flotantes alcanzadas por wormhole (half-wheel, contrato ~900ms).

## Stack ancla

Bun · Next.js 16 App Router · React 19 · Tailwind v4 · Motion · Three/R3F · `next-mdx-remote/rsc` · next-themes

## Antes de editar

1. Confirmá si el cambio toca **portal shell** (`lib/portal/*`, `app/portal.css`, `components/home/portal/*`) o **motor `<pre>`** (`lib/ascii/*`).
2. Respetá tokens `p-*` + duraciones/easings nombrados — no inventes escalas.
3. RSC por defecto; client islands mínimas.
4. Actualizá `docs/plan.md` / `docs/home.md` si cambiás un contrato documentado.

## Referencias visuales

- North star: `DESIGN.md` (“The Persistent Terminal Field”)
- Principios de producto: `PRODUCT.md`
- Origen / tokens narrados: note `building-the-portal` en `content/notes/`

## No hacer

- Sustituir el campo por SVG blobs o un hero card-grid.
- Romper reduced-motion.
- Commitear sin pedido explícito del usuario.
- Usar npm/pnpm; el lockfile es Bun.
