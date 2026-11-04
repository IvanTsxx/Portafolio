"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { PlaneGeometry, Vector3 } from "three";
import type { Intersection, Mesh, Raycaster, WebGLRenderer } from "three";

import { usePrintImage } from "@/registry/ivan/hooks/use-print-image";
import type { PrintImage } from "@/registry/ivan/hooks/use-print-image";
import { createBlueNoiseTexture } from "@/registry/ivan/lib/blue-noise";
import {
  centeredFocus,
  readViewport,
  setCoverImage,
} from "@/registry/ivan/lib/image-cover";
import type { ImageFocus } from "@/registry/ivan/lib/image-cover";
import { orderedDitherIndex } from "@/registry/ivan/lib/ordered-print";
import type { OrderedDither } from "@/registry/ivan/lib/ordered-print";
import { samplePalette } from "@/registry/ivan/lib/palette";
import type { Rgb } from "@/registry/ivan/lib/palette";
import { PointerTrace } from "@/registry/ivan/lib/pointer-trace";
import type { PointerSample } from "@/registry/ivan/lib/pointer-trace";
import {
  createSpring,
  driveSpring,
  frameStep,
} from "@/registry/ivan/lib/spring";

import { BlastPrintMaterial, blastPrintDefaults } from "./blast-print-material";
import { advanceBlast, blastLength, createBlast } from "./blast-timeline";
import type { StagePoint } from "./blast-timeline";

export interface BlastPrintSceneProps {
  src: string;
  focus?: ImageFocus;
  ink?: string;
  paper?: string;
  dither?: OrderedDither;
  cell?: number;
  threshold?: number;
  auraRadius?: number;
  blasts?: number;
  paused?: boolean;
}

interface BlastLook {
  ink: string;
  paper: string;
  dither: OrderedDither;
  cell: number;
  threshold: number;
  auraRadius: number;
}

interface BlastFrameInput {
  delta: number;
  paused: boolean;
  pointer: PointerSample;
}

const followSpring = { damping: 16, stiffness: 120 } as const;
const auraSpring = { damping: 11, stiffness: 90 } as const;
const auraBase = 0.24;
const maxAuraStrength = 1.2;
const frameCenter: StagePoint = { x: 0.5, y: 0.5 };

const hitEverywhere = function hitEverywhere(
  this: Mesh,
  _raycaster: Raycaster,
  intersects: Intersection[]
) {
  intersects.push({ distance: 0, object: this, point: new Vector3() });
};

class BlastPrintRig {
  readonly material = new BlastPrintMaterial();
  readonly geometry = new PlaneGeometry(1, 1);
  private readonly blueNoise = createBlueNoiseTexture();
  private readonly trace = new PointerTrace();
  private readonly blast = createBlast();
  private readonly aura = {
    strength: createSpring(0),
    x: createSpring(0.4),
    y: createSpring(0.7),
  };
  private cell: number = blastPrintDefaults.cell;
  private request: StagePoint | null = null;

  constructor() {
    this.material.uniforms.uBlueNoise.value = this.blueNoise;
  }

  applyLook({ ink, paper, dither, cell, threshold, auraRadius }: BlastLook) {
    const { uniforms } = this.material;
    uniforms.uInk.value.set(ink);
    uniforms.uPaper.value.set(paper);
    uniforms.uDither.value = orderedDitherIndex(dither);
    uniforms.uThreshold.value = threshold;
    uniforms.uAuraRadius.value = auraBase * auraRadius;
    this.cell = cell;
  }

  applyImage(image: PrintImage | null, focus: ImageFocus) {
    setCoverImage(this.material.uniforms, image, focus);
  }

  applyPalette(palette: readonly Rgb[]) {
    const inks = this.material.uniforms.uPalette.value;
    for (const [index, [red, green, blue]] of palette.entries()) {
      inks[index]?.set(red / 255, green / 255, blue / 255);
    }
  }

  detonate(origin: StagePoint) {
    this.request = origin;
  }

