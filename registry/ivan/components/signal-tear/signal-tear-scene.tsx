"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { PlaneGeometry } from "three";
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

import { SignalTearMaterial, signalTearDefaults } from "./signal-tear-material";

export interface SignalTearSceneProps {
  src: string;
  focus?: ImageFocus;
  ink?: string;
  paper?: string;
  tear?: number;
  ghost?: number;
  grain?: number;
  paused?: boolean;
}

interface TearLook {
  ink: string;
  paper: string;
  tear: number;
  ghost: number;
  grain: number;
}

interface TearFrame {
  delta: number;
  paused: boolean;
  pointer: PointerSample;
}

const stillTime = 4.2;
const maxStep = 0.05;

class SignalTearRig {
  readonly material = new SignalTearMaterial();
  readonly geometry = new PlaneGeometry(1, 1);
  private readonly light = new PointerLight();
  private elapsed = 0;

  applyLook({ ink, paper, tear, ghost, grain }: TearLook) {
    const { uniforms } = this.material;
    uniforms.uInk.value.set(ink);
    uniforms.uPaper.value.set(paper);
    uniforms.uTear.value = tear;
    uniforms.uGhost.value = ghost;
    uniforms.uGrain.value = grain;
  }

  applyImage(image: PrintImage | null, focus: ImageFocus) {
    setCoverImage(this.material.uniforms, image, focus);
  }

  advance({ delta, paused, pointer }: TearFrame) {
    const { uniforms } = this.material;
    this.light.advance(pointer, delta, !paused);
    if (paused) {
      this.elapsed = stillTime;
    } else {
      this.elapsed += Math.min(delta, maxStep);
    }
    uniforms.uTime.value = this.elapsed;
    uniforms.uKick.value = this.light.kick;
  }

  readonly handleBeforeRender = (renderer: WebGLRenderer) => {
    const { uniforms } = this.material;
    const viewport = readViewport(uniforms, renderer);
    const aspect = viewport.z / Math.max(viewport.w, 1);
    uniforms.uLight.value.set(
      (this.light.x - 0.5) * aspect,
      this.light.y - 0.5
    );
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
  };

  dispose() {
    this.material.dispose();
    this.geometry.dispose();
  }
}

export const SignalTearScene = ({
  src,
  focus = centeredFocus,
  ink = signalTearDefaults.ink,
  paper = signalTearDefaults.paper,
  tear = signalTearDefaults.tear,
  ghost = signalTearDefaults.ghost,
  grain = signalTearDefaults.grain,
  paused = signalTearDefaults.paused,
}: SignalTearSceneProps) => {
  const invalidate = useThree((state) => state.invalidate);
  const rig = useMemo(() => new SignalTearRig(), []);
  const image = usePrintImage(src);

  useEffect(() => () => rig.dispose(), [rig]);

  useEffect(() => {
    rig.applyLook({ ghost, grain, ink, paper, tear });
    invalidate();
  }, [ghost, grain, ink, invalidate, paper, rig, tear]);

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
