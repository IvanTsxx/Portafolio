---
name: shared-canvas
description: "Trigger: adding 3D, shaders or WebGL to a page with React Three Fiber, or a page with several canvases. One fixed Canvas renders every scene through DOM-tracked views: one WebGL context, offscreen views unmounted, demand frames when idle."
license: Apache-2.0
metadata:
  author: "ivantsxx"
  version: "1.0"
---

# shared-canvas

## Activation Contract

Load before adding any 3D scene, shader, or WebGL effect to a React Three Fiber site, and when reviewing a diff that adds a `<Canvas>`. Applies to any React app (Next.js, Vite, Remix) using `@react-three/fiber` and `@react-three/drei`.

## Why

- Every `<Canvas>` is a WebGL context. Browsers cap them (about 8–16) and drop the oldest when you go over.
- Each context compiles its own shaders, uploads its own textures and runs its own loop. Ten small canvases cost ten times what one does.
- One canvas shares programs, textures and the environment map across every scene, and one loop that can sleep.

## Hard Rules

- One `<Canvas>` for the whole app, mounted once in the root layout. Never add a second one.
- The canvas is `position: fixed`, `inset: 0`, `pointer-events: none`, `aria-hidden`. Events come from `document.body` with `eventPrefix="client"`.
- Scenes render through drei `<View track={ref}>`, never as direct children. The DOM element owns layout; the view only paints inside its rect.
- Only views near the viewport mount. An `IntersectionObserver` with a margin (about `12% 0px`) decides; offscreen views unmount and stop costing frames.
- `frameloop="always"` only while a view is near and motion is allowed. Otherwise `"demand"`, waking on scroll, resize, pointer input and prop changes through `invalidate()`.
- Load the canvas lazily, client-only, and only after the first view registers and WebGL is supported. Pages with no 3D never download three.js.
- Detect WebGL once and cache it. Without it, each view renders a static DOM fallback in its own slot.
- Clear once per frame before views draw (`setScissorTest(false)` + `clear`), so views never inherit each other's pixels.
- Share heavy resources per renderer: environment maps, geometries, textures. Cache in a `WeakMap<WebGLRenderer, T>` or module scope; never rebuild them per view.
- Cap DPR (`[1, 1.75]`) and let `<PerformanceMonitor>` drop to 1 when frames decline.
- Reduced motion: hold one frame and render on demand. Every view still draws, nothing loops.

## Decision Gates

| Question | Rule |
|----------|------|
| New scene on a page? | Register a view slot, never a new `<Canvas>` |
| Which view paints on top? | `View index` priority: page scenes low, overlays (a mascot, a cursor) high |
| Scene animates? | `useFrame` + an `animate` prop that is false offscreen and under reduced motion |
| Scene reacts to input only? | Stay on demand; call `requestSceneFrame()` from the handler |
| Need post-processing for one view? | Render it inside that view's scissor or bake it in the material; a global composer touches every view |
| Content block still animating in? | Hold the slot until the block settles, then register |

## Execution Steps

1. Mount the scene layer in the root layout: it renders nothing until a slot exists and WebGL is supported, then dynamic-imports the canvas with `ssr: false`.
2. Keep a module-level slot registry (`Map` + listeners) read with `useSyncExternalStore`. Server snapshot is an empty list.
3. In the canvas, render near slots sorted by priority, each as `<View index track>` wrapped in `<Suspense fallback={null}>`.
4. In the component, give the DOM element a ref and call `useViewSlot(id, ref, <SceneContent … />, enabled, priority)`. Lazy-import heavy scene content.
5. Pass `animate` into the scene and gate `useFrame` work on it. Mutate refs in `useFrame`; never `setState` per frame.
6. Wire input with refs plus `requestSceneFrame()`, so idle scenes stay on demand.
7. Render the static fallback in the DOM element when WebGL is missing.
8. Check the cost: write `gl.info` (calls, triangles, programs, textures, frame ms) to a data attribute once a second with `gl.info.autoReset = false` and reset it in the clear pass.

## Output Contract

- Building: zero new `<Canvas>` elements; the scene registers a slot, has a fallback, a reduced-motion frame and stops looping offscreen.
- Reviewing: flag a second `<Canvas>`, `frameloop="always"` without a near view, per-frame `setState`, per-view environment or texture rebuilds, and scenes with no fallback.

## References

- `references/implementation.md` — the registry, the canvas and a consumer, ready to copy.
- `references/checklist.md` — pre-ship checklist.
