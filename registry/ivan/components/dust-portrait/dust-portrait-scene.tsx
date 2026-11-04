"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import { PlaneGeometry, Vector4 } from "three";
import type { WebGLRenderer } from "three";

import { usePrintImage } from "@/registry/ivan/hooks/use-print-image";

import { DustBursts } from "./dust-portrait-bursts";
import {
  budgetDustCount,
  createDustGeometry,
  resolveDustCount,
  sampleDustField,
} from "./dust-portrait-field";
import type { DustFocus } from "./dust-portrait-field";
import { DustGroundMaterial } from "./dust-portrait-ground";
import {
  DustPortraitMaterial,
  dustPortraitDefaults,
  isLighterThan,
} from "./dust-portrait-material";
import { DustTrail } from "./dust-portrait-trail";

export interface DustPortraitSceneProps {
  src: string;
  burst?: boolean;
  focus?: DustFocus;
  density?: number;
  dispersion?: number;
  drift?: number;
  idle?: boolean | number;
  ink?: string;
  paper?: string;
  paused?: boolean;
  pointerTarget?: RefObject<HTMLElement | null>;
}

interface StageBox {
  width: number;
  height: number;
}

const centeredFocus: DustFocus = { x: 0.5, y: 0.5 };
const maxStep = 0.05;
const revealRate = 7;
const aspectPrecision = 100;
const viewport = new Vector4();

class DustRig {
  readonly trail = new DustTrail();
  readonly bursts = new DustBursts();
  readonly material = new DustPortraitMaterial(
    this.trail.uniform,
    this.bursts.uniform
  );
  readonly ground = new DustGroundMaterial({
    uAspect: this.material.uniforms.uAspect,
    uBursts: this.material.uniforms.uBursts,
    uMark: this.material.uniforms.uMark,
    uTime: this.material.uniforms.uTime,
  });
  readonly groundGeometry = new PlaneGeometry(1, 1);
  private rows = 1;
  private elapsed = 0;
  private reveal = 0;
  private imageElement: HTMLImageElement | null = null;

  applyLook(ink: string, paper: string, dispersion: number, drift: number) {
    const { uniforms } = this.material;
    uniforms.uMark.value.set(paper);
    uniforms.uIsLitMark.value = isLighterThan(paper, ink) ? 1 : 0;
    uniforms.uDispersion.value = dispersion;
    uniforms.uDrift.value = drift;
    this.ground.uniforms.uGround.value.set(ink);
  }

  adoptField(rows: number, imageElement: HTMLImageElement) {
    this.rows = rows;
    if (imageElement !== this.imageElement) {
      this.imageElement = imageElement;
      this.reveal = 0;
      this.writeReveal();
    }
  }

  burst(x: number, y: number) {
    this.bursts.add(x, y, this.elapsed);
  }

  readonly handleBeforeRender = (renderer: WebGLRenderer) => {
    renderer.getCurrentViewport(viewport);
    const { uniforms } = this.material;
    uniforms.uAspect.value = viewport.z / Math.max(viewport.w, 1);
    uniforms.uCellPx.value = viewport.w / Math.max(this.rows, 1);
  };

  advance(delta: number, paused: boolean, idle: number) {
    const step = Math.min(delta, maxStep);
    const { uniforms } = this.material;
    if (paused) {
      this.trail.clear();
      this.bursts.clear();
      this.reveal = 1;
      uniforms.uIdle.value = 0;
      this.writeReveal();
      return false;
    }
    this.trail.advance(step);
    this.elapsed += step;
    this.reveal += (1 - this.reveal) * (1 - Math.exp(-revealRate * step));
    if (this.reveal > 0.995) {
      this.reveal = 1;
    }
    uniforms.uTime.value = this.elapsed;
    uniforms.uIdle.value = idle;
    this.writeReveal();
    return (
      idle > 0 ||
      !this.trail.isSettled ||
      this.bursts.isActiveAt(this.elapsed) ||
      this.reveal < 1
    );
  }

  dispose() {
    this.material.dispose();
    this.ground.dispose();
    this.groundGeometry.dispose();
  }

  private writeReveal() {
    this.material.uniforms.uReveal.value = this.reveal;
    this.ground.uniforms.uReveal.value = this.reveal;
  }
}

const resolveTarget = (
  pointerTarget: RefObject<HTMLElement | null> | undefined,
  canvas: HTMLElement
) => pointerTarget?.current ?? canvas;

