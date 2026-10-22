# Implementation

Four files: the slot registry, the scene layer, the canvas and a consumer. Taken from ivo's portfolio (`components/scene/`), trimmed to the core.

## `view-registry.ts`

```ts
"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

export const viewPriority = { overlay: 3, scene: 2 } as const;

export interface ViewSlot {
  id: string;
  node: ReactNode;
  priority: number;
  track: RefObject<HTMLElement>;
}

interface SlotRecord extends ViewSlot {
  isNear: boolean;
}

const slots = new Map<string, SlotRecord>();
const listeners = new Set<() => void>();
let nearSnapshot: readonly ViewSlot[] = [];
let observer: IntersectionObserver | null = null;
let frameRequester: (() => void) | null = null;

export const setSceneFrameRequester = (requester: (() => void) | null) => {
  frameRequester = requester;
};

export const requestSceneFrame = () => {
  frameRequester?.();
};

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const rebuildSnapshot = () => {
  const near: ViewSlot[] = [];
  for (const { id, isNear, node, priority, track } of slots.values()) {
    if (isNear) {
      near.push({ id, node, priority, track });
    }
  }
  nearSnapshot = near.toSorted((a, b) => a.priority - b.priority);
  notify();
};

const handleIntersections = (entries: IntersectionObserverEntry[]) => {
  let changed = false;
  for (const entry of entries) {
    for (const slot of slots.values()) {
      if (slot.track.current === entry.target && slot.isNear !== entry.isIntersecting) {
        slot.isNear = entry.isIntersecting;
        changed = true;
      }
    }
  }
  if (changed) {
    rebuildSnapshot();
  }
};

const getObserver = () => {
  observer ??= new IntersectionObserver(handleIntersections, {
    rootMargin: "12% 0px",
  });
  return observer;
};

const registerSlot = (id: string, element: HTMLElement, priority: number) => {
  slots.set(id, { id, isNear: false, node: null, priority, track: { current: element } });
  getObserver().observe(element);
  rebuildSnapshot();
  return () => {
    getObserver().unobserve(element);
    slots.delete(id);
    rebuildSnapshot();
  };
};

const updateSlot = (id: string, node: ReactNode) => {
  const slot = slots.get(id);
  if (!slot || slot.node === node) {
    return;
  }
  slot.node = node;
  if (slot.isNear) {
    rebuildSnapshot();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useNearViewSlots = () =>
  useSyncExternalStore(subscribe, () => nearSnapshot, () => []);

export const useHasViewSlots = () =>
  useSyncExternalStore(subscribe, () => slots.size > 0, () => false);

export const useViewSlot = (
  id: string,
  track: RefObject<HTMLElement | null>,
  node: ReactNode,
  enabled = true,
  priority: number = viewPriority.scene
) => {
  useLayoutEffect(() => {
    const element = track.current;
    if (!(element && enabled)) {
      return;
    }
    return registerSlot(id, element, priority);
  }, [enabled, id, priority, track]);

  useEffect(() => {
    updateSlot(id, node);
  });
};
```

The registry lives outside React, so registering a slot never re-renders the page, only the canvas.

## `webgl-support.ts`

```ts
"use client";

import { useSyncExternalStore } from "react";

let cachedSupport: boolean | null = null;

const detectWebGL = () => {
  if (cachedSupport !== null) {
    return cachedSupport;
  }
  try {
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2") ?? probe.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    cachedSupport = context !== null;
  } catch {
    cachedSupport = false;
  }
  return cachedSupport;
};

export const useWebGLSupport = () =>
  useSyncExternalStore(() => () => {}, detectWebGL, () => true);
```

The probe context is released right away so it never counts against the browser's limit.

## `scene-layer.tsx`

Mount once in the root layout.

```tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useHasViewSlots } from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const SharedCanvas = dynamic(() => import("./shared-canvas"), { ssr: false });

export const SceneLayer = () => {
  const hasSlots = useHasViewSlots();
  const hasWebGL = useWebGLSupport();
  const [isActivated, setIsActivated] = useState(false);

  if (hasSlots && hasWebGL && !isActivated) {
    setIsActivated(true);
  }

  return isActivated ? <SharedCanvas /> : null;
};
```

Once activated it stays mounted, so navigating between pages keeps the context and its compiled programs.

## `shared-canvas.tsx`

```tsx
"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { setSceneFrameRequester, useNearViewSlots } from "./view-registry";

const maxDpr = 1.75;
const minDpr = 1;

const FrameClear = () => {
  useFrame(({ gl }) => {
    gl.info.reset();
    gl.setScissorTest(false);
    gl.clear(true, true, false);
  }, 1);
  return null;
};

const WakeOnScroll = () => {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    setSceneFrameRequester(invalidate);
    const wake = () => invalidate();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    return () => {
      setSceneFrameRequester(null);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, [invalidate]);
  return null;
};

const TrackedViews = () => {
  const slots = useNearViewSlots();
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  });

  return slots.map((slot) => (
    <View index={slot.priority} key={slot.id} track={slot.track}>
      <Suspense fallback={null}>{slot.node}</Suspense>
    </View>
  ));
};

const SharedCanvas = () => {
  const slots = useNearViewSlots();
  const isReduced = useReducedMotion();
  const [dpr, setDpr] = useState(maxDpr);
  const isLive = slots.length > 0 && !isReduced;

  return (
    <Canvas
      aria-hidden
      dpr={dpr}
      eventPrefix="client"
      eventSource={document.body}
      frameloop={isLive ? "always" : "demand"}
      onCreated={({ gl }) => {
        gl.info.autoReset = false;
      }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ inset: 0, pointerEvents: "none", position: "fixed", zIndex: 30 }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(minDpr)}
        onIncline={() => setDpr(maxDpr)}
      >
        <FrameClear />
        <WakeOnScroll />
        <TrackedViews />
      </PerformanceMonitor>
    </Canvas>
  );
};

export default SharedCanvas;
```

`gl.info.autoReset = false` plus the reset in `FrameClear` makes `gl.info.render.calls` count the whole frame across every view, not just the last one.

## Consumer

```tsx
"use client";

import { lazy, useId, useRef } from "react";

import { requestSceneFrame, useViewSlot } from "@/components/scene/view-registry";
import { useWebGLSupport } from "@/components/scene/webgl-support";

const OrbScene = lazy(() => import("./orb-scene"));

export const Orb = ({ animate }: { animate: boolean }) => {
  const track = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const id = useId();
  const hasWebGL = useWebGLSupport();

  useViewSlot(id, track, <OrbScene animate={animate} pointer={pointer} />, hasWebGL);

  return (
    <div
      className="relative aspect-square w-full"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        pointer.current.x = (event.clientX - box.left) / box.width;
        pointer.current.y = (event.clientY - box.top) / box.height;
        requestSceneFrame();
      }}
      ref={track}
    >
      {hasWebGL ? null : <OrbFallback />}
    </div>
  );
};
```

Inside `OrbScene`, read `pointer.current` in `useFrame` and skip the per-frame work when `animate` is false.

## Shared resources

```ts
const environments = new WeakMap<WebGLRenderer, Texture>();

const sharedEnvironment = (gl: WebGLRenderer) => {
  const cached = environments.get(gl);
  if (cached) {
    return cached;
  }
  const generator = new PMREMGenerator(gl);
  const room = new RoomEnvironment();
  const { texture } = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();
  environments.set(gl, texture);
  return texture;
};
```

Every view calls `sharedEnvironment(gl)`; the PMREM pass runs once per renderer. Module-level geometry (`const quad = new PlaneGeometry(1, 1)`) works the same way for full-view shader quads.
