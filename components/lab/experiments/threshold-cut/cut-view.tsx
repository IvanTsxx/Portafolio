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

import { CutMaterial } from "./cut-material";

const CutMaterialElement = extend(CutMaterial);

const quad = new PlaneGeometry(1, 1);

const pushRate = 5;

export interface ThresholdCutSettings {
  roughness: number;
  source: SourceKind;
  sweep: number;
  threshold: number;
}

export interface CutViewProps {
  settings: ThresholdCutSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const CutView = ({ settings, animate, pointer }: CutViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof CutMaterial>>(null);
  const thumb = useDampedPointer(pointer, animate);
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
      const { x, y } = shader.uResolution;
      shader.uPointer.set(thumb.current.x * x, thumb.current.y * y);
      shader.uThreshold = settings.threshold / 100;
      shader.uRoughness = settings.roughness / 100;
    };
  }, [
    portrait,
    settings.roughness,
    settings.source,
    settings.threshold,
    thumb,
  ]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const target = pointer.current.isHovering ? 1 : 0;
    if (!animate) {
      shader.uPush = target;
      return;
    }
    const step = Math.min(delta, 0.05);
    shader.uPhase += step * settings.sweep;
    shader.uPush += (target - shader.uPush) * (1 - Math.exp(-step * pushRate));
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <CutMaterialElement
          key={CutMaterial.key}
          ref={material}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default CutView;
