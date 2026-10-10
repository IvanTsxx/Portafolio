"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { NeutralToneMapping } from "three";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { setSceneFrameRequester, useNearViewSlots } from "./view-registry";

const maxDpr = 1.75;
const minDpr = 1;
const clearPriority = 1;
const statsPriority = 1000;

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
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: NeutralToneMapping,
        toneMappingExposure: 1,
      }}
      style={{
        height: "auto",
        inset: 0,
        pointerEvents: "none",
        position: "fixed",
        width: "auto",
        zIndex: 30,
      }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(minDpr)}
        onIncline={() => setDpr(maxDpr)}
      >
        <FrameClear />
        <InvalidateOnScroll />
        <TrackedViews />
        <FrameStats />
      </PerformanceMonitor>
    </Canvas>
  );
};

export default SharedCanvas;
