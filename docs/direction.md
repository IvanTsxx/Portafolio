# Agent Workshop direction

Ivo's portfolio (Ivan Bongiovanni). The site is a technical dossier on paper with one small orange 3D companion. Tokens, type, layout and motion live in `docs/design.md`, generated from `lib/design-system/` by `bun run design:md`. Never edit it by hand.

## Content rules

- Basement Studio appears only as Ivo's employer: name, role, dates, type, link, the `@basementstudio` company field, the org badge and his avatar. Never show Basement code, projects, repos or clients. `lib/github/privacy.ts` drops anything matching `basement` outside those fields.
- Less text. Labels and short lines. Figures and the companion carry the story.
- The home intro holds the identity dossier: portrait, name, nickname kana, bio, GitHub readouts and links. The surname appears only there.
- How I work and stack copy come from `lib/site/practice.ts`. Identity comes from `lib/site/config.ts`.
- Never invent clients, metrics or achievements. Label placeholder content as sample.
- Clay belongs to the companion. The two exceptions are the contribution graph hover and the color print in the Super Saiyan and Vegeta experiments.

## Chrome

- `components/site/dossier.tsx` wraps every page in the same 60rem sheet (`max-w-sheet`) over two backing sheets, index and detail alike. Sections, grids, figures and heroes use the full width. Paragraphs keep the 44rem measure (`max-w-column`) or `max-w-prose`.
- The sheet's left edge is the bound strip (`dossier-edge.tsx`): punched holes in dithered toner. A press punches the nearest hole and sends a ripple. It is the only edge.
- Route tabs use English labels with a tiny vertical kana on desktop. Japanese appears only there, in index page heroes and in the nickname kana.
- The thumb index (`thumb-index.tsx`) shows one notch per section from `lib/site/page-sections.ts`. Notch numbers come from the section heading codes, and section components read their code from the same list.
- `components/scene/active-section.ts` decides the active section for the notches, the companion's rail position and its line.
- The top line holds the wordmark, ⌘K search and the GitHub star count. The back cover is the colophon.
- Notes, experiments and registry items also serve Markdown at `<path>.md`. `/llms.txt` and `/llms-full.txt` index it. The Open in menu copies the Markdown or opens it in ChatGPT, Claude or Perplexity.

## Home sections

- Experience: window envelopes. The current job opens first.
- Repos: a cassette tower. The most-starred repo opens first. One tape is out at a time. Hovering another tape nudges it 4px.
- Contribution matrix: a compact contribution graph. Its cells turn clay on hover and focus.
- Python repositories read as TypeScript (`lib/github/language.ts`).

## 3D contract

- One shared Canvas, mounted once in `app/layout.tsx`, renders into DOM-tracked views. Never add a second Canvas.
- One agent on screen, the companion, 48×56 on the rail. On phones it peeks from the bottom right corner with about two thirds of its body above the edge. There it holds still while the page scrolls and only leaves the corner for the How I work stages, the 404 stage and the Workshop. The route picks its role. It narrates one first-person line per section while that section is active and stays quiet during fast scrolls.
- Section builds are light. Blocks fade and rise 8px in 300ms, at most 40ms apart, within 500ms per section. The companion plays its build action at the first block, and content never waits for its walk. Sections on screen at load and reduced motion skip the build.
- Section builds, figure stations, the contribution graph, the How I work stages, the 404 stage and the Workshop register a spot in `components/scene/companion-stages.ts`. The companion walks there and performs the spot's action.
- `<StageScene>` renders props only, never an agent.
- Rig showcase routes (`/registry/agent`, `/registry/agent-stage`) send the companion away. `components/scene/one-agent.test.ts` fails if any other file renders `<Agent>`.
- With WebGL off, show a static fallback. With reduced motion, the companion holds a key pose and swaps outfits without the spin.

## Engineering rules

No code comments. Server Components by default. GSAP through `motionKit` in `lib/motion/gsap.ts`. No Playwright. Before a commit, run the definition of done in `AGENTS.md`. Read `node_modules/next/dist/docs/` for unfamiliar Next APIs.
