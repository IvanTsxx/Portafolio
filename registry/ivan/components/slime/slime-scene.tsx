"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { PlaneGeometry } from "three";

import {
  createSlimeBody,
  effectiveRadius,
  excitementOf,
  setSlimeBounds,
  settleSlimeBody,
  slimeBalls,
  splatSlimeBody,
  stepSlimeBody,
} from "./slime-body";
import type { PointerInput, SlimeTuning } from "./slime-body";
import {
  applySlimeTones,
  cameraDistance,
  createSlimeMaterial,
  createSlimeUniforms,
  slimeDefaults,
} from "./slime-material";
import type { SlimeTones } from "./slime-material";

export interface SlimeSceneProps {
  ink?: string;
  paper?: string;
  glow?: string;
  night?: boolean;
  viscosity?: number;
  reach?: number;
  veins?: number;
  paused?: boolean;
}

const frameHalfHeight = 1.3;
const warmUpSeconds = 1.4;
const splatSeconds = 0.5;

class SlimeRig {
  readonly uniforms = createSlimeUniforms();
  readonly material = createSlimeMaterial(this.uniforms);
  readonly geometry = new PlaneGeometry(2, 2);
  private readonly body = createSlimeBody();
  private pointer: PointerInput | null = null;
  private halfWidth = frameHalfHeight;
  private halfHeight = frameHalfHeight;
  private tuning: SlimeTuning = {
    reach: slimeDefaults.reach,
    viscosity: slimeDefaults.viscosity,
  };

  private isWarm = false;
  private hasPendingPress = false;

  constructor() {
    this.sync();
  }

  private warmUp() {
    this.isWarm = true;
    settleSlimeBody(this.body, warmUpSeconds, this.tuning);
    splatSlimeBody(this.body, this.tuning);
    settleSlimeBody(this.body, splatSeconds, this.tuning);
    this.sync();
  }

  applyTones(tones: SlimeTones, veins: number) {
    applySlimeTones(this.uniforms, tones);
    this.uniforms.veins.value = veins;
  }

  applyTuning(tuning: SlimeTuning) {
    this.tuning = tuning;
  }

  applyViewport(width: number, height: number, pixelRatio: number) {
    const aspect = width / Math.max(height, 1);
    this.halfHeight =
      aspect < 1.25 ? (frameHalfHeight * 1.25) / aspect : frameHalfHeight;
    this.halfWidth = this.halfHeight * aspect;
    setSlimeBounds(this.body, {
      halfHeight: this.halfHeight,
      halfWidth: this.halfWidth,
    });
    if (!this.isWarm && width > 0 && height > 0) {
      this.warmUp();
    }
    this.uniforms.aspect.value = aspect;
    this.uniforms.focal.value = cameraDistance / this.halfHeight;
    this.uniforms.pixel.value =
      (this.halfHeight * 2) / Math.max(height * pixelRatio, 1);
  }

  track(element: HTMLElement, event: PointerEvent, pressed: boolean) {
    const bounds = element.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = 1 - ((event.clientY - bounds.top) / bounds.height) * 2;
    this.pointer = { pressed, x: x * this.halfWidth, y: y * this.halfHeight };
    if (pressed) {
      this.hasPendingPress = true;
    }
  }

  isPressed() {
    return this.pointer?.pressed ?? false;
  }

  forget() {
    this.pointer = null;
  }

  advance(delta: number) {
    const { pointer } = this;
    const input =
      pointer && this.hasPendingPress ? { ...pointer, pressed: true } : pointer;
    this.hasPendingPress = false;
    stepSlimeBody(this.body, delta, input, this.tuning);
    this.sync();
  }

  private sync() {
    const { body, uniforms } = this;
    for (const [index, entry] of slimeBalls(body).entries()) {
      uniforms.ballValues[index]?.set(
        entry.x,
        entry.y,
        entry.z,
        effectiveRadius(entry)
      );
    }
    uniforms.excite.value = excitementOf(body);
    uniforms.touch.value.set(body.touch.x, body.touch.y, body.touch.strength);
    uniforms.time.value = body.time;
  }

  dispose() {
    this.material.dispose();
    this.geometry.dispose();
  }
}

const usePointerTracking = (rig: SlimeRig) => {
  const element = useThree((state) => state.gl.domElement);

  useEffect(() => {
    const onMove = (event: PointerEvent) =>
      rig.track(element, event, rig.isPressed());
    const onDown = (event: PointerEvent) => {
      element.setPointerCapture(event.pointerId);
      rig.track(element, event, true);
    };
    const onUp = (event: PointerEvent) => {
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
      rig.track(element, event, false);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && !rig.isPressed()) {
        rig.forget();
      }
    };
    const onCancel = () => rig.forget();
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("pointercancel", onCancel);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("pointercancel", onCancel);
    };
  }, [element, rig]);
};

export const SlimeScene = ({
  ink = slimeDefaults.ink,
  paper = slimeDefaults.paper,
  glow = slimeDefaults.glow,
  night = slimeDefaults.night,
  viscosity = slimeDefaults.viscosity,
  reach = slimeDefaults.reach,
  veins = slimeDefaults.veins,
  paused = slimeDefaults.paused,
}: SlimeSceneProps) => {
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const invalidate = useThree((state) => state.invalidate);
  const rig = useMemo(() => new SlimeRig(), []);

  usePointerTracking(rig);

  useEffect(() => () => rig.dispose(), [rig]);

  useLayoutEffect(() => {
    rig.applyTones({ glow, ink, night, paper }, veins);
    invalidate();
  }, [glow, ink, invalidate, night, paper, rig, veins]);

  useLayoutEffect(() => {
    rig.applyTuning({ reach, viscosity });
  }, [reach, rig, viscosity]);

  useLayoutEffect(() => {
    rig.applyViewport(width, height, pixelRatio);
    invalidate();
  }, [height, invalidate, pixelRatio, rig, width]);

  useFrame((_, delta) => {
    if (!paused) {
      rig.advance(delta);
    }
  });

  return (
    <mesh
      frustumCulled={false}
      geometry={rig.geometry}
      material={rig.material}
    />
  );
};
