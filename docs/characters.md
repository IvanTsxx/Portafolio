# Characters

One procedural mascot rig dressed by seven accessory kits. Everything is built from shared rounded geometry and one material table, so a new role is one module and one registry entry.

## Procedural R3F or GLB

Blender is not installed, so a GLB pipeline would have meant hand-authoring meshes with no modelling tool. Procedural geometry won on every axis that matters here.

- Fidelity. The references are rounded boxes, cylinders, domes and rings. `RoundedBoxGeometry` from three addons reproduces the clay bevels exactly. Organic shapes such as the feather in the scribe reference would need a GLB.
- Rigging. The rig is a group hierarchy (body, two arm pivots, four leg pivots, eye group), so procedural animation mutates transforms directly. A GLB would need skinning or the same hierarchy rebuilt by name.
- Performance. Geometry is cached by dimensions and materials are module singletons, so seven agents share geometries, textures and shader programs. With shadow maps gone, an agent costs about 35 draw calls (the seven-agent lineup measured 242 calls at 1440 by 900).
- Bundle. No model files, no loader, no Draco decoder. The only addition is the three addon for rounded boxes, which ships with the installed three package.
- Maintainability. Proportions live in `components/agents/rig.ts`. Changing the body width moves every anchor and accessory with it.
- Adding roles. Add the role to `lib/agents/roles.ts`, write one accessory module, and register it in `accessories/registry.ts`. The `Record<AgentRole, AccessoryKit>` type fails the build until the kit exists.

## Structure

- `rig.ts` owns proportions (body 1.25 by 1 by 1, legs 0.34 tall, eyes high on the face), anchor positions, and the `Pose` record of named scalars.
- `actions.ts` owns the `Record<AgentAction, ActionClip>` table. Each clip writes a pose for a time and names the `keyTime` used for reduced motion.
- `actions.ts` also owns `reactionClips`, one-shot hover reactions (wave, jump, spin, look, salute, shuffle, surprised, peek) with a duration and a reduced-motion key time.
- `use-agent-rig.ts` runs one `useFrame` per agent. It crossfades between the previous and current clip over 0.38 s, blends a hover reaction over the action when the pointer arrives, layers the blink, then writes transforms to refs. No React state changes per frame.
- `reaction-deck.ts` deals reactions from a shuffled deck, so an agent never repeats a reaction twice in a row.
- `materials.ts` and `textures.ts` create every material and procedural texture once (clay, glossy eye, knit, plaid, tweed, brass, steel, glass, code glow).
- `geometry.ts` caches geometry by shape and dimensions.
- `accessories/` holds one module per role plus `registry.ts`. Kits attach to anchors: `head`, `face`, `torso`, `body`, `rightArm`, `leftArm`. The left arm is mirrored, so kit authors write both arms with +x pointing outward.

## Usage

```tsx
<Agent role="debugger" action="inspect" motion="reduced" position={[0, 0, 0]} />
```

Every agent carries an invisible hit box. Hovering it sets the cursor to pointer and plays the next reaction from its deck. An agent driven from the DOM (the companion) passes its own `pointer` ref instead.

`motion` defaults to the user's reduced motion preference. In reduced mode the agent holds the clip's key pose and never blinks or bobs.

## Shared canvas

The site renders every 3D view through one Canvas. `SceneLayer` (`components/scene/scene-layer.tsx`) is mounted once in `app/layout.tsx`. It dynamic-imports `shared-canvas.tsx` only after the first slot registers and WebGL is available, so pages without 3D ship no three.js.

- `view-registry.ts` is a tiny store with no three import. It also holds companion waypoints and the elements of mounted `AgentScene`s. A DOM component calls `useViewSlot(id, ref, node)`; an IntersectionObserver marks slots near the viewport, and the canvas mounts a drei `View` (tracking the slot element) only for near slots. Offscreen slots cost nothing.
- The canvas is fixed, full viewport, `pointer-events: none`, `eventSource` on the body, `z-index: 30` (under the header). DOM overlays that must sit above a view need `z-40`.
- `frameloop` is `always` while a near slot exists and motion is allowed, and `demand` otherwise (scroll and resize invalidate). A priority 1 pass clears the buffer every frame so stale pixels never linger.
- Views supply their own camera and `ViewLights` (soft warm key, cool fill, hemisphere fill, a shared PMREM room environment at 0.38). No shadow maps: agents and props use a tinted radial blob shadow, which suits the paper background.
- Render stats are written to `document.documentElement.dataset.sceneStats` once per second (draw calls summed across all views).
- The dev lineup at `/dev/agents` (noindex) renders through the shared canvas. Query params: `action=<AgentAction>`, `role=<AgentRole>` for a solo close-up, `motion=reduced`.

Contracts:

- `Companion` (`companion.tsx`, mounted once in the root layout) renders only when an `AgentWaypoint` is registered. It is one overlay view tracking a fixed full-viewport element (priority 3, after scene views, with its own depth clear) plus a DOM hit box that follows the agent for hover and the pointer cursor. `companion-path.ts` picks the waypoint covering most of the viewport (with hysteresis) and computes the anchor: the waypoint box's bottom edge at its side, clamped between the header and the viewport bottom. `companion-motion.ts` is the per-frame state machine: walk with hops toward the anchor (faster while the page scrolls fast, leaning against scroll), spin and hop on a role change with the outfit swapped at the apex (paper confetti and the old hat tossed by `companion-effects.tsx`), shrink away while an `AgentScene` is half visible. Below 640px it sits small in the bottom right corner and only swaps. Reduced motion cuts to each waypoint and holds key poses.
- `AgentScene` (`agent-scene.tsx`) renders one of four dioramas in `scenes/`, each an 8 s loop driven by one `useFrame` and refs. Agents switch actions through `actionRef` without React state.
- Both show a static fallback when WebGL is missing; reduced motion holds a key pose and stops the loop.

## Held props

Kits can read the live action through `useAgentLive` and re-aim props with `useHeldPose(rest, poses)`. A pose's `facing` is a body-relative yaw, so a prop held in a swinging arm still faces the camera (clipboard, tape measure, magnifier, tablet). The builder stows its laptop while carrying or walking; the architect's tape blade extends with the `measure` clip.

## Known gaps

- Accessories are separate meshes, so draw calls scale with kit detail (roughly 40 per agent with shadows). Merging static kit parts per material would cut that if a scene needs dozens of agents.
- The scribe kit (beret with feather) from the references is not a role yet.
- Poses without a `facing` entry still follow the arm, so actions other than each prop's signature can show it at an awkward angle.
- The companion anchors to the waypoint box. With the default `inset-0` box it stands in the section's bottom corner, which can touch text in sections without bottom padding. Narrow the box with `className` where that happens.
