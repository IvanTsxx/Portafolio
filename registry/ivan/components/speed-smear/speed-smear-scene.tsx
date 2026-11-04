"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { MathUtils, PlaneGeometry } from "three";
import type { WebGLRenderer } from "three";

import { usePrintImage } from "@/registry/ivan/hooks/use-print-image";
import type { PrintImage } from "@/registry/ivan/hooks/use-print-image";
import {
  centeredFocus,
  readViewport,
  setCoverImage,
} from "@/registry/ivan/lib/image-cover";
import type { ImageFocus } from "@/registry/ivan/lib/image-cover";
import { PointerLight } from "@/registry/ivan/lib/pointer-light";
import type { PointerSample } from "@/registry/ivan/lib/pointer-trace";

import { SpeedSmearMaterial, speedSmearDefaults } from "./speed-smear-material";

export interface SpeedSmearSceneProps {
  src: string;
  focus?: ImageFocus;
  ink?: string;
  paper?: string;
  smear?: number;
  reach?: number;
  angle?: number;
  cell?: number;
  dither?: boolean;
  paused?: boolean;
}

interface SmearLook {
  ink: string;
  paper: string;
  smear: number;
  reach: number;
  angle: number;
  cell: number;
  dither: boolean;
}

interface SmearFrame {
  delta: number;
  paused: boolean;
  pointer: PointerSample;
}

class SpeedSmearRig {
  readonly material = new SpeedSmearMaterial();
  readonly geometry = new PlaneGeometry(1, 1);
  private readonly light = new PointerLight();
  private cell: number = speedSmearDefaults.cell;

  applyLook({ ink, paper, smear, reach, angle, cell, dither }: SmearLook) {
    const { uniforms } = this.material;
    uniforms.uInk.value.set(ink);
    uniforms.uPaper.value.set(paper);
    uniforms.uSmear.value = smear;
    uniforms.uReach.value = reach;
    uniforms.uAngle.value = MathUtils.degToRad(angle);
    uniforms.uDither.value = dither ? 1 : 0;
    this.cell = cell;
  }

  applyImage(image: PrintImage | null, focus: ImageFocus) {
    setCoverImage(this.material.uniforms, image, focus);
  }

  advance({ delta, paused, pointer }: SmearFrame) {
    this.light.advance(pointer, delta, !paused);
    this.material.uniforms.uKick.value = this.light.kick;
  }

  readonly handleBeforeRender = (renderer: WebGLRenderer) => {
    const { uniforms } = this.material;
    const viewport = readViewport(uniforms, renderer);
    const aspect = viewport.z / Math.max(viewport.w, 1);
    uniforms.uLight.value.set(
      (this.light.x - 0.5) * aspect,
      this.light.y - 0.5
    );
    uniforms.uCell.value = Math.max(
      Math.round(this.cell * renderer.getPixelRatio()),
      1
    );
  };

  dispose() {
    this.material.dispose();
    this.geometry.dispose();
  }
}

export const SpeedSmearScene = ({
  src,
  focus = centeredFocus,
  ink = speedSmearDefaults.ink,
  paper = speedSmearDefaults.paper,
  smear = speedSmearDefaults.smear,
  reach = speedSmearDefaults.reach,
  angle = speedSmearDefaults.angle,
  cell = speedSmearDefaults.cell,
  dither = speedSmearDefaults.dither,
  paused = speedSmearDefaults.paused,
}: SpeedSmearSceneProps) => {
  const invalidate = useThree((state) => state.invalidate);
  const rig = useMemo(() => new SpeedSmearRig(), []);
  const image = usePrintImage(src);

  useEffect(() => () => rig.dispose(), [rig]);

  useEffect(() => {
    rig.applyLook({ angle, cell, dither, ink, paper, reach, smear });
    invalidate();
  }, [angle, cell, dither, ink, invalidate, paper, reach, rig, smear]);

  useEffect(() => {
    rig.applyImage(image, { x: focus.x, y: focus.y });
    invalidate();
  }, [focus.x, focus.y, image, invalidate, rig]);

  useFrame((state, delta) => {
    rig.advance({ delta, paused, pointer: state.pointer });
  });

  return (
    <mesh
      frustumCulled={false}
      geometry={rig.geometry}
      material={rig.material}
      onBeforeRender={rig.handleBeforeRender}
    />
  );
};
