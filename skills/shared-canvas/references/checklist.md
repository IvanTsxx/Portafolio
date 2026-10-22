# Shared canvas checklist

- [ ] `grep -r "<Canvas" src` finds exactly one match.
- [ ] Pages without 3D do not load three.js (check the route's JS chunks).
- [ ] The new scene registers through `useViewSlot` and draws inside its DOM rect.
- [ ] Scrolling the view out of the viewport unmounts it.
- [ ] With every view offscreen, the canvas is on `frameloop="demand"` and draws no frames.
- [ ] Reduced motion holds one frame; nothing loops.
- [ ] WebGL off shows the static fallback, with the same size as the scene.
- [ ] `useFrame` mutates refs only. No `setState` per frame.
- [ ] Input handlers call `requestSceneFrame()` instead of switching the loop on.
- [ ] Heavy resources (environment, textures, geometry) are shared, not rebuilt per view.
- [ ] DPR is capped and `PerformanceMonitor` can lower it.
- [ ] Draw calls, triangles and programs in the stats attribute stay flat after scrolling the page twice (no leaks).
