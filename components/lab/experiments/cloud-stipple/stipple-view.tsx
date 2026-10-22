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
  useBlueNoiseTexture,
  useDampedPointer,
  useSourceTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";

import { StippleMaterial } from "./stipple-material";

const StippleMaterialElement = extend(StippleMaterial);

const quad = new PlaneGeometry(1, 1);
const glowRate = 6;

export interface StippleSettings {
  boil: number;
  contrast: number;
  dot: number;
  invert: boolean;
  source: SourceImage;
}

interface StippleViewProps {
  reveal: RefObject<StageReveal>;
  settings: StippleSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const StippleView = ({
  settings,
  animate,
  pointer,
  reveal,
}: StippleViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof StippleMaterial>>(null);
  const light = useDampedPointer(pointer, animate);
  const portrait = useSourceTexture(settings.source);
  const noise = useBlueNoiseTexture();
  const clock = useRef({ boil: 0, glow: 0 });

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
        settings.source,
        reveal.current
      );
      const ratio = renderer.getPixelRatio();
      shader.uPixelRatio = ratio;
      shader.uDot = settings.dot * ratio;
      shader.uContrast = settings.contrast / 100;
      shader.uInvert = settings.invert ? 1 : 0;
      shader.uNoise = noise;
      shader.uHasNoise = noise ? 1 : 0;
    };
  }, [
    reveal,
    light,
    noise,
    portrait,
    settings.contrast,
    settings.dot,
    settings.invert,
    settings.source,
  ]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const step = Math.min(delta, 0.05);
    const state = clock.current;
    if (animate) {
      state.boil += step * settings.boil;
    }
    const target = pointer.current.isHovering ? 1 : 0;
    state.glow = animate
      ? state.glow + (target - state.glow) * (1 - Math.exp(-glowRate * step))
      : target;
    shader.uPhase = Math.floor(state.boil);
    shader.uGlow = state.glow;
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <StippleMaterialElement
          key={StippleMaterial.key}
          ref={material}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default StippleView;
