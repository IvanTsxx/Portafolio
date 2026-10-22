"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry, Vector4 } from "three";

import type { SourceKind } from "@/components/lab/source/tone-chunk";
import {
  syncSourceUniforms,
  useSourceTexture,
} from "@/components/lab/source/use-source";

import { DotMaterial } from "./dot-material";

const DotMaterialElement = extend(DotMaterial);

const quad = new PlaneGeometry(1, 1);
const viewport = new Vector4();

const lensSpring = { damping: 13, stiffness: 140 } as const;
const strengthSpring = { damping: 9, stiffness: 90 } as const;
const idleStrength = 0.55;

export interface DotSettings {
  cell: number;
  lensRadius: number;
  noiseSpeed: number;
  mark: "round" | "square";
  source: SourceKind;
}

export interface DotPointer {
  x: number;
  y: number;
  isHovering: boolean;
}

export interface DotViewProps {
  settings: DotSettings;
  animate: boolean;
  pointer: RefObject<DotPointer>;
}

interface Spring {
  value: number;
  velocity: number;
}

const stepSpring = (
  spring: Spring,
  target: number,
  { stiffness, damping }: { stiffness: number; damping: number },
  step: number
) => {
  const acceleration =
    stiffness * (target - spring.value) - damping * spring.velocity;
  spring.velocity += acceleration * step;
  spring.value += spring.velocity * step;
};

const settleSpring = (spring: Spring, target: number) => {
  spring.value = target;
  spring.velocity = 0;
};

const DotView = ({ settings, animate, pointer }: DotViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof DotMaterial>>(null);
  const lens = useRef({
    strength: { value: idleStrength, velocity: 0 },
    x: { value: 0.5, velocity: 0 },
    y: { value: 0.5, velocity: 0 },
  });
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
      const { x, y } = lens.current;
      syncSourceUniforms(
        shader,
        renderer,
        { x: x.value, y: y.value },
        portrait,
        settings.source
      );
      renderer.getCurrentViewport(viewport);
      const ratio = renderer.getPixelRatio();
      shader.uLens.set(x.value * viewport.z, y.value * viewport.w);
      shader.uPixelRatio = ratio;
      shader.uCell = settings.cell * ratio;
      shader.uLensRadius = settings.lensRadius * ratio;
    };
  }, [portrait, settings.cell, settings.lensRadius, settings.source]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const step = Math.min(delta, 0.05);
    if (animate) {
      shader.uTime += step * settings.noiseSpeed;
    }
    const time = shader.uTime;
    const { current: hover } = pointer;
    const target = hover.isHovering
      ? { strength: 1, x: hover.x, y: hover.y }
      : {
          strength: idleStrength,
          x: 0.5 + Math.sin(time * 0.37) * 0.3,
          y: 0.5 + Math.cos(time * 0.29) * 0.24,
        };
    const { x, y, strength } = lens.current;
    if (animate) {
      stepSpring(x, target.x, lensSpring, step);
      stepSpring(y, target.y, lensSpring, step);
      stepSpring(strength, target.strength, strengthSpring, step);
    } else {
      settleSpring(x, target.x);
      settleSpring(y, target.y);
      settleSpring(strength, target.strength);
    }
    shader.uLensStrength = strength.value;
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <DotMaterialElement
          key={DotMaterial.key}
          ref={material}
          toneMapped={false}
          uSquare={settings.mark === "square" ? 1 : 0}
        />
      </mesh>
    </>
  );
};

export default DotView;
