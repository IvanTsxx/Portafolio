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

Next.js 16.4 App Router with Cache Components and Partial Prefetching, React 19, Tailwind v4, base-ui, cva + `cn`, next-themes for dark and light, React Three Fiber on one shared canvas (WebGPU for the slime experiment), MDX content, shadcn registry, Agent Skills in `skills/`, Upstash Redis for reactions, the Spotify Web API for the now-playing card, Bun for scripts and tests. There is no animation library: UI motion is CSS, scenes run on the three.js frame loop.

## Hard rules

- No code comments.
- Ivo is the only author and contributor. Never attribute anything in git or GitHub to an AI tool: no `Co-Authored-By` trailers, no "Generated with" lines, no bot authors, in commits, PR titles, PR bodies, comments or tags. Claude, v0, Cursor, Copilot and every other agent stay out of the contributor list. `.githooks/commit-msg` rejects these trailers and `.claude/settings.json` turns off Claude Code attribution; never bypass them with `--no-verify`.
- Verify visual and interactive changes in a real browser with `agent-browser` (dark and light, 1440 and 390 wide), on top of tests, the build and the checks below. No Playwright test suites.
- Semantic tokens only (`background`, `foreground`, `surface`, `muted-foreground`, `faint`, `border`, `border-strong`, `signal`, `focus`), defined for `:root` (light) and `.dark` in `app/globals.css`. Monochrome first; `signal` is rare. The only color exceptions are the color print inside the Super Saiyan and Vegeta experiments and the green of the Slime experiment. No shadows, no arbitrary Tailwind values unless they are a theme token or utility.
- Short, concrete copy. Labels in mono, titles in the serif, reading text in the sans.
- One shared WebGL canvas (`components/scene/shared-canvas.tsx`). Render 3D or shaders through `useViewSlot`. Never add a second `Canvas`. The one exception is a WebGPU experiment, which cannot share a WebGL context: it owns its Canvas through `registry/ivan/components/gpu-stage/gpu-stage.tsx`, mounted only while in view (`slime`).
- Every animation has a reduced-motion version. Animate transform and opacity only. Stop loops offscreen.
- Motion never makes content wait or hides it from no-scroll readers: reveals are CSS (`rise-in`, `mask-up`, `reveal-on-view`) and collapse under reduced motion.
- Card thumbnails and posters are static markup: no `<a>`, `<button>` or `tabindex`, because the card is already a link. `components/registry-docs/thumbnails.test.tsx` and `components/lab/posters.test.tsx` enforce it.
- Server Components by default. `"use client"` only where interaction needs it.
- React Compiler is on. Never write `useMemo`, `useCallback` or `memo` in `app`, `components` or `lib`. `registry/` keeps them, because installers may not run the compiler. `lib/site/react-compiler.test.ts` enforces it.
- Cache Components is on. Never export `dynamic`, `revalidate`, `fetchCache` or `dynamicParams`. Remote data goes through a `"use cache"` function with `cacheLife`, like `getGithubProfile`. The request-time exceptions are the routes under `app/api` (`now-playing`, `reactions`, the dev-only `spotify`), which read the request and set their own `Cache-Control`; no page waits on them. Files from the repo (MDX, `globals.css`, registry source, fonts) are read with sync `node:fs`, so routes stay prerendered. A `"use cache"` function that calls `cacheLife` cannot run under `bun test`; keep the tested logic in a plain function and wrap it.
- Partial Prefetching is on. Links prefetch the route's shared shell. Every dynamic route lists its params in `generateStaticParams`; unknown slugs call `notFound()`.
- Basement Studio appears only as employer: name, role, dates, type and link. Never its projects, code, repos or clients. `lib/github/privacy.ts` and the career tests enforce it.
- Never invent clients, metrics or achievements. Placeholder content carries `sample: true`.
- The legal name is read only by the home signature (`components/site/signature.tsx`), which prints the first name. Titles and metadata use "Ivo". `lib/site/naming.test.ts` enforces it.

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

