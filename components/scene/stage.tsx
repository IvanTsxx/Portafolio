"use client";

import {
  ContactShadows,
  Environment,
  Lightformer,
  PerformanceMonitor,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import { useState } from "react";
import { NeutralToneMapping } from "three";

import { cn } from "@/lib/utils";

import { StageFallback } from "./stage-fallback";
import { StageFloor } from "./stage-floor";

export interface StageCamera {
  position: [number, number, number];
  fov?: number;
  zoom?: number;
  target?: [number, number, number];
}

export interface StageProps {
  children: ReactNode;
  className?: string;
  label: string;
  camera?: StageCamera;
  frameloop?: "always" | "demand" | "never";
  shadowExtent?: number;
}

const maxDpr = 1.75;
const minDpr = 1;

export const Stage = ({
  children,
  className,
  label,
  camera,
  frameloop = "always",
  shadowExtent = 6,
}: StageProps) => {
  const [dpr, setDpr] = useState(maxDpr);
  const [degraded, setDegraded] = useState(false);
  const { target = [0, 0.6, 0], ...cameraProps } = camera ?? {
    fov: 32,
    position: [0, 2.2, 7.5],
  };

  return (
    <figure
      aria-label={label}
      className={cn("relative m-0 size-full", className)}
    >
      <Canvas
        camera={{ fov: 32, ...cameraProps }}
        dpr={dpr}
        fallback={<StageFallback label={label} />}
        frameloop={frameloop}
        gl={{
          antialias: true,
          toneMapping: NeutralToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={({ camera: sceneCamera }) => {
          sceneCamera.lookAt(...target);
        }}
        shadows="percentage"
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => {
            setDpr(minDpr);
            setDegraded(true);
          }}
          onIncline={() => setDpr(maxDpr)}
        >
          <hemisphereLight args={["#f3e6d6", "#2a2420", 0.8]} />
          <directionalLight
            castShadow
            color="#fff1e2"
            intensity={2.6}
            position={[-3.5, 6, 5]}
            shadow-bias={-0.0004}
            shadow-camera-bottom={-shadowExtent}
            shadow-camera-far={20}
            shadow-camera-left={-shadowExtent}
            shadow-camera-near={1}
            shadow-camera-right={shadowExtent}
            shadow-camera-top={shadowExtent}
            shadow-mapSize={degraded ? [1024, 1024] : [2048, 2048]}
            shadow-normalBias={0.02}
            shadow-radius={3}
          />
          <directionalLight
            color="#a9c1e0"
            intensity={2.2}
            position={[4, 3.5, -5]}
          />
          <directionalLight
            color="#ffe2cc"
            intensity={0.9}
            position={[4, 1.2, 6]}
          />
          <Environment frames={1} resolution={64}>
            <Lightformer
              color="#fff4e8"
              intensity={1.6}
              position={[-2, 3, 4]}
              scale={[4, 2, 1]}
            />
            <Lightformer
              color="#b9cde6"
              intensity={1.2}
              position={[4, 2, -3]}
              rotation-y={Math.PI / 2}
              scale={[3, 2, 1]}
            />
            <Lightformer
              color="#2a2622"
              form="ring"
              intensity={0.6}
              position={[0, -3, 0]}
              rotation-x={Math.PI / 2}
              scale={6}
            />
          </Environment>
          {children}
          <StageFloor />
          <ContactShadows
            blur={2.2}
            color="#050403"
            far={1.6}
            frames={degraded ? 1 : Number.POSITIVE_INFINITY}
            opacity={0.75}
            position={[0, 0.002, 0]}
            resolution={degraded ? 256 : 512}
            scale={shadowExtent * 2.4}
          />
        </PerformanceMonitor>
      </Canvas>
    </figure>
  );
};
