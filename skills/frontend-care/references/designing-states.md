# Designing States

> A badly designed state creates doubt; a good state goes unnoticed. Don't design a button — design all of its states.

## Start with a state list
List states before building. Common: Default, Hover, Active, Focus-visible, Selected, Disabled, Loading, Empty, Error. A state you don't plan shows up later as a bug.

## State combinations
Users see several states at once: Hover+Loading, Selected+Focus, Disabled+Selected, Hover+Active. Always define which one wins.
Recommended priority: **Disabled → Loading → Focus-visible → Selection → Hover.**

## Honest states
Never lie with a state:
- Looks disabled but works.
- Looks loading but allows a double click.
- Looks saved but isn't yet.
- Looks selected when it isn't.

**Disabled UX:** instead of just disabling, show errors, explain why it's disabled, and validate as the user types. A disabled button with no explanation is frustrating.

## State transitions
How a state changes matters too. Example: Success → wait 2–3s → back to Default.

**Optimistic UI:** update the interface immediately (toggle flips before the server responds, message appears instantly, like count increments). On failure: revert the change, show the error, allow retry.

## Hover & Active
Hover must communicate interaction. If a dropdown is open, its trigger should still look active — **"open" is a state.**

## Drag
Treat drag as a global state. While dragging, the rest of the UI shouldn't react: no hover, no tooltips, no cursor changes, no highlights.

## Focus visible
Use the browser's `:focus-visible` heuristic: the ring shows for keyboard navigation and is hidden for mouse clicks on buttons/links — but text inputs, textareas, and `contenteditable` still show it on click so the user can see where they're typing. Don't force it off for everything. Check: correct border radius, always visible when it applies, no double outline, not clipped by `overflow: hidden`.

## Making states explicit (in code)
- CSS: `:hover`, `:active`, `:focus-visible`.
- HTML: `data-loading`, `data-disabled`, `data-selected`.
Explicit states keep behavior consistent and testable.