`seo:check` reads the build output, so it runs after `bun run build`. Commit with a short imperative English message. Do not push unless asked. After any commit that adds or changes a note, experiment, registry item or skill, run `bun run seo:dates` and commit `lib/site/route-dates.json`.

## Routine tasks

### Write or publish a note

1. Add `content/notes/<slug>.mdx` with an `export const meta = {…}`. Copy the shape of an existing note. The schema lives in `lib/content/schema.ts`: `kind: "note"` needs `date`, `summary`, `tags`; `kind: "case-study"` also needs `context`, `role`, `stack`, `responsibilities`.
2. Real notes omit `sample` or set `sample: false`. Sample notes stay noindex and out of the sitemap.
3. Point `related` only at slugs that exist. The content tests fail on broken relations.
4. Run `bun run seo:dates` after committing the note, then commit `lib/site/route-dates.json`.

### Add an experiment

1. Copy the folder pattern of `components/lab/experiments/lunar-dither/`: `poster.tsx` (a `CapturedPoster` of the slug), `live.tsx` (client-only dynamic loader), `preview.tsx` (the live stage), controls from `components/lab/lab-controls.tsx`. Add the poster pair `public/lab/posters/<slug>-light.webp` and `<slug>-dark.webp`, captured from the live stage in each theme.
2. Register it in `lib/lab/experiments.ts`. Keys stay alphabetical. Give it an `LAB-NN` index above the highest one in use. Topics must exist in `lib/lab/topics.ts` (`Motion`, `WebGL`, `WebGPU`, `Shader`, `Image`); add a topic there only when an experiment uses it. If it is reusable, make it installable: put the source in `registry/ivan/components/<name>/` with a `<Name>Scene` (no Canvas) and a standalone `<Name>` wrapper, add the registry item, set `registryItem` on the experiment, and render the scene on the site through `useViewSlot`. Follow `lunar-dither`. Verify the install in a clean consumer app.
3. It shows up at `/experiments/<slug>`, on `/experiments` and on the home Lab section with no other edits.
4. Commit, then run `bun run seo:dates` and commit the dates.

### Add or remove a registry component

1. Source goes in `registry/ivan/`, the entry in `registry.json`, and a demo with a thumbnail in `components/registry-docs/demos/<name>.tsx`. Follow an existing item such as `magnetic-button`. The thumbnail renders a static face of the component (`MagneticButtonFace`), plain spans or the experiment's captured poster, never the live component. Examples that need the site's shared canvas import a `<name>-view.tsx` shim from the demos folder; add the matching line to `docsShimRewrites` in `lib/registry/installed.ts` so the install tab shows the real import.
2. Run `bun run registry:build` to refresh `public/r/`.
3. Removing an item: delete its source in `registry/ivan/components/<name>/` (or `ui/`), its examples in `registry/ivan/examples/<name>/`, its `registry.json` entry (rewrite the JSON with a script, then `bun x oxfmt registry.json`), its demo and `<name>-view.tsx` shim in `components/registry-docs/demos/`, its line in `docsShimRewrites`, `public/r/<name>.json`, and any copy that names it (`lib/site/seo.ts`). Keep shared hooks and libs in `registry/ivan/hooks` and `registry/ivan/lib` that other items still import. Then run `bun run registry:build`.
4. Commit, then run `bun run seo:dates` and commit the dates.

### Add or update a skill

1. Add `skills/<name>/SKILL.md`. Frontmatter needs `name` (equal to the folder name, kebab case) and `description`. `license` and `metadata.author`/`metadata.version` are optional; quote the version (`"1.0"`).
2. Supporting files go in `references/` and `assets/` inside the folder. Private notes go in `*.local.md`: git-ignored, never read by the site.
3. `lib/skills/skills.ts` reads the folder at build time and throws on missing or invalid frontmatter. `/skills`, `/skills/<name>`, `/skills/<name>.md`, search, the sitemap and `llms.txt` update with no other edits.
4. Visitors install with `npx skills add IvanTsxx/Portafolio --skill <name>`. Check discovery with `npx skills add ./ --list`.
5. The formatter skips `skills/**`, so the Markdown stays as written.
6. Commit, then run `bun run seo:dates` and commit the dates.

