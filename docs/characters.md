# Characters

One procedural mascot rig dressed by seven accessory kits. Everything is built from shared rounded geometry and one material table, so a new role is one module and one registry entry.

## Procedural R3F or GLB

Blender is not installed, so a GLB pipeline would have meant hand-authoring meshes with no modelling tool. Procedural geometry won on every axis that matters here.

- Fidelity. The references are rounded boxes, cylinders, domes and rings. `RoundedBoxGeometry` from three addons reproduces the clay bevels exactly. Organic shapes such as the feather in the scribe reference would need a GLB.
- Rigging. The rig is a group hierarchy (body, two arm pivots, four leg pivots, eye group), so procedural animation mutates transforms directly. A GLB would need skinning or the same hierarchy rebuilt by name.
- Performance. Geometry is cached by dimensions and materials are module singletons, so seven agents share 91 geometries, 13 textures and 16 shader programs. The lineup at 1600×1000 renders 292 draw calls (shadow pass included) and holds the 60 fps vsync cap in headless Chrome (16.7 ms per frame, an upper bound rather than a measured GPU cost).
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

`Stage` is the default rig: warm key light with soft shadows, cool rim, low hemisphere fill, a small procedural environment for metal and glossy eyes, a radial dark floor with contact shadows, Neutral tone mapping, DPR clamped to 1.75 and dropped to 1 by `PerformanceMonitor` when frames decline.

`LazyStage` dynamic-imports `Stage` with `ssr: false` and shows a blueprint-grid fallback with the stage label. `Agent` imports three, so a page that wants three out of its first-load bundle should dynamic-import its whole scene module, as `components/agents/agent-lineup.tsx` does for the lineup.

The dev lineup lives at `/dev/agents` (noindex). Query params: `action=<AgentAction>`, `role=<AgentRole>` for a solo close-up, `motion=reduced`. Render stats are written to `document.documentElement.dataset.agentStageStats`.

## Known gaps

- Accessories are separate meshes, so draw calls scale with kit detail (roughly 40 per agent with shadows). Merging static kit parts per material would cut that if a scene needs dozens of agents.
- The scribe kit (beret with feather) from the references is not a role yet.
- Held props follow the arm but do not re-orient per action, so a few poses show a prop at an awkward angle.
