---
version: alpha
name: "Ivo · Observatory"
description: "A quiet, monochrome observatory: editorial type and measured grids on a charcoal or warm light ground, with the Lab experiments as the expressive artifacts."
colors:
  background: "#0b0b0c"
  surface: "#18181a"
  popover: "#222225"
  foreground: "#edece8"
  muted-foreground: "#a6a5a3"
  faint: "#737376"
  border: "#2a2a2d"
  border-strong: "#4a4a4f"
  signal: "#9aabb9"
  focus: "#c2d0da"
  destructive: "#d27a6e"
  code: "#111113"
  code-foreground: "#e9e7e1"
  code-comment: "#66666b"
  code-punctuation: "#8b8b90"
  code-property: "#c6ccd2"
  code-keyword: "#9db4c8"
  code-string: "#d6c19c"
  code-constant: "#d0a99c"
  code-type: "#b9d2dd"
  background-light: "#f7f6f2"
  surface-light: "#eeede9"
  popover-light: "#ffffff"
  foreground-light: "#151516"
  muted-foreground-light: "#56575a"
  faint-light: "#7d7e81"
  border-light: "#d2d0cc"
  border-strong-light: "#9a9894"
  signal-light: "#506678"
  focus-light: "#3f596e"
  destructive-light: "#a1453a"
  code-light: "#efede7"
  code-foreground-light: "#1d1d1f"
  code-comment-light: "#8d8c88"
  code-punctuation-light: "#77767a"
  code-property-light: "#3b4650"
  code-keyword-light: "#3f6582"
  code-string-light: "#8a6a3e"
  code-constant-light: "#7d5a50"
  code-type-light: "#2f5a6e"
typography:
  hero:
    fontFamily: "Instrument Serif"
    fontSize: "clamp(2.5rem, 5vw, 4.25rem)"
    fontWeight: "400"
    letterSpacing: "-0.035em"
    lineHeight: "0.92"
  display:
    fontFamily: "Instrument Serif"
    fontSize: "clamp(2rem, 3.4vw, 3rem)"
    fontWeight: "400"
    letterSpacing: "-0.03em"
    lineHeight: "0.95"
  title:
    fontFamily: "Instrument Serif"
    fontSize: "clamp(1.75rem, 2.8vw, 2.5rem)"
    fontWeight: "400"
    letterSpacing: "-0.025em"
    lineHeight: "1"
rounded:
  sm: "2px"
  md: "3px"
  lg: "4px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  24: "96px"
---

## Overview

- **Quiet interface, expressive artifacts.** The shell stays minimal. Lab demos carry the experiments.
- **Monochrome first.** Signal marks state and live things, never a large fill.
- **Precision in motion.** Every animation explains something, and has a reduced-motion twin.
- **Dark and light.** Light and dark are both art-directed, with the same hierarchy.
- **True readouts.** Every figure on screen is computed or sourced.

## Colors

One set of semantic tokens, two art-directed themes. `:root` is light and `.dark` is dark. The front matter lists dark values by token name and light values with a `-light` suffix.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `background` | `#f7f6f2` | `#0b0b0c` | Page ground |
| `surface` | `#eeede9` | `#18181a` | Panels, hover rows, poster ground |
| `popover` | `#ffffff` | `#222225` | Stages, code and figure grounds, dialogs |
| `foreground` | `#151516` | `#edece8` | Text and fills |
| `muted-foreground` | `#56575a` | `#a6a5a3` | Secondary text |
| `faint` | `#7d7e81` | `#737376` | Indices, captions, metadata |
| `border` | `#d2d0cc` | `#2a2a2d` | Hairlines |
| `border-strong` | `#9a9894` | `#4a4a4f` | Frames, rules, leaders |
| `signal` | `#506678` | `#9aabb9` | Active and live, never a large fill |
| `focus` | `#3f596e` | `#c2d0da` | Focus outline |
| `destructive` | `#a1453a` | `#d27a6e` | Errors |
| `code` | `#efede7` | `#111113` | Code ground |
| `code-foreground` | `#1d1d1f` | `#e9e7e1` | Text, variables |
| `code-comment` | `#8d8c88` | `#66666b` | Comments |
| `code-punctuation` | `#77767a` | `#8b8b90` | Punctuation |
| `code-property` | `#3b4650` | `#c6ccd2` | Properties |
| `code-keyword` | `#3f6582` | `#9db4c8` | Keywords, inline code |
| `code-string` | `#8a6a3e` | `#d6c19c` | Strings |
| `code-constant` | `#7d5a50` | `#d0a99c` | Constants |
| `code-type` | `#2f5a6e` | `#b9d2dd` | Types |

- Aliases for the shadcn primitives in components/ui and the registry: `popover-foreground` to `foreground`, `primary` to `foreground`, `primary-foreground` to `background`, `secondary` to `surface`, `secondary-foreground` to `foreground`, `muted` to `surface`, `accent` to `surface`, `input` to `border`, `ring` to `focus`.

## Typography

- Herr Von Muellerhoff (`font-signature`): The signature only.
- Instrument Serif (`font-serif`): Titles and moments.
- Geist (`font-sans`): Reading and interface.
- Geist Mono (`font-mono`): Labels, indexes, readouts, code.

Three families, no more. The serif is set through `display` and also answers to `font-heading`. `label` is the mono voice for every index, number and button. `spaced` is for eyebrows.