### Add or reorder a home section

1. Add its data to `getHomeSections` in `lib/site/home-sections.ts` (id, label, facts, rows, moon phase). Sections render in that order through `components/home/layouts/gallery-layout.tsx`, which gives `lab` its poster grid and every other id leader rows.
2. Add the same id, an index and a label to `homeSections` in `lib/site/config.ts`, so the search palette links to the anchor. `lib/search/entries.test.ts` checks that the id exists in `lib/site/home-sections.ts`.
3. Keep section content in `components/home/`.

### Change tokens, utilities or design rules

1. Edit `app/globals.css` and the specs in `lib/design-system/`.
2. Every token and `@utility` needs an entry in `lib/design-system/specs.ts`, and the site must use it. Remove what nothing uses. `lib/design-system/usage.test.ts` fails on a documented token, utility, component or spacing step that no file under `app`, `components`, `lib`, `hooks`, `content` or `registry` references.
3. Run `bun run design:md` to regenerate `docs/design.md`.

### Change GitHub data

Profile data comes from `lib/github/`, read through `getGithubProfile` in `lib/site/github-profile.ts`. Today the site uses it for the avatar (`app/avatar/route.ts`, with `public/profile/portrait.jpg` as fallback) and the structured-data image. `GITHUB_TOKEN` in `.env.local` enables the live fetch; `lib/github/snapshot.json` is the offline fallback, refreshed with `bun lib/github/write-snapshot.ts`. Keep `privacy.ts` filtering intact and keep its tests passing. `lib/github/language.ts` shows Python repositories as TypeScript.

### Set up Spotify now playing

1. Create a Spotify app with the redirect URI `http://[::1]:3000/api/spotify/callback` and put `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env.local`.
2. With the dev server running, open `/api/spotify/login`, approve the scopes (`user-read-currently-playing`, `user-read-recently-played`) and copy the `SPOTIFY_REFRESH_TOKEN` line that `/api/spotify/callback` prints. Both routes answer 404 outside development.
3. Put the three variables in `.env.local` and in the Vercel project env, then restart the dev server.
4. Without them `/api/now-playing` answers 503 and `components/home/now-playing.tsx` hides the card. With them it polls every 30 seconds and shows the current track, or the last one played.

### Change reactions

Kinds and labels live in `lib/reactions/kinds.ts`. `lib/reactions/store.ts` picks the store: Upstash Redis when `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`) exist, a JSON file at `.data/reactions.json` (git-ignored) in development, and no store in production without Redis, which makes the API answer 503 and the bar hide itself. The visitor is an httpOnly `lab_visitor` cookie.

## Map

