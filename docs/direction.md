# Agent Workshop direction

Ivo's portfolio (Ivan Bongiovanni). The site is a technical dossier on paper with one small orange 3D companion. Tokens, type, layout and motion live in `docs/design.md`, generated from `lib/design-system/` by `bun run design:md`. Never edit it by hand.

## Content rules

- Basement Studio appears only as Ivo's employer: name, role, dates, type, link, the `@basementstudio` company field, the org badge and his avatar. Never show Basement code, projects, repos or clients. `lib/github/privacy.ts` drops anything matching `basement` outside those fields.
- Less text. Labels and short lines. Figures and the companion carry the story.
- The home intro holds the identity dossier: portrait, name, nickname kana, bio, GitHub readouts and links. The surname appears only there.
- How I work and stack copy come from `lib/site/practice.ts`. Identity comes from `lib/site/config.ts`.
- Never invent clients, metrics or achievements. Label placeholder content as sample.

## Chrome

- `components/site/dossier.tsx` wraps every page in a sheet over two backing sheets. Index pages (`app/(document)`) use the 44rem column. Detail pages (`app/(detail)`) use the wide sheet.
- Route tabs use English labels with a tiny vertical kana on desktop. Japanese appears only there, in index page heroes and in the nickname kana.
- The thumb index (`thumb-index.tsx`) shows one notch per section from `lib/site/page-sections.ts`.
- The top line holds the wordmark, back to top, ⌘K search and the GitHub star count. The back cover is the colophon.

## 3D contract

- One shared Canvas, mounted once in `app/layout.tsx`, renders into DOM-tracked views. Never add a second Canvas.
- One agent on screen, the companion, 48×56 on the rail. The route picks its role. It narrates one first-person line per section and builds sections as they scroll in.
- Section builds, figure stations, the How I work stages, the 404 stage and the Workshop register a spot in `components/scene/companion-stages.ts`. The companion walks there and performs the spot's action.
- `<StageScene>` renders props only, never an agent.
- Rig showcase routes (`/dev/agents`, `/registry/agent`, `/registry/agent-stage`) send the companion away. `components/scene/one-agent.test.ts` fails if any other file renders `<Agent>`.
- With WebGL off, show a static fallback. With reduced motion, the companion holds a key pose and swaps outfits without the spin.

## Engineering rules

No code comments. Server Components by default. GSAP through `motionKit` in `lib/motion/gsap.ts`. No Playwright. Before a commit, run `bun run typecheck`, `bun x oxlint`, `bun x ultracite check`, `bun test` and `bun run build`. Read `node_modules/next/dist/docs/` for unfamiliar Next APIs.
