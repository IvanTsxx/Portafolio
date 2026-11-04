"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, PlaneGeometry, Vector3 } from "three";
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
import { samplePalette } from "@/registry/ivan/lib/palette";
import type { Rgb } from "@/registry/ivan/lib/palette";
import { PointerTrace } from "@/registry/ivan/lib/pointer-trace";
import type { PointerSample } from "@/registry/ivan/lib/pointer-trace";
import {
  createSpring,
  driveSpring,
  frameStep,
} from "@/registry/ivan/lib/spring";

import {
  StormPrintMaterial,
  stormDitherIndex,
  stormPrintDefaults,
} from "./storm-print-material";
import type { StormDither } from "./storm-print-material";
import { advanceStorm, createStorm } from "./storm-timeline";
import type { StrikePoint } from "./storm-timeline";

export type StormPrintMode = "ink" | "color";

export interface StormPrintSceneProps {
  src: string;
  focus?: ImageFocus;
  ink?: string;
  paper?: string;
  dither?: StormDither;
  print?: StormPrintMode;
  cell?: number;
  threshold?: number;
  contrast?: number;
  rain?: number;
  rainSpeed?: number;
  rainAngle?: number;
  lightning?: boolean;
  frequency?: number;
  flash?: number;
  colorHold?: number;
  aura?: number;
  auraRadius?: number;
  strikes?: number;
  paused?: boolean;
}

interface StormLook {
  ink: string;
  paper: string;
  dither: StormDither;
  print: StormPrintMode;
  cell: number;
  threshold: number;
  contrast: number;
  rain: number;
  rainSpeed: number;
  rainAngle: number;
  lightning: boolean;
  frequency: number;
  flash: number;
  colorHold: number;
  aura: number;
  auraRadius: number;
}

interface StormFrame {
  delta: number;
  paused: boolean;
  pointer: PointerSample;
}

const followSpring = { damping: 18, stiffness: 140 } as const;
const auraSpring = { damping: 12, stiffness: 90 } as const;
const burstKick = 6;
const rainRate = 4;
const shakeLength = 0.24;
const shakeCells = 2;
const auraSize = 0.22;

const hitEverywhere = function hitEverywhere(
  this: Mesh,
  _raycaster: Raycaster,
  intersects: Intersection[]
) {
  intersects.push({ distance: 0, object: this, point: new Vector3() });
};

class StormPrintRig {
  readonly material = new StormPrintMaterial();
  readonly geometry = new PlaneGeometry(1, 1);
  private readonly blueNoise = createBlueNoiseTexture();
  private readonly trace = new PointerTrace();
  private readonly storm = createStorm();
  private readonly aura = {
    strength: createSpring(0),
    x: createSpring(0.62),
    y: createSpring(0.6),
  };
  private readonly burst = { age: Infinity, x: 0.5, y: 0.5 };
  private look: StormLook | null = null;
  private pendingPress: StrikePoint | null = null;
  private isStrikeRequested = false;
  private rain: number = stormPrintDefaults.rain;
  private shakeX = 0;
  private shakeY = 0;

  constructor() {
    this.material.uniforms.uBlueNoise.value = this.blueNoise;
  }

