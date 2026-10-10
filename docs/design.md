---
version: alpha
name: "Ivo · Paper and ink"
description: "A technical document on paper. Ink type, hairline rules, numbered panels, and small orange 3D agents as the only color."
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
  popover: "#f7f7f5"
  border: "#cdcdcb"
  input: "#bbbbba"
  chart-2: "#3d3d3b"
  chart-3: "#646361"
  chart-4: "#93928f"
  chart-5: "#bebebb"
typography:
  display:
    fontFamily: "Zen Kaku Gothic New"
    fontSize: "6rem"
    fontWeight: "300"
    letterSpacing: "-0.05em"
    lineHeight: "0.88"
  title:
    fontFamily: "Zen Kaku Gothic New"
    fontSize: "3rem"
    fontWeight: "300"
    letterSpacing: "-0.05em"
    lineHeight: "0.88"
  heading:
    fontFamily: "Zen Kaku Gothic New"
    fontSize: "1.25rem"
    fontWeight: "300"
    lineHeight: "1.25"
  body:
    fontFamily: "Zen Kaku Gothic New"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.5"
  body-sm:
    fontFamily: "Zen Kaku Gothic New"
    fontSize: "0.875rem"
    fontWeight: "400"
    lineHeight: "1.625"
  label:
    fontFamily: "Geist Mono"
    fontSize: "0.625rem"
    fontWeight: "400"
    letterSpacing: "0.16em"
    lineHeight: "0.875rem"
  numeral:
    fontFamily: "Geist Mono"
    fontFeature: "tnum"
    fontSize: "1.875rem"
    fontWeight: "300"
  annotation-jp:
    fontFamily: "Noto Sans JP"
    fontSize: "0.625rem"
    fontWeight: "400"
rounded:
  none: "0px"
  sm: "0px"
  md: "0px"
  lg: "0px"
  xl: "0px"
  2xl: "0px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  11: "44px"
  16: "64px"
  24: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "44px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px"
  panel-heading:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
---

## Overview

A personal portfolio rendered as a technical document on paper: numbered panels, mono labels with Japanese annotations, hairline rules, hatch fills and dithered imagery. Ink and paper carry the interface. Small orange 3D agents are the only color and the only playful element.

- **Technical document on paper.** Paper ground, ink type, numbered sheets. Every page reads as a technical document.
- **80/20 minimalism.** Cut until the remaining 20 percent carries 80 percent of the meaning.
- **Ink only, clay for agents.** Ink and paper everywhere. Clay orange belongs to the 3D agents alone.
- **One shared canvas.** One WebGL canvas for the whole site. Views track DOM boxes. Never a second Canvas.
- **Motion with purpose.** Motion explains state or shows work. Every animation has a reduced-motion twin.
- **Less text, more visuals.** Labels and short lines. Specimens, 3D and diagrams carry the story.
- **Hairlines, not shadows.** Radius 0. Rules, hatch and corner marks build structure. No soft shadows.

## Colors

High-contrast neutrals on warm paper. Clay orange is reserved for the 3D agents and never used for UI chrome.

- **paper (#ebebe9):** Page and card ground.
- **paper-deep (#e0e0dd):** Recessed fill, hover rows, active cells.
- **ink (#121212):** Primary text, solid fills, focus ring, strong borders.
- **graphite (#3d3d3b):** Secondary text, outline borders, selected fills.
- **mist (#646361):** Indices, captions, tertiary labels.
- **rule (#cdcdcb):** Hairlines between cells and rows.
- **rule-strong (#535352):** Panel heading underline, dashed frames, leaders.
- **clay (#db703b):** Reserved for the 3D agents and their status marks.
- **clay-deep (#a54a24):** Agent shade: legs, arms, deep surfaces.
- **signal-steel (#345a73):** In review.
- **signal-moss (#346c42):** Done.
- **signal-rust (#ae4024):** Vermilion accent, sparingly.
- **destructive (#cc291f):** Blocked and invalid.
- **popover (#f7f7f5):** Raised surface: popovers, callouts, previews.
- **border (#cdcdcb):** Default border.
- **input (#bbbbba):** Input border.
- **chart-2 (#3d3d3b):** Series 2.
- **chart-3 (#646361):** Series 3.
- **chart-4 (#93928f):** Series 4.
- **chart-5 (#bebebb):** Series 5.

## Typography

Zen Kaku Gothic New, light and tightly tracked, for names and titles. Geist Mono, 10px uppercase and tracked, for every label, number and button. Noto Sans JP for short Japanese annotations beside section labels. Instrument Serif italic only for the wordmark.

## Layout

A 12-column document grid. A sticky identity dossier fills 4 columns on the left; numbered sections fill 8 on the right and stack on mobile. Spacing follows a 4px scale. Sections are separated by 64px and open with a panel heading: `[ XX-NN ]  LABEL  日本語 ........ 06 / 06` over a strong rule.

## Elevation & Depth

Flat. No shadows. Depth comes from rules, recessed paper-deep fills, hatch patterns and crosshair corner marks. The only real depth is the 3D agents, rendered in one shared canvas.

## Shapes

Square everything. Radius is 0 on cards, buttons, chips, inputs and images. Frames are 1px hairlines; strong rules mark section boundaries.

## Components

- **Panel heading:** index in brackets, mono label, Japanese annotation, dotted leader, count.
- **Specimen card:** hairline frame, corner marks, mono index top-left, square badge top-right, light title, one-line summary, mono footer row.
- **Button:** 44px, square, mono uppercase label. Primary is ink on paper inverted; outline is a 1px ink frame. State flips in 100ms.
- **Chip:** square hairline frame with a mono label; active chips invert to ink.
- **Leader row:** mono key, dotted leader, value aligned right.
- **Agent:** small orange box-shaped 3D mascot with role accessories. One per view, hover and click reactions, static fallback without WebGL.

## Do's and Don'ts

- Do: Use bg-paper, text-ink, text-graphite, text-mist and border-rule tokens.
- Do: Set every annotation in the label utility and pair section labels with a jp annotation.
- Do: Number panels as [ XX-NN ] LABEL 日本語 with a dotted leader and a count.
- Do: Flip states in 100ms with ease-mechanical. Reveal with out-quart or out-quint.
- Do: Keep hit areas at 44px on touch and use focus-visible rings.
- Do: Build one base component with cva variants and merge classes with cn.
- Do: Use Server Components by default and add use client only for interactivity.
- Do: Mark where an agent stands with AgentWaypoint. Show a scene with AgentScene.
- Do: Show a static meaningful fallback when WebGL is off.
- Don't: Add a second Canvas or a per-component WebGL context.
- Don't: Use clay orange for UI chrome, links or buttons.
- Don't: Round corners. Radius is 0 everywhere.
- Don't: Hard-code hex or oklch values. Use the token class.
- Don't: Invent clients, metrics or achievements. Label placeholders as sample content.
- Don't: Write paragraphs where a label, a number or a specimen would do.
- Don't: Animate layout properties or ship motion without a reduced-motion twin.
- Don't: Write ad-hoc CSS classes. Style in markup with Tailwind utilities and cva variants.
- Don't: Add comments to code.
