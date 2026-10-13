# Agent Workshop · Direction v2 (paper and ink)

Ivo's portfolio (Ivan Bongiovanni; the surname appears once, in the dossier). The visual language comes from his GitHub-profile experiment in `~/Projects/visual-taste-vault/src/components/experiments/github-profile` (and `src/components/styles/futuristic-editorial`): a technical document on paper. Small orange 3D agents (the only color) live across the page, working.

## Content rules

- Basement Studio may appear only as Ivo's employer: company name, role, dates, type, link, the `@basementstudio` company field, the `basementstudio` org badge and his avatar. Never show Basement code, projects, repos, clients or the kind of companies they work with. `lib/github/privacy.ts` drops anything matching `basement` (case-insensitive) outside those affiliation fields.
- Less text. Let animation and 3D carry the story. Labels and short lines, not paragraphs.
- The dossier lives in the home intro, inside the centered reading column: portrait, name, bio, GitHub readouts and links. Index pages (`app/(document)`) share the column and a quiet index or filter list beside it. Detail pages (`app/(detail)`: `/registry/[slug]`, `/lab/[slug]`, `/notes/[slug]`) render without it, so the surname appears nowhere on them.
- How I work and stack copy come from `lib/site/practice.ts` (Ivo's own words). Identity from `lib/site/config.ts`.
- Never invent clients, metrics or achievements. Placeholder content is labeled sample.

## Visual system

- Paper `bg-paper` / `bg-background` (#ededeb), ink `text-ink` / `text-foreground` (#111), `text-graphite`, `text-mist`, `bg-paper-deep`, hairlines `border-rule`, strong rules `border-rule-strong`. Radius 0. Paper grain on body.
- Orange `clay` is reserved for the agents. No other color except where the experiment uses vermilion sparingly.
- Type: `font-sans` is Zen Kaku Gothic New (light for big names, `display` utility). `label` utility is Geist Mono micro uppercase tracked. `jp` utility (Noto Sans JP) for Japanese annotations, a rare decoration only on route tabs and page heroes (plus the nickname kana in the home dossier); never on panel headings, filters, chips or labels. `font-wordmark` (Instrument Serif italic) only for the site wordmark.
- Vocabulary: `[ GH-03 ] LABEL ........ 06 / 06` panel headings, crosshair corner marks, hatch and hazard-stripe fills, dither imagery, tabular numbers, dotted leader rows, barcodes, REDACTED blocks.

## 3D contract

- One shared Canvas for the whole site, mounted once in `app/layout.tsx`, rendering into DOM-tracked views (drei `View`). Never a second Canvas.
- One agent on screen: the companion, 48 to 56 px tall beside the dossier sheet (on the thumb index lane when it shows). The route picks its role and action; a route change swaps the outfit with a spin, paper poof and hat toss. It follows the scroll calmly and narrates one short first-person line per section. Pages that show the rig itself (`/dev`, `/registry/agent`, `/registry/agent-stage`, `/lab/module-assembly`) keep it off; `components/scene/one-agent.test.ts` fails if any other file renders `<Agent>`.
- The companion is the actor everywhere. Section builds, figure stations, the How I work stages, the 404 stage and the Workshop fitting room register a spot (`components/scene/companion-stages.ts`); it walks there, grows to the spot's size and performs the spot's action.
- `components/scene/stage-scene.tsx`: `<StageScene stage label className />` renders props only (`components/scene/scenes/`, ids in `lib/agents/stages.ts`): one merged mesh, one instanced mesh and one shadow mesh per stage. Used by How I work (seven steps) and the not-found page (`debug`).
- Every agent reacts to hover with a reaction from a pool (wave, jump, spin, look, salute, shuffle, surprised, peek), never the same one twice in a row.
- Static, meaningful fallback when WebGL is off; reduced motion freezes poses and the companion stays put and swaps outfits without the spin.

## Engineering rules

Same as before: no code comments, Server Components by default, GSAP via `motionKit` from `lib/motion/gsap.ts`, no Playwright (agent-browser only), ultracite lint incl. sort-keys, `bun x ultracite fix`, `bun x oxlint`, `bun run typecheck`, `bun test`, `bun run build` must pass. Read `node_modules/next/dist/docs/` for unfamiliar Next APIs.
