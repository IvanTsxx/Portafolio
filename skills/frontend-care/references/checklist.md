# frontend-care — Pre-ship Checklist

Run before considering any UI work done.

## States
- [ ] Did I list every state?
- [ ] Is there an Empty state? An Error state? A Loading state?
- [ ] Hover+Loading, Disabled+Selected — which state wins?
- [ ] Does the visual state reflect reality (no lying)?
- [ ] Immediate feedback on every action?
- [ ] Rollback on failure (optimistic UI)?
- [ ] Does "open" behave as a state?
- [ ] Does drag disable hover and tooltips?
- [ ] Does focus follow `:focus-visible` (keyboard on buttons/links, click too on text inputs)?
- [ ] `:hover`/`:active`/`:focus-visible` used where they belong?
- [ ] App states represented with `data-*`?

## Geometry
- [ ] Do nested border radii look natural?
- [ ] Are icons optically centered?

## Typography
- [ ] Numbers use `tabular-nums`?
- [ ] `text-pretty` on paragraphs?
- [ ] `text-balance` only on headings?
- [ ] Truncation choice makes sense (end vs middle vs wrap)?

## Numbers
- [ ] Thousands separators?
- [ ] Only the needed precision?
- [ ] Number and unit never separated?

## Interaction & standards
- [ ] Large touch targets (≥ 44px)?
- [ ] Whole label clickable, no dead zones?
- [ ] Obvious where to click?
- [ ] Uses known patterns — `Enter` confirms, `Esc` closes, standard shortcuts?
- [ ] Same components behave the same across screens?

## Defaults
- [ ] Decorative elements use `select-none`?
- [ ] Inputs use the correct `type`/`inputmode`?
- [ ] Mobile inputs ≥ 16px?
- [ ] Videos use `playsinline`?
- [ ] Is it clear there's more content to scroll?

## Testing (hostile paths)
- [ ] Slow network, long text, empty data, error 500, keyboard-only, mobile (by reading the code when you can't run it).
