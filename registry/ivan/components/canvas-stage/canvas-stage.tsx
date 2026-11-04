"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useInView } from "@/registry/ivan/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { useWebGLSupport } from "@/registry/ivan/hooks/use-webgl-support";

export interface CanvasStageProps {
  ground: string;
  label: string;
  paused: boolean;
  fallback: ReactNode;
  antialias?: boolean;
  camera?: ComponentProps<typeof Canvas>["camera"];
  className?: string;
  children: (isAnimating: boolean) => ReactNode;
}

interface ImageFallbackProps {
  src: string;
  focus: { x: number; y: number };
}

export const ImageFallback = ({ src, focus }: ImageFallbackProps) => (
  <div
    aria-hidden
    className="absolute inset-0 grayscale"
    style={{
      backgroundImage: `url(${JSON.stringify(src)})`,
      backgroundPosition: `${focus.x * 100}% ${focus.y * 100}%`,
      backgroundSize: "cover",
    }}
  />
);

export const CanvasStage = ({
  ground,
  label,
  paused,
  fallback,
  antialias = false,
  camera,
  className,
  children,
}: CanvasStageProps) => {
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
      {hasWebGL ? (
        <Canvas
          aria-hidden
          camera={camera}
          dpr={[1, 1.75]}
          frameloop={isAnimating ? "always" : "demand"}
          gl={{
            alpha: true,
            antialias,
            powerPreference: "high-performance",
          }}
        >
          {children(isAnimating)}
        </Canvas>
      ) : (
        fallback
      )}
    </figure>
  );
};
