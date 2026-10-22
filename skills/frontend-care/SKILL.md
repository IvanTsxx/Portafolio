---
name: frontend-care
description: "Trigger: writing or reviewing UI/frontend code — states, hover, focus, loading, empty, error, mobile, a11y. Apply the care-first UI craft checklist, any framework."
license: Apache-2.0
metadata:
  author: "ivantsxx"
  version: "1.0"
---

# frontend-care

## Activation Contract

Load before writing OR reviewing any component, screen, or interactive element, and when reviewing a diff that touches UI, styles, or markup. Applies to any framework (React, Vue, Svelte, Astro, vanilla).

## Hard Rules

- List the states that apply to this component before writing code (see `references/designing-states.md`). Static content has no loading or error state. For a scoped fix, check only the states the change touches.
- Never lie with a state: nothing may look disabled/loading/saved/selected while behaving otherwise.
- Do not reinvent known interactions. `Enter` confirms, `Esc` closes, `Shift+Click` ranges, `Cmd/Ctrl+K` palette.
- Every interactive element gives immediate feedback and has a hit area of at least 44×44px, reached with padding or a pseudo-element without changing the element's visual size.
- Use `:focus-visible` for focus rings; never strip a ring without replacing it (see `references/designing-states.md` for its click/keyboard heuristic).
- Numbers: thousands separators, only needed precision, unit never separated from the value, `tabular-nums` in tables.
- Decorative elements use `select-none`; inputs use the correct `type`/`inputmode`; mobile inputs ≥ 16px font (use the nearest type token ≥ 16px; flag it if none exists).

## Decision Gates

| Question | Rule |
|----------|------|
| Which state wins when combined? | Disabled → Loading → Focus-visible → Selected → Hover |
| How to truncate? | Labels → end (`Name…`); files/URLs → middle (`my-proj…v3.fig`); body → wrap |
| Wrapping text? | Headings → `text-balance` (or `max-width` if long); paragraphs → `text-pretty` |
| Feedback needs the server? | Optimistic UI: update now, roll back + show error on failure |

## Execution Steps

1. List the states that apply to this component (default, hover, active, focus-visible, selected, disabled, loading, empty, error) before writing code. Static content has no loading or error state. For a scoped fix, check only the states the change touches.
2. Resolve state combinations; decide which one wins.
3. Stress-test the hostile paths: slow network, long text, empty data, error 500, keyboard-only, mobile (by reading the code when you can't run it).
4. Apply the invisible defaults and small details from the references.
5. Make states explicit in code: `:hover`/`:active`/`:focus-visible` + `data-*` attributes.
6. Run the checklist before considering the work done.

## Output Contract

- Building: the component covers every listed state and combination, with explicit CSS/`data-*` states and correct defaults.
- Reviewing: report each gap as **Break** (what happens) / **Expectation** (what should happen) / **Direction-fix** (idea), per `references/learning-to-notice.md`.

## References

- `references/learning-to-notice.md` — spotting friction, how to test, how to report.
- `references/small-details.md` — geometry, typography, numbers, touch targets, defaults, scroll.
- `references/predictability.md` — interface as contract, standard interactions, complexity.
- `references/designing-states.md` — state list, combinations, honest states, transitions.
- `references/checklist.md` — consolidated pre-ship checklist.
- `assets/cheatsheet.md` — copy-paste snippets (Tailwind, CSS, `data-*`, input types).
- `references/sources.md` — Notion source pages + last sync.
