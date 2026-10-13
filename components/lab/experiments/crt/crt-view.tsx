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

import { CrtMaterial } from "./crt-material";

const CrtMaterialElement = extend(CrtMaterial);

const quad = new PlaneGeometry(1, 1);

const bandCycleSeconds = 6;
const restingBand = 0.32;
const wobbleDecay = 2.4;
const wobblePerSpeed = 0.35;

export interface CrtSettings {
  bandSpeed: number;
  curvature: number;
  lines: number;
  source: SourceKind;
}

export interface CrtViewProps {
  settings: CrtSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const CrtView = ({ settings, animate, pointer }: CrtViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof CrtMaterial>>(null);
  const coil = useDampedPointer(pointer, animate);
  const degauss = useRef({ wasHovering: false, wobble: 0, x: 0.5, y: 0.5 });
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
      shader.uPointer.set(coil.current.x * x, coil.current.y * y);
      shader.uPixelRatio = renderer.getPixelRatio();
      shader.uCurvature = settings.curvature / 100;
      shader.uLines = settings.lines;
    };
  }, [coil, portrait, settings.curvature, settings.lines, settings.source]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    if (!animate) {
      shader.uBand = restingBand;
      shader.uWobble = 0;
      return;
    }
    const step = Math.min(delta, 0.05);
    const state = degauss.current;
    const { current: hover } = pointer;
    const speed =
      step > 0 ? Math.hypot(hover.x - state.x, hover.y - state.y) / step : 0;
    const kick = hover.isHovering && !state.wasHovering ? 1 : 0;
    const push = hover.isHovering ? Math.min(speed * wobblePerSpeed, 1) : 0;
    state.wobble = Math.max(
      state.wobble * Math.exp(-step * wobbleDecay),
      push,
      kick
    );
    state.wasHovering = hover.isHovering;
    state.x = hover.x;
    state.y = hover.y;
    shader.uTime += step;
    shader.uBand += (step * settings.bandSpeed) / bandCycleSeconds;
    shader.uWobble = state.wobble;
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <CrtMaterialElement
          key={CrtMaterial.key}
          ref={material}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default CrtView;
