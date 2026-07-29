# ascii-generative-portfolio

Portfolio IB — generative ASCII engine, portal transitions, MDX notes.

## Stack

- Next.js 16 (App Router) · React 19 · Tailwind v4 · Motion · Bun
- ASCII fields via shared rAF + `<pre>` mutation
- Notes: `next-mdx-remote/rsc` + custom RSC components

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Purpose |
|-------|---------|
| `/` | Home — Horizon hero + lexicon vortex + sections |
| `/lab` | All ASCII explorations |
| `/work` | Projects |
| `/notes` | MDX writing |
| `/about` | Paper theme profile (Tucumán) |
| `/portal-test` | Portal sequence harness |
| `/` | Portal home — hold wheel → wormhole chambers |
| `~` key | Debug HUD |

## Docs

- [`docs/plan.md`](docs/plan.md) — source of truth
- [`docs/home.md`](docs/home.md) — shipping home structure
- [`docs/ascii-engine.md`](docs/ascii-engine.md) — engine contract
- [`docs/ascii-vs-svg.md`](docs/ascii-vs-svg.md) — renderer decision
- [`docs/prototype-ascii-home.md`](docs/prototype-ascii-home.md) — archived exploration notes
- [`docs/fase-*.md`](docs/) — phase notes

## Originally bootstrapped with v0

Continue on v0 if needed: [v0 project](https://v0.app/chat/projects/prj_jVWAUH421SJNfQeLpJ3yeF6TkpOd)
