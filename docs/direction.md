# Agent Workshop · Direction v2 (paper and ink)

Ivan Bongiovanni's portfolio. The visual language comes from his GitHub-profile experiment in `~/Projects/visual-taste-vault/src/components/experiments/github-profile` (and `src/components/styles/futuristic-editorial`): a technical document on paper. Small orange 3D agents (the only color) live across the page, working.

## Content rules

- Basement Studio may appear only as Ivan's employer: company name, role, dates, type, link, the `@basementstudio` company field, the `basementstudio` org badge and his avatar. Never show Basement code, projects, repos, clients or the kind of companies they work with. `lib/github/privacy.ts` drops anything matching `basement` (case-insensitive) outside those affiliation fields.
- Less text. Let animation and 3D carry the story. Labels and short lines, not paragraphs.
- AI practice and stack copy come from `lib/site/practice.ts` (Ivan's own words). Identity from `lib/site/config.ts`.
- Never invent clients, metrics or achievements. Placeholder content is labeled sample.

## Visual system

- Paper `bg-paper` / `bg-background` (#ededeb), ink `text-ink` / `text-foreground` (#111), `text-graphite`, `text-mist`, `bg-paper-deep`, hairlines `border-rule`, strong rules `border-rule-strong`. Radius 0. Paper grain on body.
- Orange `clay` is reserved for the agents. No other color except where the experiment uses vermilion sparingly.
- Type: `font-sans` is Zen Kaku Gothic New (light for big names, `display` utility). `label` utility is Geist Mono micro uppercase tracked. `jp` utility (Noto Sans JP) for Japanese annotations next to section labels, as in the experiment (e.g. `CONTRIBUTION MATRIX 貢献行列`). `font-wordmark` (Instrument Serif italic) only for the site wordmark.
- Vocabulary: `[ GH-03 ] LABEL 日本語 ........ 06 / 06` panel headings, crosshair corner marks, hatch and hazard-stripe fills, dither imagery, tabular numbers, dotted leader rows, barcodes, REDACTED blocks.

## 3D contract

- One shared Canvas for the whole site, mounted once in `app/layout.tsx`, rendering into DOM-tracked views (drei `View`). Never a second Canvas.
- `components/scene/agent-spot.tsx`: `<AgentSpot role action edge align size />`, an absolutely positioned slot inside a `relative` card. A small agent peeks from that card edge, appears on scroll, animates its role action while visible.
- `components/scene/agent-scene.tsx`: `<AgentScene scene label className />`, a box where a full scene plays while visible. Scenes: `debugging`, `figma-to-code`, `feature`, `code-search` (`lib/agents/scenes.ts`).
- Static, meaningful fallback when WebGL is off; reduced motion freezes poses.

## Engineering rules

Same as before: no code comments, Server Components by default, GSAP via `motionKit` from `lib/motion/gsap.ts`, no Playwright (agent-browser only), ultracite lint incl. sort-keys, `bun x ultracite fix`, `bun x oxlint`, `bun run typecheck`, `bun test`, `bun run build` must pass. Read `node_modules/next/dist/docs/` for unfamiliar Next APIs.
