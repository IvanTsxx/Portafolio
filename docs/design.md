---
version: alpha
name: "Ivo · Paper and ink"
description: "A dossier on paper. Ink type, hairline rules, numbered panels, one orange 3D companion."
colors:
  paper: "#ebebe9"
  paper-deep: "#e0e0dd"
  ink: "#121212"
  graphite: "#3d3d3b"
  mist: "#646361"
  rule: "#cdcdcb"
  rule-strong: "#535352"
  clay: "#db703b"
  clay-deep: "#a54a24"
  signal-steel: "#345a73"
  signal-moss: "#346c42"
  signal-rust: "#ae4024"
  destructive: "#cc291f"
typography:
  display:
    fontFamily: "Zen Kaku Gothic New"
    fontSize: "6rem"
    fontWeight: "300"
    letterSpacing: "-0.05em"
    lineHeight: "0.88"
  label:
    fontFamily: "Geist Mono"
    fontSize: "0.625rem"
    fontWeight: "400"
    letterSpacing: "0.16em"
    lineHeight: "0.875rem"
rounded:
  none: "0px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  11: "44px"
  12: "48px"
  16: "64px"
  24: "96px"
---

## Overview

- **A dossier on paper.** A paper sheet with ink type and numbered panels.
- **80/20 minimalism.** Labels and short lines. Figures carry the story.
- **Ink only.** Ink on paper. Clay belongs to the companion.
- **Hairlines, not shadows.** Radius 0. Rules, hatch and backing sheets, no shadows.
- **One companion.** One WebGL canvas, one agent. It narrates and builds.
- **Motion with a twin.** Every animation has a reduced-motion twin.

## Colors

- Surface: `paper` (sheet ground), `paper-deep` (backing sheets, idle tabs, hover rows).
- Ink: `ink` (text and fills), `graphite` (secondary text), `mist` (indices, captions).
- Rules: `rule` (hairlines), `rule-strong` (heading rules, sheet frame, leaders).
- Agent: `clay` (companion only), `clay-deep` (companion shade).
- Signals: `signal-steel` (status review), `signal-moss` (status done), `signal-rust` (accent), `destructive` (errors).
- shadcn aliases (`background`, `primary`, `muted`, `border` and the rest) resolve to these.

## Typography

Zen Kaku Gothic New, light and tight, for titles (`display`) and body. Geist Mono in the `label` utility for every label, number and button. Noto Sans JP (`jp`) only on route tabs, index page heroes and the nickname kana. Instrument Serif italic only for the wordmark.

## Layout

- Every page is a paper sheet in a strong hairline frame over two offset `paper-deep` backing sheets. Every route, index or detail, uses the same 72rem sheet (`max-w-sheet`). Sections, grids, figures and heroes take its full width. Paragraphs keep a 44rem measure (`max-w-column`) or `max-w-prose`.
- The sheet's left edge is a bound strip: punched holes with dithered toner around them. Hover lights a lens that follows the pointer. A press punches the nearest hole and sends a ripple along the strip.
- Route tabs sit on the sheet's left edge from `lg` and in a row above it on smaller screens. The active tab joins the sheet.
- Long pages get a thumb index of notches on the sheet's right edge. Below `lg` it becomes a 4px progress strip. From `2xl` the companion rides a rail lane beside it.
- The 48px top line holds the wordmark, ⌘K search and GitHub stars. Back to top is a 44px button docked on the bound edge, bottom left, once the reader is 1.5 screens down. The back cover is a stamped colophon below the sheet.
- Sections sit 96px apart. Each opens with a panel heading over a strong rule.

## Shapes

Radius 0 everywhere. Frames are 1px hairlines. No shadows. Depth comes from the backing sheets, `hatch` fills and corner marks.

## Components

- Panel heading: `[ XX-NN ]`, mono label, dotted leader, aside.
- Page hero: doc code, display title, hazard stripe, lede, over a seeded dither field at 10% ink. The field breathes while in view and swells under the mouse.
- Figure plate: framed figure with corner marks and one readout row.
- Specimen cell: hairline cell. Hover fills `paper-deep`.
- Button: mono label, 44px, solid ink or outline. Hover inverts.
- Chip: mono label in a frame. Pressed chips invert to ink.
- Link: `ink-underline` draws on hover or focus. Cards show corner marks. Nothing lifts.
- Companion: the one 3D agent, 48×56 on the rail. It narrates in first person and builds sections.

## Motion

- `ease-mechanical`: 100ms hover, focus, press, 700ms portrait scan.
- `ease-out-quart`: 150ms overlays, 200ms tabs, tooltips, 300ms folds, notches.
- `ease-out-expo`: 500ms image fades.
- Reduced motion: CSS snaps, the companion holds a key pose, the hero field stays on its static frame.

## Do's and Don'ts

- Do: Use token classes: `bg-paper`, `text-ink`, `text-graphite`, `text-mist`, `border-rule`.
- Do: Open each section with `DocumentSection` and give it a script in `lib/site/section-scripts.ts`.
- Do: Keep touch targets at 44px and show `focus-visible` rings.
- Do: Build one `cva` base with variants and merge classes with `cn`.
- Do: Ship a static fallback when WebGL is off.
- Don't: Render `<Agent>` outside the companion or add a second `Canvas`.
- Don't: Use clay for UI chrome, links or buttons.
- Don't: Round corners, add shadows or hard-code hex and oklch values.
- Don't: Use Japanese outside route tabs, index page heroes and the nickname kana.
- Don't: Write a paragraph where a label or a figure would do.
- Don't: Animate layout properties.
- Don't: Invent clients, metrics or achievements.
