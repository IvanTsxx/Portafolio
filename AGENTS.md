# AGENTS.md — Portafolio

## Installed Skills

Load these BEFORE writing code when context matches:

| Skill                         | When to use                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| `bun`                         | Building, testing, deploying JS/TS apps                      |
| `oxlint`                      | Linting with oxlint, fixing lint errors, configuring rules   |
| `shadcn`                      | Adding, searching, fixing, styling shadcn/ui components      |
| `next-best-practices`         | Writing Next.js components, pages, route handlers            |
| `next-cache-components`       | Next.js caching strategies, cache directives                 |
| `architect-nextjs`            | Next.js architecture decisions, component placement, routing |
| `better-auth-best-practices`  | Authentication, sessions, better-auth configuration          |
| `tailwind-v4-shadcn`          | Tailwind CSS v4 with shadcn/ui, dark mode, theme switching   |
| `tailwind-css-patterns`       | Tailwind utility styling, responsive design, layouts         |
| `web-design-guidelines`       | UI/UX design decisions, layout, accessibility                |
| `frontend-design`             | Creating production-grade frontend interfaces                |
| `accessibility`               | WCAG 2.2 compliance, screen reader, keyboard navigation      |
| `seo`                         | Search engine optimization, meta tags, structured data       |
| `vercel-react-best-practices` | React/Next.js performance optimization                       |
| `vercel-composition-patterns` | React composition patterns, compound components              |
| `typescript-advanced-types`   | TypeScript generics, conditional types, utility types        |
| `theme-factory`               | Styling artifacts with pre-set themes or generating new ones |
| `brand-guidelines`            | Applying Anthropic brand colors and typography               |
| `find-skills`                 | Discovering and installing additional agent skills           |
| `threejs-fundamentals`        | Three.js scene setup, cameras, renderer                      |
| `threejs-geometry`            | Three.js geometry creation, BufferGeometry                   |
| `threejs-materials`           | Three.js materials, PBR, shader materials                    |
| `threejs-lighting`            | Three.js lighting, shadows, environment                      |
| `threejs-animation`           | Three.js keyframe, skeletal, morph target animation          |
| `threejs-loaders`             | Three.js asset loading, GLTF, textures                       |
| `threejs-interaction`         | Three.js raycasting, controls, user input                    |
| `threejs-shaders`             | Three.js GLSL, custom shaders                                |
| `threejs-textures`            | Three.js textures, UV mapping, environment maps              |
| `threejs-postprocessing`      | Three.js post-processing, bloom, DOF                         |

## Commands

```bash
bun run dev          # Dev server with Turbopack
bun run build        # Production build
bun run start        # Start production server
bun run typecheck    # tsc --noEmit
bun run check        # ultracite check (lint + format)
bun run fix          # ultracite fix (auto-fix lint + format)
bun run db:studio    # Prisma Studio
bun run registry:build  # Build shadcn registry
```

**Pre-commit**: Husky runs `lint-staged` → `bun x ultracite fix`

## Architecture

| Path                | Purpose                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| `app/`              | Next.js App Router — route groups: `(home)/`, `(blog)/`, `(registry)/` |
| `shared/`           | `components/`, `hooks/`, `lib/`, `config/`, `types/`                   |
| `registry/`         | shadcn registry source for publishing                                  |
| `content/thoughts/` | MDX blog posts                                                         |

**Aliases**: `@/*` → root, `@/shared/components` → UI, `@/shared/lib` → utils

## Key Conventions

- **React Compiler**: `reactCompiler: true` — don't manually memoize
- **Images**: unoptimized — use standard `<img>` for external URLs
- **Server Components**: default — `"use client"` only when needed
- **Tailwind v4**: no config file, use `@theme` in CSS
- **Auth**: better-auth with GitHub OAuth only (env: `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`/`SECRET`)
- **Forms**: TanStack Form + Zod only (see full pattern in source)

## Linting

- Ultracite (oxlint + oxfmt)
- Run `bun run fix` before committing
- Print width: 80, double quotes, 2 spaces, trailing commas (es5)

## Env Required

```
GITHUB_TOKEN, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_BETTER_AUTH_URL
NEXT_PUBLIC_URL, GITHUB_CONTRIBUTIONS_API_URL
```

## Testing

No test framework configured.
