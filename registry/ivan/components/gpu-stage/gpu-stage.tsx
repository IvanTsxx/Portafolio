"use client";

import { Canvas } from "@react-three/fiber";
import type { GLProps } from "@react-three/fiber";
import { useRef } from "react";
import type { ReactNode } from "react";
import { WebGPURenderer } from "three/webgpu";

import { cn } from "@/lib/utils";
import { useInView } from "@/registry/ivan/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { useWebGLSupport } from "@/registry/ivan/hooks/use-webgl-support";

export interface GpuStageProps {
  ground: string;
  label: string;
  paused: boolean;
  fallback: ReactNode;
  className?: string;
  children: (isAnimating: boolean) => ReactNode;
}

const createRenderer: GLProps = async ({ canvas }) => {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new TypeError("GpuStage renders into an HTMLCanvasElement.");
  }
  const renderer = new WebGPURenderer({
    alpha: true,
    antialias: false,
    canvas,
    powerPreference: "high-performance",
  });
  await renderer.init();
  return renderer;
};

export const GpuStage = ({
  ground,
  label,
  paused,
  fallback,
  className,
  children,
}: GpuStageProps) => {
  const frame = useRef<HTMLElement>(null);
  const hasWebGL = useWebGLSupport();
  const isInView = useInView(frame);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimating = isInView && !prefersReducedMotion && !paused;

  return (
    <figure
      aria-label={label}
      className={cn(
        "relative m-0 aspect-4/3 w-full overflow-hidden",
        className
      )}
      ref={frame}
      style={{ backgroundColor: ground }}
    >
      {hasWebGL ? null : fallback}
      {hasWebGL && isInView ? (
        <Canvas
          aria-hidden
          dpr={[1, 1.5]}
          flat
          frameloop={isAnimating ? "always" : "demand"}
          gl={createRenderer}
        >
          {children(isAnimating)}
        </Canvas>
      ) : null}
    </figure>
  );
};
