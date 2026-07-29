# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary visitors: developers, design-engineering peers, and studio-adjacent folks evaluating craft. Secondary: recruiters / hiring managers scanning identity and proof. Tertiary: agents (LLM tools, scrapers, structured readers) that consume the same surface — agent-readable status and copy are first-class, not an afterthought.

Situation: landing on a personal portfolio to judge whether the work is serious, distinctive, and shippable.

## Product Purpose

A generative portfolio for Ivan Bongiovanni (frontend at basement studio). The site demonstrates craft through a persistent ASCII WebGL cosmos and portal navigation — the medium is the proof. Success on the home viewport: the visitor feels the system is the portfolio, not a backdrop behind marketing copy.

## Positioning

A shared infinite ASCII field that every route floats over, with wormhole travel between chambers — not a conventional scroll-marketing portfolio with decorative gradients. Generative density is brand identity; neighboring portfolios cannot truthfully claim the same persistent cosmos + portal shell.

## Operating Context

- Local / production Next.js App Router site (`bongi.dev`)
- Portal shell: persistent `AsciiWorld` canvas, half-wheel nav, theme + sound chrome
- Routes: home, work, notes, lab, about; local “open” chamber on home
- Dev: Bun + `bun dev` (Next 16)

## Capabilities and Constraints

- Live generative fields stay on the ASCII / WebGL cosmos path; SVG is for static marks only (see `docs/ascii-vs-svg.md`)
- Do not cover the infinite canvas with a second competing WebGL scene on home
- Reduced-motion paths must exist for travel / ripples / entrance motion
- Lexicon vortex (R3F spiral) exists as a legacy Horizon exception — not the portal home companion by default
- Home constellation: catch glyphs pulse the shared cosmos (`pulseRipple`); no chamber nav; positions reshuffle per load, never over hero

## Brand Commitments

- Name: Ivan Bongiovanni / handle ivantsx / brand mark IB
- Studio: basement studio
- Place: Tucumán, AR
- Voice: terminal-adjacent, precise, low chrome; craft over pitch
- Binding visual constraint (confirmed): the cosmos field is the first-viewport artifact; UI recedes

## Evidence on Hand

- Identity + lexicon: `content/identity.ts`
- Portal home: `components/home/portal/portal-home.tsx`
- Cosmos: `components/home/portal/gl/ascii-world.tsx`
- Design decisions: `docs/home.md`, `docs/ascii-vs-svg.md`
- No fabricated testimonials or client logos beyond real CV in identity/content

## Product Principles

1. The field is the product — never hide or replace the shared cosmos with competing spectacle.
2. One surface, two audiences — readable to people and to agents without parallel UIs.
3. Density with restraint — fill emptiness by amplifying the system, not by stacking marketing blocks.
4. Terminal vocabulary — mono labels, signal accent, void depth; rarity of accent is the point.
5. Prove by shipping surfaces — Lab holds experiments; Home stays coherent.

## Accessibility & Inclusion

Honor `prefers-reduced-motion` for portal travel, ripples, and entrance animations. Maintain readable contrast of copy over the glyph field (glyph gain / dim tokens). Keyboard access to wheel and primary actions.
