"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { NeutralToneMapping } from "three";

import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";

import { setSceneFrameRequester, useNearViewSlots } from "./view-registry";
import type { ViewSlot } from "./view-registry";

const maxDpr = 1.75;
const minDpr = 1;
const clearPriority = 1;
const statsPriority = 1000;
const antialiasDprLimit = 1.5;
const scrollEpsilon = 0.5;

type CanvasAnchor = "page" | "viewport";

const FrameClear = () => {
  useFrame(({ gl }) => {
    gl.info.reset();
    gl.setScissorTest(false);
    gl.clear(true, true, false);
  }, clearPriority);
  return null;
};

const FrameStats = () => {
  const gl = useThree((state) => state.gl);
  const windowStart = useRef(0);
  const frames = useRef(0);

  useFrame(() => {
    const now = performance.now();
    frames.current += 1;
    const elapsed = now - windowStart.current;
    if (elapsed < 1000) {
      return;
    }
    document.documentElement.dataset.sceneStats = JSON.stringify({
      calls: gl.info.render.calls,
      frameMs: Math.round((elapsed / frames.current) * 100) / 100,
      geometries: gl.info.memory.geometries,
      programs: gl.info.programs?.length ?? 0,
      textures: gl.info.memory.textures,
      triangles: gl.info.render.triangles,
    });
    windowStart.current = now;
    frames.current = 0;
  }, statsPriority);
  return null;
};

const InvalidateOnScroll = () => {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    setSceneFrameRequester(invalidate);
    return () => setSceneFrameRequester(null);
  }, [invalidate]);
  useEffect(() => {
    const wake = () => invalidate();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, [invalidate]);
  return null;
};

const movesWithPage = (shift: number, scrollShift: number) =>
  Math.abs(shift + scrollShift) < Math.abs(shift);

const readAnchor = (
  slots: readonly ViewSlot[],
  previousTops: Map<string, number>,
  scrollShift: number
) => {
  const tops = new Map<string, number>();
  let pageViews = 0;
  let viewportViews = 0;
  for (const slot of slots) {
    const rect = slot.track.current?.getBoundingClientRect();
    if (!rect) {
      continue;
    }
    tops.set(slot.id, rect.top);
    const previousTop = previousTops.get(slot.id);
    const isOnScreen = rect.bottom > 0 && rect.top < window.innerHeight;
    if (
      previousTop === undefined ||
      !isOnScreen ||
      Math.abs(scrollShift) < scrollEpsilon
    ) {
      continue;
    }
    if (movesWithPage(rect.top - previousTop, scrollShift)) {
      pageViews += 1;
    } else {
      viewportViews += 1;
    }
  }
  if (pageViews > 0) {
    return { anchor: "page" as const, tops };
  }
  return { anchor: viewportViews > 0 ? ("viewport" as const) : null, tops };
};

const placeCanvas = (element: HTMLElement, anchor: CanvasAnchor) => {
  if (anchor === "viewport") {
    element.style.removeProperty("position");
    element.style.removeProperty("transform");
    return;
  }
  const offset = -(element.parentElement?.getBoundingClientRect().top ?? 0);
  element.style.position = "absolute";
  element.style.transform = `translate3d(0, ${offset}px, 0)`;
};

const CanvasAnchorSync = ({
  holder,
}: {
  holder: RefObject<HTMLDivElement | null>;
}) => {
  const slots = useNearViewSlots();
  const lastScroll = useRef(0);
  const lastTops = useRef(new Map<string, number>());
  const anchor = useRef<CanvasAnchor>("page");

  useFrame((state) => {
    const element = holder.current;
    if (!element) {
      return;
    }
    const scroll = window.scrollY;
    const reading = readAnchor(
      slots,
      lastTops.current,
      scroll - lastScroll.current
    );
    lastScroll.current = scroll;
    lastTops.current = reading.tops;
    anchor.current = reading.anchor ?? anchor.current;
    placeCanvas(element, anchor.current);
    const { size } = state;
    if (size.top !== 0 || size.left !== 0) {
      state.setSize(size.width, size.height, 0, 0);
    }
  }, clearPriority);
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
  const isReduced = usePrefersReducedMotion();
  const holder = useRef<HTMLDivElement>(null);
  const [dprCeiling, setDprCeiling] = useState(maxDpr);
  const isLive = slots.some((slot) => slot.loop === "always") && !isReduced;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 overflow-clip"
    >
      <div className="fixed top-0 left-0 h-lvh w-full" ref={holder}>
        <Canvas
          dpr={[minDpr, dprCeiling]}
          eventPrefix="client"
          eventSource={document.body}
          frameloop={isLive ? "always" : "demand"}
          onCreated={({ gl }) => {
            gl.info.autoReset = false;
            gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
          }}
          gl={{
            alpha: true,
            antialias: window.devicePixelRatio < antialiasDprLimit,
            powerPreference: "high-performance",
            toneMapping: NeutralToneMapping,
            toneMappingExposure: 1,
          }}
          resize={{ scroll: false }}
          style={{ inset: 0, pointerEvents: "none", position: "absolute" }}
        >
          <PerformanceMonitor
            flipflops={3}
            onDecline={() => setDprCeiling(minDpr)}
            onIncline={() => setDprCeiling(maxDpr)}
          >
            <CanvasAnchorSync holder={holder} />
            <FrameClear />
            <InvalidateOnScroll />
            <TrackedViews />
            <FrameStats />
          </PerformanceMonitor>
        </Canvas>
      </div>
    </div>
  );
};

export default SharedCanvas;
