"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry } from "three";

import { posterLight } from "@/components/lab/source/form-tone";
import {
  createSpring,
  driveSpring,
  frameStep,
} from "@/components/lab/source/spring";
import type { SourceKind } from "@/components/lab/source/tone-chunk";
import {
  syncSourceUniforms,
  usePortraitTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";

import { ContourMaterial } from "./contour-material";
import { portraitRows } from "./ground";

const ContourMaterialElement = extend(ContourMaterial);

const quad = new PlaneGeometry(1, 1);

const positionSpring = { damping: 11, stiffness: 70 } as const;
const liftSpring = { damping: 7, stiffness: 55 } as const;

export interface ContourSettings {
  levels: number;
  hillHeight: number;
  source: SourceKind;
}

export interface ContourViewProps {
  settings: ContourSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const ContourView = ({ settings, animate, pointer }: ContourViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof ContourMaterial>>(null);
  const portrait = usePortraitTexture(settings.source === "portrait");
  const hill = useRef({
    lift: createSpring(0),
    x: createSpring(0.5),
    y: createSpring(0.5),
  });

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
        posterLight,
        portrait,
        settings.source
      );
      shader.uLight.set(posterLight.x, posterLight.y);
      shader.uPixelRatio = renderer.getPixelRatio();
      shader.uPortraitLod = Math.log2(
        Math.max(shader.uPortraitSize / portraitRows, 1)
      );
      const { x, y, lift } = hill.current;
      shader.uHill.set(
        (x.value - 0.5) * shader.uAspect,
        y.value - 0.5,
        lift.value
      );
    };
  }, [portrait, settings.source]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const step = frameStep(delta);
    const { current: hover } = pointer;
    const { x, y, lift } = hill.current;
    driveSpring(x, hover.x, positionSpring, step, animate);
    driveSpring(y, hover.y, positionSpring, step, animate);
    driveSpring(
      lift,
      hover.isHovering ? settings.hillHeight : 0,
      liftSpring,
      step,
      animate
    );
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <ContourMaterialElement
          key={ContourMaterial.key}
          ref={material}
          toneMapped={false}
          uLevels={settings.levels}
        />
      </mesh>
    </>
  );
};

export default ContourView;
