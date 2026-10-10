"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { MathUtils, PlaneGeometry, Vector4 } from "three";

import { DitherMaterial } from "./dither-material";

const DitherMaterialElement = extend(DitherMaterial);

const quad = new PlaneGeometry(1, 1);
const viewport = new Vector4();

export interface DitherSettings {
  cell: number;
  contrast: number;
  matrix: "2" | "4" | "8";
  accent: boolean;
}

export interface DitherPointer {
  x: number;
  y: number;
  isHovering: boolean;
}

export interface DitherViewProps {
  settings: DitherSettings;
  animate: boolean;
  pointer: RefObject<DitherPointer>;
}

const DitherView = ({ settings, animate, pointer }: DitherViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof DitherMaterial>>(null);
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
      renderer.getCurrentViewport(viewport);
      const ratio = renderer.getPixelRatio();
      shader.uOrigin.set(viewport.x, viewport.y);
      shader.uResolution.set(viewport.z, viewport.w);
      shader.uCell = settings.cell * ratio;
    };
  }, [settings.cell]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const step = Math.min(delta, 0.05);
    if (animate) {
      shader.uTime += step;
    }
    const time = shader.uTime;
    const { current: hover } = pointer;
    const target = hover.isHovering
      ? hover
      : {
          x: 0.5 + Math.sin(time * 0.31) * 0.28,
          y: 0.5 + Math.cos(time * 0.23) * 0.22,
        };
    const lambda = animate ? 6 : 1000;
    shader.uPointer.x = MathUtils.damp(
      shader.uPointer.x,
      target.x,
      lambda,
      step
    );
    shader.uPointer.y = MathUtils.damp(
      shader.uPointer.y,
      target.y,
      lambda,
      step
    );
    shader.uPressure = MathUtils.damp(
      shader.uPressure,
      hover.isHovering ? 1 : 0.6,
      lambda / 2,
      step
    );
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <DitherMaterialElement
          key={DitherMaterial.key}
          ref={material}
          toneMapped={false}
          uAccent={settings.accent ? 1 : 0}
          uContrast={settings.contrast}
          uMatrix={Number(settings.matrix)}
        />
      </mesh>
    </>
  );
};

export default DitherView;