- `text-hero`: 40-68px fluid, 0.92 line height, -0.035em tracking. Page titles.
- `text-display`: 32-48px fluid, 0.95 line height, -0.03em tracking. Section titles.
- `text-title`: 28-40px fluid, 1 line height, -0.025em tracking. Detail titles.
- `text-base`: 16px. Reading text.
- `text-sm`: 14px. Summaries.
- `label`: 11px. Mono labels and metadata.
- `spaced`: 12px. Eyebrows.

## Layout

- Page gutters are 20px on phones and 32px from `md`. Sections sit 96px apart and each opens with a panel heading.
- `max-w-frame`: 72rem. Page frame, header, footer.
- Reading measure: `max-w-prose`, 65ch.
- Spacing follows the 4px scale: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24.
- Whitespace and type come before containers. Cards stay borderless unless a frame explains something.
- Layout helpers: `max-h-sticky`, `bottom-safe`, `reading-scope`, `reading-subject`, `grid-leader`, `grid-leader-gutter`, `min-h-hero`, `no-scrollbar`, `object-portrait`.

## Shapes

Radius derives from `--radius` (0.25rem): `rounded-sm` 2px, `rounded-md` 3px, `rounded-lg` 4px, `rounded-pill` 999px. Frames are 1px hairlines in `border` and `border-strong`. No shadows. Depth comes from contrast, scale and light, plus the marks `hairline-x`, `grain`, `hatch`, `blueprint-dots`, `hazard-stripe`.

## Components

- Panel heading (`components/site/panel-heading.tsx`): Mono index, label, hairline leader, aside.
- Document hero (`components/site/document-hero.tsx`): Mono code row, serif title that masks up, lede, closing hairline.
- Button (`components/site/styles.ts`): Outline, solid and selected tones, one size scale.
- Chip (`components/site/styles.ts`): Framed filter. Pressed chips invert.
- Link (`components/site/styles.ts`): Dotted underline turns solid on hover.
- Hover row (`components/site/styles.ts`): Surface wash on hover, outline for keyboard focus.
- Corner marks (`components/site/corner-marks.tsx`): Four guide marks. Always on, or shown on hover and focus.
- Theme toggle (`components/site/theme-toggle.tsx`): Half-filled circle, system first, choice persists.
- Copy command (`components/registry-docs/command-line.tsx`): Install command with a copy button.
- Code block (`components/content/code-figure.tsx`): Syntax-highlighted source on the code ground.
- Experiment card (`components/lab/experiment-card.tsx`): Static poster, mono index, serif title.
- Demo stage (`components/lab/experiment-stage.tsx`): Framed stage with corner marks, status line and controls.
- Open in menu (`components/site/open-in-menu.tsx`): Copies the page Markdown or opens it in an assistant.

## Motion

Animate transform and opacity only. Transitions run 100ms to 500ms. Under `prefers-reduced-motion` every animation and transition snaps in 0.01ms.

- `ease-mechanical` (cubic-bezier(0.7, 0, 0.2, 1)): State flips and links.
- `ease-out-quart` (cubic-bezier(0.25, 1, 0.5, 1)): Buttons and small fades.
- `ease-out-expo` (cubic-bezier(0.16, 1, 0.3, 1)): Reveals, arrows and settles.
- `ease-in-out-cinema` (cubic-bezier(0.65, 0, 0.35, 1)): Long strokes and wipes.
- Durations: `duration-100` state flips, `duration-200` buttons and color shifts, `duration-300` arrow nudges and hovers, `duration-500` larger moves.
- `equalizer-bar`: One bar of the now-playing equalizer, 900ms loop. Offset with wait-*.
- `guide-draw` (1400ms in-out-cinema): A guide line draws down from the top, 1400ms in-out-cinema.
- `signature-write` (1800ms in-out-cinema): The signature writes left to right as it scrolls into view.
- `mask-line`: Clips a line so mask-up can slide in.
- `rise-in` (650ms out-expo): Rises 8px and fades in.
- `mask-up` (900ms out-expo): Slides up out of a clipped line.
- `reveal-on-view`: Rises in while entering the viewport. CSS scroll timeline.
- `reading-progress-x`: Fills left to right as the reading column scrolls past. CSS scroll timeline, hidden without support.
- `reading-progress-y`: Fills top to bottom as the reading column scrolls past. CSS scroll timeline, hidden without support.
- `draw-in` (1600ms in-out-cinema): Stroke draws on. Set pathLength to 1.
- `clip-reveal` (1200ms in-out-cinema): Wipes a frame open from the top.
- `settle-in` (1800ms out-expo): Scales an image from 108% to rest.
- `pop-in` (480ms out-expo): Overshoot pop for a confirmed action.
- `burst-dot` (560ms out-expo): A dot flies out and fades. Rotate its wrapper.
- `count-roll` (320ms out-expo): A new number rolls up into place. Key it by value.
- `ink-underline` (320ms out-expo): Underline draws in on hover or focus.
- `wait-*`: Delays an animation by N ms.

## Do's and Don'ts

- Do: Use semantic token classes: `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-surface`, `border-border`.
- Do: Check every change in light and dark, at 1440 and 390 wide.
- Do: Build hierarchy with type and whitespace before adding boxes.
- Do: Build one `cva` base with variants and merge classes with `cn`.
- Do: Animate transform and opacity, and give each animation a reduced-motion twin.
- Do: Show `focus-visible` outlines.
- Do: Ship a static fallback when WebGL is off.
- Don't: Hard-code hex values or add arbitrary Tailwind values outside the theme.
- Don't: Use `signal` for chrome or large fills.
- Don't: Add shadows, or gradients as default chrome.
- Don't: Add a second `Canvas`.
- Don't: Hide essential information behind hover or animation.
- Don't: Use more than three font families.
- Don't: Invent clients, metrics or achievements.
