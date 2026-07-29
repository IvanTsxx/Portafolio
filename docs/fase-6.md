# Fase 6 — Lab + Content + MDX

## Status
COMPLETA

## Lab

- `/lab` RSC shell + `lab-explorations.tsx` client island
- Fields: phyllotaxis, wave, flow, moiré, lissajous, barnsley
- `DebugPanel` (`~`) in root layout

## Work / About

- `/work` + `/work/[slug]` from `content/work.ts`
- `/about` with `theme-paper`

## Notes (MDX, RSC-first)

Supersedes the original “no MDX / typed blocks” correction.

| Piece | Role |
|-------|------|
| `content/notes/*.mdx` | Source + frontmatter (`title`, `date`, `excerpt`) |
| `lib/notes.ts` | `listNotes` / `getNote` via `compileMDX` |
| `components/mdx/note-components.tsx` | Custom RSC components (`Callout`, `FieldPreview`, typography) |
| `app/notes/*` | Server pages only; `PortalLink` / `NoteBackLink` as client leaves |

Dependency: `next-mdx-remote@6` (`/rsc` entry).

### Authoring

```mdx
---
title: Example
date: "2026-07-28"
excerpt: One line.
---

Body paragraph.

## Heading

- List item

<Callout tone="signal" title="Note">
Custom component — stays RSC.
</Callout>
```

## Verificar

1. `bun dev` → all nav routes resolve (no 404)
2. `/notes/ascii-vs-svg` renders Callout + code fence
3. `~` on `/lab` shows debug HUD
4. `bun run build` lists work + notes SSG paths