- `app/(document)`: index pages (`/`, `/notes`, `/experiments`, `/registry`, `/skills`, `/design-system`). `/experiments` is labelled Lab and `/notes` Writing. There is no `/work` page: Work is a home section fed by `lib/site/experience.ts`. `/design-system/design.md` serves `docs/design.md`.
- `app/(detail)`: detail pages for notes, experiments, registry items and skills.
- `app/api`: `reactions` (`GET /api/reactions`, `GET` and `POST /api/reactions/<slug>`), `now-playing` (Spotify), and the development-only OAuth helpers `spotify/login` and `spotify/callback`. `app/avatar/route.ts` serves the GitHub avatar with a local fallback.
- `app/markdown`, `app/llms.txt`, `app/llms-full.txt`: plain Markdown for agents. `next.config.ts` rewrites `/notes/<slug>.md`, `/experiments/<slug>.md`, `/registry/<slug>.md` and `/skills/<slug>.md` to `app/markdown`, and redirects `/lab` to `/experiments`. `components/site/open-in-menu.tsx` copies the Markdown or opens it in ChatGPT, Claude or Perplexity.
- `app/layout.tsx`: wraps the site in `PagePeel` (`registry/ivan/components/page-peel/`), whose underside is `components/underside/underside.tsx`, a working drawing of the site with tonight's moon, Tucumán time and the recent commits from `lib/site/revision.ts` (`next.config.ts` injects `NEXT_PUBLIC_GIT_SHA` and `NEXT_PUBLIC_GIT_LOG`). The footer carries a keyboard trigger, "View the underside".
- `components/site`: chrome. `site-header.tsx` (monogram, `site-nav.tsx` primary nav, search, theme toggle, mobile menu), `site-footer.tsx`, `detail-control.tsx` (the Plain, Guides and Measure detail levels, key D), `plate-page.tsx` (the 4/12 plate and 8/12 column with its guides), `social-links.tsx`, `signature.tsx`, `page-frame.tsx`, `document-hero.tsx`, `document-section.tsx`, `monogram.tsx`, `theme-provider.tsx`.
- `components/home`: home sections. `layouts/gallery-layout.tsx` (the home), `home-figures.tsx` (portrait plate, statement), `rows.tsx` (section marks and leader rows), `sky-caption.tsx` with `local-time.tsx` and `moon-readout.tsx` (`useMoonReading`), `now-playing.tsx` (Spotify card), `moon-poster.tsx`. Home data comes from `lib/site/home-sections.ts`.
- `components/scene`: shared canvas, view registry, WebGL support.
- `components/lab`: experiments. `lib/lab`: their registry (`experiments.ts`), topics (`topics.ts`) and the copy-paste agent prompts (`prompts.ts`). The experiments are `dust-portrait`, `lunar-dither`, `orbit-dust`, `signal-tear`, `slime` (WebGPU), `speed-smear`, `super-saiyan` and `vegeta`. Posters are captured images in `public/lab/posters/`.
- `registry/ivan`: installable registry source. Never imports portfolio code. Items: `magnetic-button`, `dither-image`, `page-peel`, `lunar-dither`, `orbit-dust`, `signal-tear`, `speed-smear`, `storm-print`, `blast-print`, `dust-portrait`, `slime`. `components/registry-docs` renders their docs and demos, `lib/registry` loads them.
- `lib/reactions`, `app/api/reactions`, `components/reactions`: anonymous experiment reactions.
- `lib/spotify`: `now-playing.ts` (token refresh, current and last played track) and `auth.ts` (redirect URI, scopes and authorize URL for the development OAuth helpers).
- `lib/sky`: moon phase math. `lib/site/capabilities.ts`: skills data. `lib/site/experience.ts`: work rows.
- `lib/search`, `components/command`: the search palette (`Cmd+K`, `Ctrl+K`, `/`).
- `skills/`: Agent Skills, one folder each. `lib/skills`: loader and install commands. `components/skills`: list, install block, rendered body, file list.
- `lib/site`: config, SEO, structured data, route dates, revision.
- Brand and icons: the monogram is `components/site/monogram.tsx` over the geometry in `lib/site/monogram.ts`. `app/icon.svg` (adapts to the browser's light or dark scheme), `app/favicon.ico` (regenerate with `bun run brand:favicon`), `app/apple-icon.tsx` and `app/pwa-icon/[size]` (manifest icons) are drawn from it by `lib/site/icon-mark.tsx`. Social images are `opengraph-image.tsx` files that call `renderOgImage` in `lib/content/og-image.tsx`. `lib/site/print-colors.ts` mirrors the dark tokens for the icons and manifest, and `print-colors.test.ts` keeps them in sync. Its `nightColors` export maps the dark tokens onto the OG palette, so OG images render in the dark theme.
- `lib/design-system`: design tokens and the `docs/design.md` generator.
