"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry } from "three";

import type { SourceKind } from "@/components/lab/source/tone-chunk";
import {
  restingLight,
  syncSourceUniforms,
  useDampedPointer,
  usePortraitTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";

import { PlateMaterial } from "./plate-material";

const PlateMaterialElement = extend(PlateMaterial);

const quad = new PlaneGeometry(1, 1);

const snapSpring = { damping: 11, stiffness: 190 } as const;
const reachShare = 0.36;

export type PlateCount = "2" | "3";

export interface MisregistrationSettings {
  cell: number;
  drift: number;
  plates: PlateCount;
  source: SourceKind;
}

export interface PlateViewProps {
  settings: MisregistrationSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const PlateView = ({ settings, animate, pointer }: PlateViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof PlateMaterial>>(null);
  const loupe = useDampedPointer(pointer, animate);
  const presence = useRef({ value: 0, velocity: 0 });
  const portrait = usePortraitTexture(settings.source === "portrait");

  useEffect(() => {
    const plane = mesh.current;
    if (!plane) {
      return;
    }
    plane.onBeforeRender = (renderer: WebGLRenderer) => {
      const shader = material.current;
      if (!shader) {
        return;
      }
      syncSourceUniforms(
        shader,
        renderer,
        restingLight,
        portrait,
        settings.source
      );
      const ratio = renderer.getPixelRatio();
      const { x, y } = shader.uResolution;
      shader.uPointer.set(loupe.current.x * x, loupe.current.y * y);
      shader.uReach = y * reachShare;
      shader.uCell = settings.cell * ratio;
      shader.uDrift = settings.drift * ratio;
      shader.uPresence = presence.current.value;
    };
  }, [loupe, portrait, settings.cell, settings.drift, settings.source]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const step = Math.min(delta, 0.05);
    const target = pointer.current.isHovering ? 1 : 0;
    const state = presence.current;
    if (animate) {
      shader.uTime += step;
      const pull =
        snapSpring.stiffness * (target - state.value) -
        snapSpring.damping * state.velocity;
      state.velocity += pull * step;
      state.value += state.velocity * step;
      return;
    }
    state.value = target;
    state.velocity = 0;
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <PlateMaterialElement
          key={PlateMaterial.key}
          ref={material}
          toneMapped={false}
          uPlates={Number(settings.plates)}
        />
      </mesh>
    </>
  );
};

export default PlateView;
