"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useId, useRef } from "react";
import type { ReactNode } from "react";
import type { ToneMapping } from "three";

import { useViewSlot } from "@/components/scene/view-registry";
import { useWebGLSupport } from "@/components/scene/webgl-support";
import { cn } from "@/lib/utils";

export interface CanvasProps {
  camera?: { fov?: number; position?: [number, number, number] };
  children?: ReactNode;
  className?: string;
  gl?: { toneMapping?: ToneMapping };
}

const defaultFov = 75;
const defaultPosition: [number, number, number] = [0, 0, 5];

export const Canvas = ({ camera, children, className }: CanvasProps) => {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const hasWebGL = useWebGLSupport();

  useViewSlot(
    id,
    track,
    <>
      <PerspectiveCamera
        fov={camera?.fov ?? defaultFov}
        makeDefault
        position={camera?.position ?? defaultPosition}
      />
      {children}
    </>,
    hasWebGL
  );

  return <div className={cn("relative", className)} ref={track} />;
};
