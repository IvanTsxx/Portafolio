# Small Details That Add Up

> UI quality is the sum of hundreds of small details. Alone they don't matter; together they make an interface feel cared for.

## Geometry

### Nested border radius
`inner radius = outer radius − gap`. Example: outer 16px, gap 4px → inner 12px. If the gap ≥ the outer radius, the inner element needs no radius. Identical radii look too round to nest.

### Optical alignment
Don't always center mathematically. Play icon → nudge right; check icon → nudge down.

## Typography
- **`tabular-nums`** — equal-width digits so columns stay aligned. Tables, dashboards, prices, stats.
- **`text-pretty`** — avoids a single orphan word at the end of a paragraph. Paragraphs, descriptions.
- **`text-balance`** — balances lines for even headings. Headings, hero, cards. For long text prefer `max-width` over `text-balance` to avoid a column effect.
- **Truncation:** body → wrap; labels → end (`Product Name…`); files/URLs → middle (`my-project…design.fig`).
- **Icon + multi-line text:** don't use `align-items: center`; align the icon to the first line of text.

## Numbers
- Formatting: use separators → `1,000,000`, not `1000000`.
- Rounding: only the needed precision. Dashboard `52.4%`, not `52.38472%`; billing `10.30`, not `10.3`.
- Number + unit: never split → `10 MB` on one line.

## Touch targets
- Recommended area 44×44px; the clickable area may exceed the visible element.
- Clickable labels: the whole checkbox label (and the gap between box and text) must be clickable — no dead zones.

## Invisible defaults
- `select-none` on SVGs, icons, drag handles, decorative buttons.
- Correct input types: `type="email"`, `type="tel"`, `inputmode="numeric"` → right mobile keyboard.
- Mobile inputs ≥ 16px font-size to avoid iOS Safari auto-zoom.
- `playsinline` on video to stop Safari going fullscreen.

## Scroll & overflow
The UI must communicate that there is more content: partially visible last item, gradient at the scroll edge, consistent overscroll background.

## Micro consistency
Identical components behave identically (dropdowns, inputs, validation, sidebars, menus). Consistency builds trust.