const useStageBox = (
  pointerTarget: RefObject<HTMLElement | null> | undefined,
  canvas: HTMLElement
) => {
  const [box, setBox] = useState<StageBox | null>(null);

  useEffect(() => {
    const target = resolveTarget(pointerTarget, canvas);
    if (!target) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setBox((current) =>
          current?.width === width && current.height === height
            ? current
            : { height, width }
        );
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [canvas, pointerTarget]);

  return box;
};

interface PointerTrailInput {
  pointerTarget: RefObject<HTMLElement | null> | undefined;
  canvas: HTMLElement;
  trail: DustTrail;
  isEnabled: boolean;
  invalidate: () => void;
}

const usePointerTrail = ({
  pointerTarget,
  canvas,
  trail,
  isEnabled,
  invalidate,
}: PointerTrailInput) => {
  useEffect(() => {
    const target = resolveTarget(pointerTarget, canvas);
    if (!(target && isEnabled)) {
      return;
    }
    const aim = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      trail.aim(
        (event.clientX - rect.left) / Math.max(rect.width, 1),
        1 - (event.clientY - rect.top) / Math.max(rect.height, 1)
      );
      invalidate();
    };
    const release = () => {
      trail.release();
      invalidate();
    };
    const lift = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        release();
      }
    };
    target.addEventListener("pointermove", aim);
    target.addEventListener("pointerdown", aim);
    target.addEventListener("pointerleave", release);
    target.addEventListener("pointercancel", release);
    target.addEventListener("pointerup", lift);
    return () => {
      target.removeEventListener("pointermove", aim);
      target.removeEventListener("pointerdown", aim);
      target.removeEventListener("pointerleave", release);
      target.removeEventListener("pointercancel", release);
      target.removeEventListener("pointerup", lift);
      trail.release();
    };
  }, [canvas, invalidate, isEnabled, pointerTarget, trail]);
};

interface BurstClickInput {
  pointerTarget: RefObject<HTMLElement | null> | undefined;
  canvas: HTMLElement;
  rig: DustRig;
  isEnabled: boolean;
  invalidate: () => void;
}

const useBurstClick = ({
  pointerTarget,
  canvas,
  rig,
  isEnabled,
  invalidate,
}: BurstClickInput) => {
  useEffect(() => {
    const target = resolveTarget(pointerTarget, canvas);
    if (!(target && isEnabled)) {
      return;
    }
    const strike = (event: MouseEvent) => {
      const rect = target.getBoundingClientRect();
      rig.burst(
        (event.clientX - rect.left) / Math.max(rect.width, 1),
        1 - (event.clientY - rect.top) / Math.max(rect.height, 1)
      );
      invalidate();
    };
    target.addEventListener("click", strike);
    return () => target.removeEventListener("click", strike);
  }, [canvas, invalidate, isEnabled, pointerTarget, rig]);
};

export const DustPortraitScene = ({
  src,
  burst = dustPortraitDefaults.burst,
  focus = centeredFocus,
  density = dustPortraitDefaults.density,
  dispersion = dustPortraitDefaults.dispersion,
  drift = dustPortraitDefaults.drift,
  idle = dustPortraitDefaults.idle,
  ink = dustPortraitDefaults.ink,
  paper = dustPortraitDefaults.paper,
  paused = dustPortraitDefaults.paused,
  pointerTarget,
}: DustPortraitSceneProps) => {
  const invalidate = useThree((state) => state.invalidate);
  const canvas = useThree((state) => state.gl.domElement);
  const rig = useMemo(() => new DustRig(), []);
  const image = usePrintImage(src);
  const box = useStageBox(pointerTarget, canvas);
  const deviceCount = useMemo(() => resolveDustCount(), []);
  const isLitMark = isLighterThan(paper, ink);
  const idleStrength = Math.max(0, Number(idle));

  usePointerTrail({
    canvas,
    invalidate,
    isEnabled: !paused,
    pointerTarget,
    trail: rig.trail,
  });

  useBurstClick({
    canvas,
    invalidate,
    isEnabled: burst && !paused,
    pointerTarget,
    rig,
  });

  useEffect(() => () => rig.dispose(), [rig]);

  useEffect(() => {
    rig.applyLook(ink, paper, dispersion, drift);
    invalidate();
  }, [dispersion, drift, ink, invalidate, paper, rig]);

  const aspect = box
    ? Math.round((box.width / box.height) * aspectPrecision) / aspectPrecision
    : null;
  const count = box
    ? budgetDustCount(deviceCount, density, box.width, box.height)
    : 0;
  const roundedCount = Math.round(count / 1000) * 1000;

  const field = useMemo(() => {
    if (!(image && aspect)) {
      return null;
    }
    return sampleDustField({
      aspect,
      count: roundedCount,
      focus: { x: focus.x, y: focus.y },
      image: image.element,
      isLitMark,
    });
  }, [aspect, focus.x, focus.y, image, isLitMark, roundedCount]);

  const geometry = useMemo(
    () => (field ? createDustGeometry(field) : null),
    [field]
  );

  useEffect(() => {
    if (!geometry) {
      return;
    }
    return () => geometry.dispose();
  }, [geometry]);

  useEffect(() => {
    if (!(field && image)) {
      return;
    }
    rig.adoptField(field.rows, image.element);
    invalidate();
  }, [field, image, invalidate, rig]);

  useFrame((_, delta) => {
    if (!geometry) {
      return;
    }
    if (rig.advance(delta, paused, idleStrength)) {
      invalidate();
    }
  });

  if (!geometry) {
    return null;
  }

  return (
    <>
      <mesh
        frustumCulled={false}
        geometry={rig.groundGeometry}
        material={rig.ground}
        renderOrder={0}
      />
      <points
        frustumCulled={false}
        geometry={geometry}
        material={rig.material}
        onBeforeRender={rig.handleBeforeRender}
        renderOrder={1}
      />
    </>
  );
};
