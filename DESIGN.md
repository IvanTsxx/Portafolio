---
name: bongi.dev portal
description: Persistent ASCII cosmos portfolio — void field, signal accent, floating mono chrome
colors:
  void: "#0c0b0a"
  ax-void: "#050505"
  bright: "#e8e4dc"
  dim: "#b8b2aa"
  mid: "#cfc9bf"
  signal: "#e85d2a"
  void-light: "#e8e4dc"
  bright-light: "#1a1816"
  dim-light: "#2c2824"
  mid-light: "#2a2622"
  signal-light: "#c44a1f"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.5vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  transit:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.65rem, 4.2vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  titleLg:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    letterSpacing: "-0.02em"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.16em"
  meta:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "9px"
    fontWeight: 400
    letterSpacing: "0.14em"
  link:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.12em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  bodySm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0px"
  sm: "2px"
  chrome: "9999px"
spacing:
  hero-gap: "1rem"
  chrome: "0.5rem"
components:
  chrome-btn:
    backgroundColor: "color-mix(in oklab, {colors.void} 70%, transparent)"
    textColor: "{colors.bright}"
    rounded: "{rounded.sm}"
    padding: "8px"
  status-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.bright}"
---

# Design System: bongi.dev portal

## Overview

**Creative North Star: "The Persistent Terminal Field"**

The site is one infinite ASCII cosmos. Route content floats as sparse chambers over that field; chrome is minimal and mono. The home viewport succeeds when the visitor reads the generative field as the artifact — identity copy is a left-anchored instrument panel, not a marketing hero stack.

Personality: cyber-terminal restraint, warm paper-bright type on near-black void, rare orange-red signal. Anti-references: purple SaaS gradients, card grids in the hero, second WebGL scenes that punch holes in the field, SVG blobs as live density.

**Key Characteristics:**
- Shared full-bleed WebGL ASCII cosmos behind all routes
- Asymmetric floating chambers (left/right), not centered marketing columns
- Signal accent used sparingly (status, wheel pin, highlight mark)
- Geist + Geist Mono; uppercase tracking for labels
- Scroll halo / float panels with soft void bloom, not heavy shadows

## Colors

Near-black void with warm off-white type; one signal orange for life indicators.

### Primary
- **Signal ember** (#e85d2a dark / #c44a1f light): status pulse, wheel charge fill, highlight mark, focus ring. Rarity is the point.

### Neutral
- **Void** (#0c0b0a / light #e8e4dc): field / shell background
- **Bright** (#e8e4dc / light #1a1816): primary copy
- **Mid** (#cfc9bf / light #2a2622): secondary copy
- **Dim** (#b8b2aa / light #2c2824): meta labels, quieter mono
- **Line**: bright at ~18% mix — hairline borders only

### Named Rules
**The One Signal Rule.** Signal appears on ≤10% of any viewport — status, active nav, highlight. Never flood panels with orange.

**The Field First Rule.** Do not cover the cosmos with opaque cards or a second canvas. Copy floats; the field stays continuous.

## Typography

**Display Font:** Geist (sans)
**Body Font:** Geist (sans)
**Label/Mono Font:** Geist Mono

**Character:** Clean product sans for the name; mono for system metadata (role, status, HUD). Tight negative tracking on the display name; wide tracking + uppercase on labels.

### Hierarchy
- **Display** (600, clamp 2–3.4rem, lh 0.92): identity name
- **Transit** (600, clamp 1.65–3rem, lh 1.02): route / note title during wormhole hop — roomy max-width for long titles
- **Title lg** (600, 1.15rem): note / list card titles
- **Label** (mono ~10px, tracking 0.16em, uppercase): role, currently-at, status
- **Meta** (mono ~9px): tighter meta under titles
- **Link** (mono ~11px, signal): chamber CTA / back links
- **Body** (~15px): chamber copy when open
- **Body sm** (~14px): excerpts / secondary body

## Layout

Full-viewport portal shell. Content is absolute floating chambers with side bias (home left). Half-wheel docked bottom-center. Chrome controls top-right. No traditional navbar/footer. First viewport: brand identity + field — no stats strips or card grids.

## Elevation & Depth

Depth comes from the glyph field + soft void text bloom (`text-shadow` halo), not Material shadows. Float panels use translucent void mix + hairline border. Flat tonal layering over lifted cards.

## Shapes

Mostly sharp (`0–2px`). Pill only for the wheel home capsule. No rounded media cards in hero.

## Components

- **Hero chamber:** left-biased stack — eyebrow mark + role, highlighted name, studio line, status + socials
- **Chrome buttons:** translucent void panel, lucide icons, blur optional
- **Half-wheel:** SVG arc, signal fill to active spoke, stroke-only hit paths
- **Status dot:** signal pulse when available

## Do's and Don'ts

**Do**
- Keep the shared cosmos uninterrupted edge-to-edge
- Use mono for system/HUD language
- Amplify field presence when the home feels empty
- Respect reduced motion

**Don't**
- Mount a second R3F canvas over the portal field on home
- Fill emptiness with marketing cards or SVG generative fields
- Use purple/glow SaaS tropes or cream-serif editorial defaults
- Overuse signal orange

## References

- Product principles: `PRODUCT.md`
- Agent conventions: `AGENTS.md`
- Technical contracts: `docs/plan.md`
- Public origin note: `content/notes/building-the-portal.mdx`
