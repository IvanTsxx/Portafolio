# Learning to Notice

> The hard part of a UI is not fixing problems — it's noticing them.

**Rule:** if the user hesitates or pauses for a second, there is probably a problem.

## Friction signals
- Double click → missing feedback or loading state.
- Hunts for an option → poor hierarchy or unclear labels.
- Undoes an action → missing feedback.
- Reads twice → confusing copy.

## What to check
- **Alignment:** icons aligned; labels on the same line.
- **Spacing:** consistent padding; uniform gaps.
- **Defaults:** `user-select: none` where it belongs; correct mobile keyboard; indicate when there is more content to scroll.

## How to test (hostile paths)
- 🐢 Slow network → loading + feedback.
- 📄 Long text → overflow + truncation.
- 📭 No data → empty state.
- ❌ Error 500 → error handling.
- ⌨️ Keyboard only → focus + navigation.
- 📱 Mobile → touch targets + responsive.

## How to report a problem
- **Break:** what happened. → "I clicked and nothing happened."
- **Expectation:** what I expected. → "I expected an immediate loading state."
- **Direction-fix:** an idea for the fix. → "Show a spinner and disable the button."

## Useful patterns
- Touch target larger than the icon.
- `tabular-nums` for tables.
- `user-select: none` on decorative elements.
- `text-wrap: pretty` for titles and paragraphs.
- Align icons and text consistently.
