"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry } from "three";

import type { StageReveal } from "@/components/lab/source/stage-reveal";
import type { SourceImage } from "@/components/lab/source/tone-chunk";
import {
  syncSourceUniforms,
  useDampedPointer,
  usePointerSpeed,
  useSourceTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";

import { TearMaterial } from "./tear-material";

const TearMaterialElement = extend(TearMaterial);

const quad = new PlaneGeometry(1, 1);
const stillTime = 4.2;

export interface TearSettings {
  ghost: number;
  grain: number;
  source: SourceImage;
  tear: number;
}

interface TearViewProps {
  reveal: RefObject<StageReveal>;
  settings: TearSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const TearView = ({ settings, animate, pointer, reveal }: TearViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof TearMaterial>>(null);
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
        settings.source,
        reveal.current
      );
      shader.uPixelRatio = renderer.getPixelRatio();
      shader.uGhost = settings.ghost / 100;
      shader.uGrain = settings.grain / 100;
      shader.uTear = settings.tear / 100;
    };
  }, [
    reveal,
    focus,
    portrait,
    settings.ghost,
    settings.grain,
    settings.source,
    settings.tear,
  ]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    if (animate) {
      shader.uTime += Math.min(delta, 0.05);
    } else {
      shader.uTime = stillTime;
    }
    shader.uKick = speed.current.kick;
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <TearMaterialElement
          key={TearMaterial.key}
          ref={material}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default TearView;
