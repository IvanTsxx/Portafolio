"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry } from "three";

import type { SourceImage } from "@/components/lab/source/tone-chunk";
import {
  syncSourceUniforms,
  useDampedPointer,
  usePointerSpeed,
  useSourceTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";

import { SmearMaterial } from "./smear-material";

const SmearMaterialElement = extend(SmearMaterial);

const quad = new PlaneGeometry(1, 1);

export interface SmearSettings {
  angle: number;
  dither: boolean;
  reach: number;
  smear: number;
  source: SourceImage;
}

interface SmearViewProps {
  settings: SmearSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const SmearView = ({ settings, animate, pointer }: SmearViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof SmearMaterial>>(null);
  const focus = useDampedPointer(pointer, animate);
  const speed = usePointerSpeed(focus, animate);
  const portrait = useSourceTexture(settings.source);

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
        focus.current,
        portrait,
        settings.source
      );
      const ratio = renderer.getPixelRatio();
      shader.uAngle = (settings.angle * Math.PI) / 180;
      shader.uCell = Math.max(Math.round(2 * ratio), 1);
      shader.uDither = settings.dither ? 1 : 0;
      shader.uReach = settings.reach / 100;
      shader.uSmear = settings.smear / 100;
    };
  }, [
    focus,
    portrait,
    settings.angle,
    settings.dither,
    settings.reach,
    settings.smear,
    settings.source,
  ]);

  useFrame(() => {
    if (material.current) {
      material.current.uKick = speed.current.kick;
    }
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <SmearMaterialElement
          key={SmearMaterial.key}
          ref={material}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default SmearView;