  applyLook(look: StormLook) {
    const { uniforms } = this.material;
    this.look = look;
    uniforms.uInk.value.set(look.ink);
    uniforms.uPaper.value.set(look.paper);
    uniforms.uDither.value = stormDitherIndex(look.dither);
    uniforms.uThreshold.value = look.threshold;
    uniforms.uContrast.value = look.contrast;
    uniforms.uRainSpeed.value = look.rainSpeed;
    uniforms.uRainSlant.value = Math.tan(MathUtils.degToRad(look.rainAngle));
    uniforms.uAuraSize.value = auraSize * look.auraRadius;
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

  strike() {
    this.isStrikeRequested = true;
  }

  press(x: number, y: number) {
    this.pendingPress = { x, y };
    this.isStrikeRequested = true;
  }

  advance({ delta, paused, pointer }: StormFrame) {
    const { look } = this;
    if (!look) {
      return;
    }
    const { aura, burst, storm, trace } = this;
    const { uniforms } = this.material;
    const step = frameStep(delta);
    const isMoving = !paused;
    trace.update(pointer, step, isMoving);

    advanceStorm(
      storm,
      {
        colorHold: look.colorHold,
        flash: look.flash,
        frequency: look.frequency,
        lightning: look.lightning,
      },
      {
        isRequested: this.isStrikeRequested,
        landing: this.pendingPress,
        mode: isMoving ? "running" : "still",
        random: Math.random,
        step,
      }
    );
    this.isStrikeRequested = false;

    this.rain = isMoving
      ? this.rain + (look.rain - this.rain) * (1 - Math.exp(-step * rainRate))
      : look.rain;

    if (this.pendingPress && isMoving) {
      burst.age = 0;
      burst.x = this.pendingPress.x;
      burst.y = this.pendingPress.y;
      aura.strength.velocity += burstKick;
    }
    this.pendingPress = null;
    if (isMoving) {
      burst.age += step;
    } else {
      burst.age = Infinity;
    }

    const shake =
      isMoving && burst.age < shakeLength
        ? (1 - burst.age / shakeLength) ** 2 * shakeCells
        : 0;
    this.shakeX = Math.round((Math.random() * 2 - 1) * shake);
    this.shakeY = Math.round((Math.random() * 2 - 1) * shake);

    const targetX = trace.isActive ? trace.x : aura.x.value;
    const targetY = trace.isActive ? trace.y : aura.y.value;
    driveSpring(aura.x, targetX, followSpring, step, isMoving);
    driveSpring(aura.y, targetY, followSpring, step, isMoving);
    driveSpring(
      aura.strength,
      trace.isActive ? 1 : 0,
      auraSpring,
      step,
      isMoving
    );

    uniforms.uTime.value = storm.time;
    uniforms.uRain.value = this.rain;
    uniforms.uFlash.value = storm.flash;
    uniforms.uColor.value = look.print === "color" ? 1 : storm.color;
    uniforms.uStrikeSeed.value = storm.seed;
    uniforms.uLanding.value.set(storm.landing.x, storm.landing.y);
    uniforms.uAuraStrength.value = Math.max(aura.strength.value, 0) * look.aura;
    uniforms.uBurstAge.value = Number.isFinite(burst.age) ? burst.age : 10;
  }

  readonly handleBeforeRender = (renderer: WebGLRenderer) => {
    const { uniforms } = this.material;
    const viewport = readViewport(uniforms, renderer);
    const cell =
      (this.look?.cell ?? stormPrintDefaults.cell) * renderer.getPixelRatio();
    uniforms.uCell.value = cell;
    uniforms.uShake.value.set(this.shakeX * cell, this.shakeY * cell);
    uniforms.uAura.value.set(
      this.aura.x.value * viewport.z,
      this.aura.y.value * viewport.w
    );
    uniforms.uBurst.value.set(
      this.burst.x * viewport.z,
      this.burst.y * viewport.w
    );
  };

  dispose() {
    this.material.dispose();
    this.geometry.dispose();
    this.blueNoise.dispose();
  }
}

export const StormPrintScene = ({
  src,
  focus = centeredFocus,
  ink = stormPrintDefaults.ink,
  paper = stormPrintDefaults.paper,
  dither = stormPrintDefaults.dither,
  print = stormPrintDefaults.print,
  cell = stormPrintDefaults.cell,
  threshold = stormPrintDefaults.threshold,
  contrast = stormPrintDefaults.contrast,
  rain = stormPrintDefaults.rain,
  rainSpeed = stormPrintDefaults.rainSpeed,
  rainAngle = stormPrintDefaults.rainAngle,
  lightning = stormPrintDefaults.lightning,
  frequency = stormPrintDefaults.frequency,
  flash = stormPrintDefaults.flash,
  colorHold = stormPrintDefaults.colorHold,
  aura = stormPrintDefaults.aura,
  auraRadius = stormPrintDefaults.auraRadius,
  strikes = stormPrintDefaults.strikes,
  paused = stormPrintDefaults.paused,
}: StormPrintSceneProps) => {
  const invalidate = useThree((state) => state.invalidate);
  const rig = useMemo(() => new StormPrintRig(), []);
  const image = usePrintImage(src);
  const palette = useMemo(
    () => (image ? samplePalette(image.element) : null),
    [image]
  );

  useEffect(() => () => rig.dispose(), [rig]);

  useEffect(() => {
    rig.applyLook({
      aura,
      auraRadius,
      cell,
      colorHold,
      contrast,
      dither,
      flash,
      frequency,
      ink,
      lightning,
      paper,
      print,
      rain,
      rainAngle,
      rainSpeed,
      threshold,
    });
    invalidate();
  }, [
    aura,
    auraRadius,
    cell,
    colorHold,
    contrast,
    dither,
    flash,
    frequency,
    ink,
    invalidate,
    lightning,
    paper,
    print,
    rain,
    rainAngle,
    rainSpeed,
    rig,
    threshold,
  ]);

  useEffect(() => {
    rig.applyImage(image, { x: focus.x, y: focus.y });
    if (palette) {
      rig.applyPalette(palette);
    }
    invalidate();
  }, [focus.x, focus.y, image, invalidate, palette, rig]);

  const handledStrikes = useRef(strikes);
  useEffect(() => {
    if (strikes !== handledStrikes.current) {
      handledStrikes.current = strikes;
      rig.strike();
      invalidate();
    }
  }, [invalidate, rig, strikes]);

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
        rig.press((event.pointer.x + 1) / 2, (event.pointer.y + 1) / 2);
        invalidate();
      }}
      raycast={hitEverywhere}
    />
  );
};
