# Observatory direction

Ivo's portfolio (Ivan Bongiovanni). Brand idea: Code, Design, Explore. Underlying principle: precision in motion. The site is a quiet, monochrome observatory: editorial type and measured grids on a charcoal or warm paper ground, with the Lab experiments as the expressive artifacts. Tokens, type, layout and motion live in `docs/design.md`, generated from `lib/design-system/` by `bun run design:md`. Never edit it by hand.

## Concept

- The interface is the instrument, the experiments are what it observes. The shell stays quiet; Lab demos carry the visual experimentation.
- Mono is the measurement voice: indexes, dates, coordinates, readouts. Serif is for titles and moments. Sans is for reading.
- The home is the Gallery plate (`components/home/layouts/gallery-layout.tsx`): a sticky plate (4/12) with the dust portrait avatar (`components/lab/experiments/dust-portrait/portrait-view.tsx`, always alive: shedding, gusts, hover scatter), a live sky caption (Tucumán time, tonight's moon), the Spotify now-playing card and the social icons, and a content column (8/12) with the statement, leader rows per section from `lib/site/home-sections.ts`, the Lab as a grid of captured posters, and the signature.
- Readouts must be true. The moon renders tonight's real phase over Tucumán (`lib/sky/moon.ts`) and its readout prints the phase, illumination and age. Never print a figure that is not computed or sourced.
- The pointer can take over the light of the moon while it hovers; it eases back to tonight's phase on leave.

## Content rules

- Four areas: Work (a home section, no page of its own: there is no `/work`), Lab (`/experiments`), Skills (`/skills`), Writing (`/notes`). The header nav is Lab, Skills, Writing and System (`/design-system`). Registry (`/registry`) is secondary and lives in the footer.
- Basement Studio appears only as Ivo's employer: name, role, dates, type and link. Never its projects, code, repos or clients. `lib/github/privacy.ts` drops anything matching `basement` outside those fields. The avatar illustration shows the Basement mark on the shirt; never reuse that mark as brand iconography.
- Never invent clients, metrics or achievements. Placeholder content carries `sample: true` or a visible "Placeholder" label.
- Work rows come from `lib/site/experience.ts`. Case studies are notes with `kind: "case-study"` and show on `/notes` beside the notes. The home Writing rows show `kind: "note"` only.
- Skills come from `lib/site/capabilities.ts`: groups with tools and evidence links, never percentages. Agent Skills from `skills/` are listed below as installable evidence.
- Voice: concise, observant, calm, direct. First person in About and Writing. No hype.

## Visual rules

- Monochrome first. `signal` (blue-gray) marks state and live things: the active nav item, the active TOC entry, focus, pressed reactions, code keywords, list markers, the "Installable" badge, the construction diagonal. Never as a large fill. No saturated color, no gradients as chrome.
- Dark and light are both art-directed. Theme follows the system first, the toggle persists the choice (`next-themes`, class on `<html>`).
- Grain is one fixed low-opacity overlay in the root layout. Hairlines frame; they do not box everything.
- Geometry: circles, construction lines, framing marks, the monogram's diagonal incision. Never an omnipresent blueprint.
- Lab posters are captured images, one per theme (`public/lab/posters/<slug>-light.webp` and `<slug>-dark.webp`), shown through `components/lab/captured-poster.tsx`. The theme class picks the pair; no filter.

## Detail levels

- The footer control (`components/site/detail-control.tsx`) sets how much of the working drawing shows: Plain (no drawing marks), Guides (the two column rules of the plate layout, the default) and Measure (the rules plus the column labels, 4 / 12 and 8 / 12). The marks show from the `lg` breakpoint up. Key D cycles the levels unless focus is in a field or a modifier is held.
- The level is `data-detail` on `<html>`, stored in `localStorage` under `detail-level`. Styles read it through the `guides:` and `measure:` variants in `app/globals.css`. Content never depends on the level; it only adds or removes drawing marks.

## Page peel

- `app/layout.tsx` wraps the site in `PagePeel` (registry item `page-peel`). A folded corner at the bottom right, dragged or tapped, peels the page back to the underside (`components/underside/underside.tsx`): a working drawing of the site with the monogram, tonight's moon, Tucumán time and the latest commit subjects. Commit subjects that match `basement` are dropped (`lib/site/revision.ts`).
- Keyboard and screen-reader users reach it through the footer's "View the underside" button, and Escape closes it. Under reduced motion the fold becomes a crossfade.

## Now playing

- The plate shows what Ivo is listening to through `components/home/now-playing.tsx`, which polls `/api/now-playing` every 30 seconds. The route reads Spotify through `lib/spotify/now-playing.ts` (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`) and shows the current track, or the last one played.
- Without credentials, or with nothing to show, the card is absent. Never print a placeholder track. `/api/spotify/login` and `/api/spotify/callback` are development-only helpers that mint the refresh token; they answer 404 in production.

## Reactions

- Every experiment takes anonymous, positive-only reactions (`lib/reactions/kinds.ts`): upvote, love, fire, mind blown, learned, applause. One per visitor per kind, toggleable.
- The visitor is an httpOnly `lab_visitor` UUID cookie. No login.
- `lib/reactions/store.ts` picks Upstash Redis when `KV_REST_API_URL`/`KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`) exist, a JSON file at `.data/reactions.json` in development, and nothing in production without Redis (the API answers 503 and the bar hides itself).
- `GET/POST /api/reactions/<slug>` and `GET /api/reactions` (totals for cards).

## Monogram

`components/site/monogram.tsx` draws a capital I with one diagonal incision (`lib/site/monogram.ts`). The `small` weight widens the cut for 16–32 px. Keep it vector; never rasterize an AI image as the mark.

## 3D contract

- One shared Canvas, mounted once in `app/layout.tsx` through `SceneLayer`, renders into DOM-tracked drei Views. Never add a second Canvas on the site. Render 3D through `useViewSlot`.
- Exception: WebGPU experiments own their Canvas, because a WebGPURenderer cannot draw into the shared WebGL context. They render through `GpuStage` (`registry/ivan/components/gpu-stage/gpu-stage.tsx`), which mounts the Canvas only while the stage is in view and lets three fall back to WebGL2. Their `<Name>Scene` needs a WebGPURenderer, so it never goes through `useViewSlot`. `slime` is the only one.
- Registry experiments ship two entry points: `<Name>Scene` (scene content, no Canvas) and `<Name>` (standalone Canvas wrapper). The site renders the scene through `useViewSlot`; installers get the wrapper. The registry source never imports portfolio code.
- Views mount only near the viewport. Pause loops offscreen and under reduced motion. Provide a static poster without WebGL.

## Motion

- Microinteractions 120–240 ms, content transitions 300–650 ms, line reveals 900 ms expo-out. Animate transform and opacity.
- Headlines reveal line by line through `mask-line` + `mask-up` with `stagger-*`. Blocks rise with `rise-in` and `wait-*`. Scroll reveals use `reveal-on-view` (CSS scroll timelines only, no JS).
- Every animation collapses under `prefers-reduced-motion`. No obligatory loading sequence, no global smooth scroll library, no cursor follower.

## Engineering rules

No code comments. Server Components by default. No animation library: UI motion is CSS, scenes use the three.js frame loop. Read `node_modules/next/dist/docs/` for unfamiliar Next APIs. Before a commit, run the definition of done in `AGENTS.md`.
