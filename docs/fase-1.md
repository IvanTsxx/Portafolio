# Fase 1 — Plan, Design Decisions, Autocrítica

## Status
COMPLETA (planning phase — no code)

## Original Brief Summary

Portfolio site for a senior frontend developer specializing in generative systems and agent tooling. Key requirements:
- Generative ASCII background system (phyllotaxis + other fields) driven by rAF
- Portal transition on navigation (900ms, ASCII scramble → page paint)
- Monochrome + one accent (#FF4D00 signal red-orange) aesthetic
- Geist Sans + Geist Mono, sharp corners (0px radius), editorial density
- References: basement.studio, Evil Rabbit, Vercel.com

## Design Decisions

### 1. Color: Monochrome void with single accent
**Decision:** 7 grays from #050505 → #EDEDED + one warm white for /about + one accent (#FF4D00).
**Why:** More than one accent dilutes signal. The portfolio subject is not color — it's structure, type, and motion.

### 2. Typography: Geist ecosystem only
**Decision:** Geist Sans for display + UI; Geist Mono for labels, stats, ASCII pre content.
**Why:** Both fonts are designed to coexist. Geist Mono's metrics align perfectly with Geist Sans at matching sizes, which means mixed-mode lines (label + value) work without optical correction.

### 3. Border radius: 0px everywhere except one 4px exception
**Decision:** `border-radius: 0` globally via `* { border-radius: 0 }` in base layer. Navbar gets `rounded-[4px]` as the single exception.
**Why:** Sharp corners are the grammar of the terminal and the grid. One soft exception on the floating navbar creates depth without breaking the rule.

### 4. Primitives over shadcn defaults
**Decision:** Built Text, Heading, Label, Container, Stack, Row, Frame, Field from scratch.
**Why:** shadcn defaults carry rounded corners, blue accents, and a visual language incompatible with this aesthetic. These primitives are ~60 LOC each, typed via CVA, and own their contract.

### 5. No dark mode toggle
**Decision:** Site is always dark. `color-scheme: dark` only.
**Why:** The ASCII rendering, the void background, and the signal accent only work in dark context. A light mode would require a fundamentally different design.

### 6. Layout primitives as vocabulary
**Decision:** Container (max-w), Stack (flex-col), Row (flex-row), Section are the only spacing primitives.
**Why:** Eliminates margin-based spacing drift. Every gap is explicit via `gap-*`. The design spec should be readable from component structure alone.

## Autocrítica del Plan Original

1. Duration scale had 9 values → consolidated to 5 (see corrections).
2. `useAsciiField` had a contradictory contract (string return + "no rerender") → fixed to ref mutation model.
3. Phyllotaxis algorithm was O(cols×rows×N) per frame → fixed to precalculated buffer.
4. Scramble on h1 was a mistake → clip reveal is better for LCP + semantics.
5. Canvas branch was half-specified → deferred cleanly with documented MAX_CELLS tope.
6. MDX pipeline had zero ROI for one article → typed block array instead.
7. OKLCH values needed conversion verification → hex as source of truth.
8. Documentation framing had unjustifiable framework comparisons → rewrote to "chose Motion because…".
9. Missing items: debug panel, mulberry32, staticFrame(), portal cancel on double-nav.

## Technology Choices

- **Animation library:** `motion` (motion/react). Chosen because:
  - Need `AnimatePresence` for portal exit/enter orchestration
  - Need retargetable animations (interruption: user navigates before portal completes)
  - CSS alone cannot express the portal exit + pre-scramble + crossfade sequence
  - `useAnimate` for fine-grained programmatic control during the 900ms sequence
- **Scroll:** CSS `overflow-y: auto` on body. No scroll jacking.
- **State:** No state management library. `useReducer` + context for portal state.
- **Database:** None. Static portfolio. No auth.

## Notes for Cursor

The aesthetic decision that governs everything: **restraint in decoration, boldness in one place**. The "one place" is the portal transition. Everything else should feel like a terminal — functional, exact, without personality trying too hard. Resist the temptation to add hover effects, gradients, or motion to secondary elements. The site should work without animation. Animation is an enhancement, not structure.
