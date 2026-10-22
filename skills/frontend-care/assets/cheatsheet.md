# frontend-care — Cheatsheet

Copy-paste snippets. Tailwind utility → what it does (Tailwind v3.4+ / v4).

## Typography
- `tabular-nums` — equal-width digits (tables, prices, stats).
- `text-pretty` — no orphan word at a paragraph's end (`text-wrap: pretty`).
- `text-balance` — even heading lines (`text-wrap: balance`; headings only — use `max-width` for long text).

## Defaults
- `select-none` — decorative elements (SVG, icons, drag handles).
- `<video playsinline>` — stop iOS Safari from going fullscreen.
- Mobile inputs: `font-size: 16px` minimum (avoids iOS auto-zoom).

## Correct inputs
```html
<input type="email">
<input type="tel">
<input inputmode="numeric">
```

## State variants (Tailwind)
```html
<button class="hover:bg-neutral-800 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">…</button>
```
`focus-visible:` follows the UA heuristic: keyboard nav on buttons/links; text inputs also match on click. Never remove a ring without replacing it.

## Explicit app states (HTML)
```html
<button data-loading>…</button>
<button data-disabled>…</button>
<li data-selected>…</li>
```

## Nested border radius
```
inner-radius = outer-radius − gap
/* outer 16, gap 4 → inner 12 */
```

## Middle truncation (files / URLs)
```
my-project-final…design.fig
```
Split the string, keep head + tail, put the ellipsis in the middle in JS — CSS `text-overflow: ellipsis` only truncates at the end.

## State priority (when combined)
```
Disabled > Loading > Focus-visible > Selected > Hover
```
