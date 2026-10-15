<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Operating manual

Ivo (Ivan Bongiovanni) does not edit this repo by hand. AI agents do all the work, so every routine task below must be done by you, end to end, including the follow-up commands. Never hand a step back to Ivo.

Read before any change:

- `docs/direction.md` for content rules, chrome and the 3D contract.
- `docs/design.md` for tokens, type, layout and motion. It is generated. Never edit it by hand.

## Stack

Next.js 16 App Router, React 19, Tailwind v4, base-ui, cva + `cn`, GSAP through `lib/motion/gsap.ts`, React Three Fiber on one shared canvas, MDX content, shadcn registry, Bun for scripts and tests.

## Hard rules

- No code comments. No AI attribution in commits.
- No Playwright and no browser automation. Verify with tests, the build and the checks below.
- Paper and ink tokens only. Clay orange belongs to the companion, plus two owner-approved exceptions: the hover accent of the contribution graph and the color print inside the Super Saiyan experiment. Radius 0, no shadows, no arbitrary Tailwind values unless they are a theme token.
- Labels and short lines, not paragraphs.
- One shared WebGL canvas (`components/scene/shared-canvas.tsx`). Render 3D or shaders through `useViewSlot`. Never add a second `Canvas`.
- One agent on screen: the companion. `components/scene/one-agent.test.ts` enforces it.
- Every animation has a reduced-motion version. Animate transform and opacity only. Stop loops offscreen.
- Section builds never make content wait: 300ms per block, at most 40ms stagger, 500ms per section. Sections on screen at load and reduced motion skip the build. `lib/site/section-construction.test.ts` enforces the budget.
- Card thumbnails and posters are static markup: no `<a>`, `<button>` or `tabindex`, because the card is already a link. `components/registry-docs/thumbnails.test.tsx` and `components/lab/posters.test.tsx` enforce it.
- Server Components by default. `"use client"` only where interaction needs it.
- Basement Studio appears only as employer: name, role, dates, type and link. Never its projects, code, repos or clients. `lib/github/privacy.ts` and the career tests enforce it.
- Never invent clients, metrics or achievements. Placeholder content carries `sample: true`.
- The legal surname appears only in the home intro. Titles and metadata use "Ivo". `lib/site/naming.test.ts` enforces it.
- Japanese text only on route tabs, index page heroes and the nickname kana.

## Definition of done

Run all of these and read the output. Fix every failure before you report or commit.

```sh
bun run typecheck
bun x oxlint
bun x ultracite fix && bun x ultracite check
bun test
bun run build
bun run seo:check
```

`seo:check` reads the build output, so it runs after `bun run build`. Commit with a short imperative English message. Do not push unless asked. After any commit that adds or changes a note, experiment or registry item, run `bun run seo:dates` and commit `lib/site/route-dates.json`.

## Routine tasks

### Write or publish a note

1. Add `content/notes/<slug>.mdx` with an `export const meta = {…}`. Copy the shape of an existing note. The schema lives in `lib/content/schema.ts`: `kind: "note"` needs `date`, `summary`, `tags`; `kind: "case-study"` also needs `context`, `role`, `stack`, `responsibilities`.
2. Real notes omit `sample` or set `sample: false`. Sample notes stay noindex and out of the sitemap.
3. Point `related` only at slugs that exist. The content tests fail on broken relations.
4. Run `bun run seo:dates` after committing the note, then commit `lib/site/route-dates.json`.

### Add an experiment

1. Copy the folder pattern of `components/lab/experiments/dot-grid/`: `poster.tsx` (static server SVG), `live.tsx`, `preview.tsx`, controls from `components/lab/lab-controls.tsx`.
2. Register it in `lib/lab/experiments.ts`. Keys stay alphabetical. Give it the next free `LAB-NN` index. Topics must exist in `lib/lab/topics.ts`.
3. It shows up at `/experiments/<slug>`, on `/experiments` and on the home Experiments section with no other edits.
4. Commit, then run `bun run seo:dates` and commit the dates.

### Add or remove a registry component

1. Source goes in `registry/ivan/`, the entry in `registry.json`, and a demo with a thumbnail in `components/registry-docs/demos/<name>.tsx`. Follow an existing item such as `magnetic-button`. The thumbnail draws the component with spans and the exported `cva` variants, never the live component.
2. Run `bun run registry:build` to refresh `public/r/`.
3. Removing an item: delete its source, entry, demo, examples and `public/r/<name>.json`.
4. Commit, then run `bun run seo:dates` and commit the dates.

### Add or reorder a home section

1. Add it to `homeSections` in `lib/site/config.ts`. That list drives the heading code, the thumb-index notch and its order.
2. The section reads its heading through `homeSectionById("<id>")` and renders a `DocumentSection`, so the companion, the notches and the narration pick it up.
3. Add one narration line in `lib/site/section-scripts.ts`: first person, at most 48 characters, never repeating what is printed on screen.
4. Mark buildable blocks with `data-build-block`.

### Change tokens, utilities or design rules

1. Edit `app/globals.css` and the specs in `lib/design-system/`.
2. Every `@utility` needs an entry in `lib/design-system/specs.ts` and a preview in `components/design-system/utilities-section.tsx`.
3. Run `bun run design:md` to regenerate `docs/design.md`.

### Change GitHub data

Profile data comes from `lib/github/`. `lib/github/snapshot.json` is the offline fallback. Keep `privacy.ts` filtering intact and keep its tests passing. `lib/github/language.ts` shows Python repositories as TypeScript.

## Map

- `app/(document)`: index pages (`/`, `/notes`, `/experiments`, `/registry`, `/design-system`).
- `app/(detail)`: detail pages for notes, experiments and registry items.
- `app/markdown`, `app/llms.txt`, `app/llms-full.txt`: plain Markdown for agents. `next.config.ts` rewrites `/notes/<slug>.md`, `/experiments/<slug>.md` and `/registry/<slug>.md` to `app/markdown`. `components/site/open-in-menu.tsx` copies the Markdown or opens it in ChatGPT, Claude or Perplexity.
- `components/site`: dossier chrome (one 60rem sheet, the bound edge in `dossier-edge.tsx`, back to top floating on the bound edge), route tabs, thumb index, hero field, headings, section build.
- `components/scene`: shared canvas, companion, stages, narration, active section. `companion-placement.ts` docks the companion. On phones it peeks from the bottom right corner.
- `components/profile`: home sections in `homeSections` order. Experience is window envelopes that open on the current job (`experience/`). Repos is a cassette tower that opens on the most-starred repo, with one tape out at a time (`repositories/`). Contribution matrix is a compact contribution graph (`matrix/`).
- `components/lab`: experiments. `lib/lab`: their registry.
- `lib/site`: config, section list, narration, SEO, structured data, route dates.
- `lib/design-system`: design tokens and the `docs/design.md` generator.
