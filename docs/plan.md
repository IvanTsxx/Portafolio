# IB Portfolio — Plan (source of truth)

> Si código y plan divergen, actualizá el plan (o alineá el código).
> Last updated: 2026-07-29

---

## Estado

El sitio shippea el shell portal:

- `PortalProvider` monta `AsciiWorld` (WebGL ASCII) en todas las rutas
- Contenido = chambers flotantes (`PortalPage` / home hero)
- Nav = half-wheel + `PortalLink` (hold → charge → wormhole → `router.push` → land)
- Chrome = theme + sound (top-right)
- Notes = MDX RSC (`next-mdx-remote/rsc`)
- Home de producción = `PortalHome`

---

## Color tokens (`--color-p-*`)

Definidos en `@theme` **no-inline** en `app/globals.css` (para que light mode cascadee).

| Token | Dark | Light | Rol |
|-------|------|-------|-----|
| `--color-p-void` | `#0c0b0a` | `#e8e4dc` | Fondo shell / bloom |
| `--color-p-bright` | `#e8e4dc` | `#1a1816` | Texto primario |
| `--color-p-mid` | `#cfc9bf` | `#3a3530` | Secundario |
| `--color-p-dim` | `#b8b2aa` | `#5c564e` | Labels / meta |
| `--color-p-signal` | `#e85d2a` | `#c44a1f` | Accent (raro) |
| `--color-p-line` | mix bright 18% | (hereda) | Hairlines |

Light: `.portal-shell[data-theme=light]` y `html.light .portal-shell` en `app/portal.css`.
Variante: `p-light:`.

---

## Typography

- **Display / UI:** Geist Sans (`--font-geist-sans`)
- **Mono / labels / ASCII:** Geist Mono (`--font-geist-mono`)
- Sin tercera fuente.
- Escala portal: `lib/portal/styles.ts` (`portal.label`, `title`, `transitTitle`, …)

---

## Duration scale (exactamente 5)

| Token | Value | Uso |
|-------|-------|-----|
| `--dur-micro` | `90ms` | hover, press, focus |
| `--dur-state` | `180ms` | state local, stagger corto |
| `--dur-enter` | `320ms` | entradas de sección |
| `--dur-fade` | `120ms` | reduced-motion / degrade |
| `--dur-portal` | `900ms` | secuencia wormhole completa |

---

## Easing (exactamente 4)

| Token | Value | Uso |
|-------|-------|-----|
| `--ease-portal` | `cubic-bezier(0.65,0,0.35,1)` | travel |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | entradas |
| `--ease-in` | `cubic-bezier(0.7,0,0.84,0)` | salidas |
| `--ease-mono` | `linear` | scramble / fields |

---

## Architecture rules

1. **RSC first.** Client: portal shell, ASCII rAF, theme/sound, Motion entrada, `PortalLink`, wheel.
2. **Notes = MDX.** `content/notes/*.mdx` + `compileMDX` + `noteComponents`. Typeset prose; diagramas custom en `components/mdx/*`.
3. **Renderers:**
   - Site field → WebGL `AsciiWorld`
   - Lab / dissolve / image→ASCII → `<pre>` engine (`lib/ascii`)
   - SVG → solo marcas estáticas
4. **Bun** como package manager.
5. **Theme:** `next-themes` + `data-theme` en `.portal-shell`; sync DOM en `useLayoutEffect`.

---

## File map

### Shell

- `lib/portal/portal-provider.tsx`
- `lib/portal/styles.ts`
- `lib/portal/portal-link.tsx`
- `app/portal.css`
- `app/globals.css`
- `components/site/portal-page.tsx`
- `components/site/theme-provider.tsx`
- `components/ui/animated-theme-toggler.tsx`
- `components/site/sound-toggle.tsx`

### Cosmos + home

- `components/home/portal/gl/ascii-world.tsx` (+ shader, atlas)
- `components/home/portal/portal-home.tsx`
- `components/home/portal/half-wheel.tsx` / `wheel-dock.tsx`
- `components/home/portal/home-constellation.tsx`
- `components/home/portal/content.ts`

### ASCII `<pre>` engine

- `lib/ascii/**` — ver `docs/ascii-engine.md`
- Lab stills: `content/lab.ts` + `public/lab/*`

### Content

- `app/work/*`, `app/notes/*`, `app/about/*`, `app/lab/*`
- `content/identity.ts`, `content/work.ts`, `content/notes/*.mdx`

### Design docs

- `DESIGN.md`, `PRODUCT.md`, `AGENTS.md`, `CLAUDE.md`

---

## Moods (`moodForHref`)

| Path | Mood |
|------|------|
| `/` | `0` |
| `/work*` | `0.2` |
| `/notes*` | `0.4` |
| `/lab*` | `0.6` |
| `/about*` | `0.8` |
| fallback | `0.55` |

Open (cámara local en `/`) usa land mood alto (~0.9) sin `router.push`.

---

## Notes authoring

```mdx
---
title: Example
date: "2026-07-29"
excerpt: One line.
---

Body.

<Callout tone="signal" title="Note">
RSC / client island registered in noteComponents.
</Callout>
```

- Code: rehype-pretty-code · theme `github-dark-dimmed` · bg `notes-code.css`
- Prose: typeset bridged a `--p-*` vía `.typeset-notes`
- Story diagrams: `WormholeDiagram`, `BuildLayers`, `TokenPalette`, … en `components/mdx/portal-story.tsx`