  advance({ delta, paused, pointer }: BlastFrameInput) {
    const { aura, blast, trace } = this;
    const { uniforms } = this.material;
    const step = frameStep(delta);
    const isMoving = !paused;
    trace.update(pointer, step, isMoving);
    advanceBlast(blast, {
      mode: isMoving ? "running" : "still",
      request: this.request,
      step,
    });
    this.request = null;

    const targetX = trace.isActive ? trace.x : aura.x.value;
    const targetY = trace.isActive ? trace.y : aura.y.value;
    driveSpring(aura.x, targetX, followSpring, step, isMoving);
    driveSpring(aura.y, targetY, followSpring, step, isMoving);
    const isBlasting = blast.time - blast.firedAt < blastLength;
    driveSpring(
      aura.strength,
      trace.isActive && !isBlasting ? 1 : 0,
      auraSpring,
      step,
      isMoving
    );

    const { frame } = blast;
    uniforms.uTime.value = blast.time;
    uniforms.uAuraStrength.value = Math.min(
      Math.max(aura.strength.value, 0),
      maxAuraStrength
    );
    uniforms.uRing.value = frame.ring;
    uniforms.uFront.value = frame.front;
    uniforms.uReprint.value = frame.reprint;
    uniforms.uColor.value = frame.color;
  }

  readonly handleBeforeRender = (renderer: WebGLRenderer) => {
    const { uniforms } = this.material;
    const viewport = readViewport(uniforms, renderer);
    uniforms.uCell.value = this.cell * renderer.getPixelRatio();
    uniforms.uAura.value.set(
      this.aura.x.value * viewport.z,
      this.aura.y.value * viewport.w
    );
    uniforms.uBlast.value.set(
      this.blast.origin.x * viewport.z,
      this.blast.origin.y * viewport.w
    );
  };

  dispose() {
    this.material.dispose();
    this.geometry.dispose();
    this.blueNoise.dispose();
  }
}

export const BlastPrintScene = ({
  src,
  focus = centeredFocus,
  ink = blastPrintDefaults.ink,
  paper = blastPrintDefaults.paper,
  dither = blastPrintDefaults.dither,
  cell = blastPrintDefaults.cell,
  threshold = blastPrintDefaults.threshold,
  auraRadius = blastPrintDefaults.auraRadius,
  blasts = blastPrintDefaults.blasts,
  paused = blastPrintDefaults.paused,
}: BlastPrintSceneProps) => {
  const invalidate = useThree((state) => state.invalidate);
  const rig = useMemo(() => new BlastPrintRig(), []);
  const image = usePrintImage(src);
  const palette = useMemo(
    () => (image ? samplePalette(image.element) : null),
    [image]
  );

  useEffect(() => () => rig.dispose(), [rig]);

  useEffect(() => {
    rig.applyLook({ auraRadius, cell, dither, ink, paper, threshold });
    invalidate();
  }, [auraRadius, cell, dither, ink, invalidate, paper, rig, threshold]);

  useEffect(() => {
    rig.applyImage(image, { x: focus.x, y: focus.y });
    if (palette) {
      rig.applyPalette(palette);
    }
    invalidate();
  }, [focus.x, focus.y, image, invalidate, palette, rig]);

  const handledBlasts = useRef(blasts);
  useEffect(() => {
    if (blasts !== handledBlasts.current) {
      handledBlasts.current = blasts;
      rig.detonate(frameCenter);
      invalidate();
    }
  }, [blasts, invalidate, rig]);

  useFrame((state, delta) => {
    rig.advance({ delta, paused, pointer: state.pointer });
  });

  return (
    <mesh
      frustumCulled={false}
      geometry={rig.geometry}
      material={rig.material}
      onBeforeRender={rig.handleBeforeRender}
      onPointerDown={(event) => {
        rig.detonate({
          x: (event.pointer.x + 1) / 2,
          y: (event.pointer.y + 1) / 2,
        });
        invalidate();
      }}
      raycast={hitEverywhere}
    />
  );
};
