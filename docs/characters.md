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
- `use-agent-rig.ts` runs one `useFrame` per agent. It crossfades between the previous and current clip over 0.38 s, layers the focus reaction (yaw toward the camera, lean, a short hop) and the blink, then writes transforms to refs. No React state changes per frame.
- `materials.ts` and `textures.ts` create every material and procedural texture once (clay, glossy eye, knit, plaid, tweed, brass, steel, glass, code glow).
- `geometry.ts` caches geometry by shape and dimensions.
- `accessories/` holds one module per role plus `registry.ts`. Kits attach to anchors: `head`, `face`, `torso`, `body`, `rightArm`, `leftArm`. The left arm is mirrored, so kit authors write both arms with +x pointing outward.

## Usage

```tsx
<Agent
  role="debugger"
  action="inspect"
  focused={hovered}
  motion="reduced"
  position={[0, 0, 0]}
/>
```

`motion` defaults to the user's reduced motion preference. In reduced mode the agent holds the clip's key pose and never blinks or bobs.

## Shared canvas

The site renders every 3D view through one Canvas. `SceneLayer` (`components/scene/scene-layer.tsx`) is mounted once in `app/layout.tsx`. It dynamic-imports `shared-canvas.tsx` only after the first slot registers and WebGL is available, so pages without 3D ship no three.js.

- `view-registry.ts` is a tiny store with no three import. A DOM component calls `useViewSlot(id, ref, node)`; an IntersectionObserver marks slots near the viewport, and the canvas mounts a drei `View` (tracking the slot element) only for near slots. Offscreen slots cost nothing.
- The canvas is fixed, full viewport, `pointer-events: none`, `eventSource` on the body, `z-index: 30` (under the header). DOM overlays that must sit above a view need `z-40`.
- `frameloop` is `always` while a near slot exists and motion is allowed, and `demand` otherwise (scroll and resize invalidate). A priority 1 pass clears the buffer every frame so stale pixels never linger.
- Views supply their own camera and `ViewLights` (soft warm key, cool fill, hemisphere fill, a shared PMREM room environment at 0.38). No shadow maps: agents and props use a tinted radial blob shadow, which suits the paper background.
- Render stats are written to `document.documentElement.dataset.sceneStats` once per second (draw calls summed across all views).
- The dev lineup at `/dev/agents` (noindex) renders through the shared canvas. Query params: `action=<AgentAction>`, `role=<AgentRole>` for a solo close-up, `motion=reduced`.

Contracts:

- `AgentSpot` (`agent-spot.tsx`) anchors a small orthographic view outside its card edge. Top sits on the border, sides peek from behind the edge, bottom hangs upside down. It enters once with an overshoot slide or hop, then loops the role's signature action. Side edges fall back to top below 640px.
- `AgentScene` (`agent-scene.tsx`) renders one of four dioramas in `scenes/`, each an 8 s loop driven by one `useFrame` and refs. Agents switch actions through `actionRef` without React state.
- Both show a static fallback when WebGL is missing; reduced motion holds a key pose and stops the loop.

## Held props

Kits can read the live action through `useAgentLive` and re-aim props with `useHeldPose(rest, poses)`. A pose's `facing` is a body-relative yaw, so a prop held in a swinging arm still faces the camera (clipboard, tape measure, magnifier, tablet). The builder stows its laptop while carrying or walking; the architect's tape blade extends with the `measure` clip.

## Known gaps

- Accessories are separate meshes, so draw calls scale with kit detail (roughly 40 per agent with shadows). Merging static kit parts per material would cut that if a scene needs dozens of agents.
- The scribe kit (beret with feather) from the references is not a role yet.
- Poses without a `facing` entry still follow the arm, so actions other than each prop's signature can show it at an awkward angle.
- Spot agents are small; detailed accessories read at `sm`, less so at `xs`.
