"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry } from "three";

import type { SourceImage } from "@/components/lab/source/tone-chunk";
import {
  syncSourceUniforms,
  useDampedPointer,
  useSourceTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";

import { EngravingMaterial } from "./engraving-material";

const EngravingMaterialElement = extend(EngravingMaterial);

const quad = new PlaneGeometry(1, 1);

export interface EngravingSettings {
  angle: number;
  follow: number;
  pitch: number;
  source: SourceImage;
}

interface EngravingViewProps {
  settings: EngravingSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const EngravingView = ({ settings, animate, pointer }: EngravingViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof EngravingMaterial>>(null);
  const light = useDampedPointer(pointer, animate);
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
        light.current,
        portrait,
        settings.source
      );
      shader.uPitch = settings.pitch * renderer.getPixelRatio();
      shader.uAngle = (settings.angle * Math.PI) / 180;
      shader.uFollow = settings.follow / 100;
    };
  }, [
    light,
    portrait,
    settings.angle,
    settings.follow,
    settings.pitch,
    settings.source,
  ]);

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <EngravingMaterialElement
          key={EngravingMaterial.key}
          ref={material}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default EngravingView;
