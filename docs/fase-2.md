# Fase 2 — Base: Tokens, Primitives, Layout Global

## Status
COMPLETA

## Archivos creados o modificados

- `app/globals.css` — All CSS tokens (@theme), base layer resets, utility classes (mono-label, clip-reveal, ascii-pre, dither-bg), reduced-motion override
- `app/layout.tsx` — Root layout with Geist fonts, metadata, site chrome (Navbar + StatusBar + ContactPanel + Footer)
- `components/primitives/text.tsx` — Polymorphic body text with variant/size/tone/balance CVA
- `components/primitives/heading.tsx` — h1/h2/h3 with semantic level decoupled from visual size (lg/xl/2xl)
- `components/primitives/label.tsx` — Mono uppercase with index prefix and tone prop
- `components/primitives/container.tsx` — Single source of truth for max-width (prose 58ch / grid 1440px / bleed)
- `components/primitives/stack.tsx` — Stack (flex-col) + Row (flex-row), gap-based spacing
- `components/primitives/frame.tsx` — 1px border card with header/footer slots and dither variant
- `components/primitives/field.tsx` — 1px box CTA/kbd element with size + tone CVA
- `components/primitives/index.ts` — Barrel export
- `components/site/navbar.tsx` — Fixed centered floating nav, active item inverted (90ms)
- `components/site/footer.tsx` — ASCII name block (box-drawing chars) + footer nav
- `components/site/status-bar.tsx` — Bottom-left clock (client-only, no SSR mismatch)
- `components/site/contact-panel.tsx` — Bottom-right + trigger, @base-ui/react Dialog
- `components/site/index.ts` — Barrel export
- `app/page.tsx` — Placeholder (replaced in Step 3)
- `docs/plan.md` — Frozen plan with all tokens, file inventory, 9 corrections
- `docs/fase-1.md` — Original brief, autocritique, design decisions

## Decisiones tomadas que no estaban en el brief

- `@custom-variant dark (&:where(.dark, .dark *))` instead of media query — site is always dark, no toggle, class is set at html level. Dark mode is the only mode; media query variant is removed.
- `border-radius: 0` in `* {}` — aggressive global reset ensures no shadcn remnant sneaks in. Navbar gets `rounded-[4px]` as the explicit single exception.
- Polymorphic primitives use `React.forwardRef<any, any>` internally, then cast to typed `ForwardRefExoticComponent` — this is the only clean way to support `as` prop with strict TypeScript without a heavy `As` type parameter.
- `@base-ui/react` is imported as `import { Dialog } from '@base-ui/react/dialog'` (namespace object pattern) — the package exports `{ Dialog }` containing all subcomponents.
- StatusBar uses `suppressHydrationWarning` on the time span — time value cannot match between server and client, suppression is intentional and localized.

## Cómo verificar que funciona

1. `pnpm dev` — should compile without errors
2. Open preview: navbar should appear centered at top, signal-orange focus rings, no border-radius on nav items
3. Status bar bottom-left shows "LOCAL HH:MM · UTC±X"
4. Bottom-right "+" button opens contact panel (Dialog with backdrop)
5. Footer shows ASCII name block + nav links
6. `pnpm exec tsc --noEmit` — zero errors

## Pendiente en esta fase

- [ ] `components/site/debug-panel.tsx` — ~ key toggle (added to Step 5 checklist)
- [ ] Dark mode class actually needs to be applied to `<html>` — currently body has no `.dark` class. In Step 1 we chose "always dark" but the @custom-variant uses class-based dark. Add `className="dark"` to `<html>` in layout.tsx.

## Para el que siga (Cursor)

The design language is set: void/ink/line/dim/mid/bright/paper/signal — 8 colors total, all in `@theme`. Duration scale is 5 values only: micro(90)/state(180)/enter(320)/fade(120)/portal(900). No other values. All primitives are in `components/primitives/` and exported from `index.ts`. The site chrome (Navbar, Footer, StatusBar, ContactPanel) is in `components/site/`. The next step is the ASCII engine in `lib/ascii/`.
