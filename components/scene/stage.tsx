"use client";

import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface StageProps {
  children: ReactNode;
  className?: string;
  label: string;
  camera?: { position: [number, number, number]; fov?: number; zoom?: number };
  frameloop?: "always" | "demand" | "never";
}

export const Stage = ({
  children,
  className,
  label,
  camera,
  frameloop = "always",
}: StageProps) => (
  <figure
    aria-label={label}
    className={cn("relative m-0 size-full", className)}
  >
    <Canvas
      camera={camera ?? { fov: 35, position: [0, 2, 6] }}
      dpr={[1, 1.75]}
      frameloop={frameloop}
      shadows
    >
      <ambientLight intensity={0.6} />
      <directionalLight castShadow intensity={1.6} position={[4, 6, 4]} />
      {children}
    </Canvas>
  </figure>
);
