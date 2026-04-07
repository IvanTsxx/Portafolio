# AGENTS.md — Portafolio

## Installed Skills (.claude/skills/)

Load these skills BEFORE writing code when the context matches:

| Skill                        | When to use                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `architect-nextjs`           | Architecture decisions for Next.js app structure, routing, or component hierarchy                                                                   |
| `better-auth-best-practices` | Anything related to authentication, sessions, or auth flows (uses better-auth)                                                                      |
| `next-best-practices`        | Writing Next.js components, pages, route handlers, or any Next.js-specific code. Has 20 sub-guides covering RSC, caching, hydration, metadata, etc. |
| `next-cache-components`      | Working with Next.js caching strategies or cache-related components                                                                                 |
| `web-design-guidelines`      | UI/UX design decisions, layout, visual hierarchy, or accessibility                                                                                  |
| `find-skills`                | When you need to discover additional skills or registries                                                                                           |

## Project Overview

Next.js 16 portfolio/blog with App Router, Tailwind CSS v4, Better Auth (GitHub), and shadcn/ui components. Deployed on Vercel with analytics.

## Commands

```
bun run dev          # Dev server with Turbopack
bun run build        # Production build
bun run start        # Start production server
bun run typecheck    # tsc --noEmit
bun run check        # ultracite check (lint + format check)
bun run fix          # ultracite fix (auto-fix lint + format)
```

**Pre-commit**: Husky runs `lint-staged` which auto-runs `bun x ultracite fix` on staged files.

## Architecture

### Directory Structure

| Path        | Purpose                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| `app/`      | Next.js App Router — route groups: `(home)/`, `(blog)/`, `(registry)/`   |
| `shared/`   | Cross-cutting code: `components/`, `hooks/`, `lib/`, `config/`, `types/` |
| `registry/` | shadcn registry source — `blocks/` and `components/` for publishing      |
| `content/`  | MDX/blog content — `thoughts/` directory                                 |
| `public/`   | Static assets                                                            |

### Key Aliases (tsconfig)

- `@/*` → project root
- `@/shared/components` → shared UI components
- `@/shared/components/ui` → shadcn/ui primitives
- `@/shared/lib` → utility functions
- `@/shared/hooks` → shared React hooks
- `@/shared/config` → site configuration

### Stack

- **Framework**: Next.js 16.1 with App Router + React 19
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **UI**: shadcn/ui (base-lyra style) + @base-ui/react
- **Auth**: better-auth with GitHub OAuth
- **Animations**: motion (Framer Motion)
- **URL state**: nuqs (type-safe search params)
- **Icons**: lucide-react
- **Fonts**: Geist (pixel triangle variant)
- **Markdown**: react-markdown + remark-gfm + gray-matter
- **Lint/Format**: Ultracite (oxlint + oxfmt)
- **Package manager**: Bun

## Important Conventions

### Next.js Patterns

- Uses **React Compiler** (`reactCompiler: true` in next.config.mjs) — don't manually memoize
- Images are **unoptimized** (`images.unoptimized: true`) — use standard `<img>` for external URLs
- Route groups `(home)`, `(blog)`, `(registry)` organize sections without URL segments
- Server Components are the default — use `"use client"` only when needed (hooks, interactivity)

### shadcn/ui Setup

- Components live in `@/shared/components/ui/`
- Registry source at `registry/` for publishing custom components
- Style: `base-lyra` with Lucide icons
- Config in `components.json`

### Styling

- Tailwind CSS v4 — no `tailwind.config.*` file, config is in CSS via `@theme`
- CSS variables for theming (see `app/globals.css`)
- `tw-animate-css` for animation utilities
- Use `cn()` from `@/shared/lib/utils` for conditional class merging

### Auth (better-auth)

- GitHub OAuth only (client ID/secret in `.env`)
- Auth URL configured in `.env` — don't hardcode URLs
- Secret: `BETTER_AUTH_SECRET` in `.env`

### Content

- Blog posts as markdown in `content/thoughts/`
- Parsed with `gray-matter` for frontmatter
- Rendered with `react-markdown` + `remark-gfm`

## Linting (Ultracite)

- Extends Ultracite's oxlint + oxfmt presets
- Several rules disabled: `func-style`, `max-statements`, `no-use-before-define`, `no-nested-ternary`, `no-negated-condition`, `complexity`, `curly`, `eqeqeq`, `no-eq-null`, `unicorn/no-array-for-each`, `nextjs/no-img-element`
- **Run `bun run fix` before committing** — pre-commit hook handles this automatically
- Print width: 80 chars, double quotes, 2 spaces, trailing commas (es5)

## Environment

Required `.env` variables:

- `GITHUB_TOKEN` — for GitHub API access
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — OAuth
- `BETTER_AUTH_SECRET` — session encryption
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` — auth base URL
- `NEXT_PUBLIC_URL` — site URL
- `GITHUB_CONTRIBUTIONS_API_URL` — external contributions API

## Testing

No test framework configured yet. If adding tests, use Vitest or the Next.js testing recommendations.


## Forms (TanStack Form + Zod)

**Always use TanStack Form (`@tanstack/react-form`) with Zod for all forms.** No react-hook-form, no manual state.

### Standard Pattern

```tsx
"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
});

export function MyForm() {
  const form = useForm({
    defaultValues: { title: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      // handle submit
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="title"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Key Rules

1. **Zod schema first** — define `formSchema` with `z.object()` at module level
2. **`validators.onSubmit`** — pass schema to `useForm({ validators: { onSubmit: formSchema } })`
3. **Render prop pattern** — use `children={(field) => ...}` on `form.Field`, NOT the function-as-child JSX pattern
4. **Invalid state** — `const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid`
5. **Always wire**: `value={field.state.value}`, `onBlur={field.handleBlur}`, `onChange={(e) => field.handleChange(e.target.value)}`
6. **Accessibility**: `data-invalid={isInvalid}` on `<Field>`, `aria-invalid={isInvalid}` on the control
7. **Errors**: `{isInvalid && <FieldError errors={field.state.meta.errors} />}`
8. **Reset**: `<Button type="button" onClick={() => form.reset()}>Reset</Button>`

### Field Type Wiring

| Control                 | Value binding                 | Change handler                                                        |
| ----------------------- | ----------------------------- | --------------------------------------------------------------------- |
| `<Input>`, `<Textarea>` | `value={field.state.value}`   | `onChange={(e) => field.handleChange(e.target.value)}`                |
| `<Select>`              | `value={field.state.value}`   | `onValueChange={field.handleChange}`                                  |
| `<Checkbox>`            | `checked={field.state.value}` | `onCheckedChange={(checked) => field.handleChange(checked === true)}` |
| `<Switch>`              | `checked={field.state.value}` | `onCheckedChange={field.handleChange}`                                |
| `<RadioGroup>`          | `value={field.state.value}`   | `onValueChange={field.handleChange}`                                  |

### Array Fields

Use `mode="array"` on the parent field. Access items via bracket notation:

```tsx
<form.Field name="emails" mode="array">
  {(field) => (
    <FieldGroup>
      {field.state.value.map((_, index) => (
        <form.Field key={index} name={`emails[${index}].address`}>
          {(subField) => {
            /* same pattern as scalar fields */
          }}
        </form.Field>
      ))}
      <Button type="button" onClick={() => field.pushValue({ address: "" })}>
        Add
      </Button>
    </FieldGroup>
  )}
</form.Field>
```

- Add: `field.pushValue(item)`
- Remove: `field.removeValue(index)`
- Zod: `z.array(z.object({...})).min(1, "At least one required")`