"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry } from "three";

import type { SourceKind } from "@/components/lab/source/tone-chunk";
import {
  syncSourceUniforms,
  useDampedPointer,
  usePortraitTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";

import { HalftoneMaterial } from "./halftone-material";

const HalftoneMaterialElement = extend(HalftoneMaterial);

const quad = new PlaneGeometry(1, 1);

export type HalftoneMark = "round" | "line" | "square";

const markIndex = {
  line: 1,
  round: 0,
  square: 2,
} as const satisfies Record<HalftoneMark, number>;

export interface HalftoneSettings {
  angle: number;
  cell: number;
  mark: HalftoneMark;
  source: SourceKind;
}

export interface HalftoneViewProps {
  settings: HalftoneSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const HalftoneView = ({ settings, animate, pointer }: HalftoneViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof HalftoneMaterial>>(null);
  const light = useDampedPointer(pointer, animate);
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
        light.current,
        portrait,
        settings.source
      );
      shader.uCell = settings.cell * renderer.getPixelRatio();
      shader.uAngle = (settings.angle * Math.PI) / 180;
    };
  }, [light, portrait, settings.angle, settings.cell, settings.source]);

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <HalftoneMaterialElement
          key={HalftoneMaterial.key}
          ref={material}
          toneMapped={false}
          uMark={markIndex[settings.mark]}
        />
      </mesh>
    </>
  );
};

export default HalftoneView;
