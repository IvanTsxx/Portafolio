"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type { Ref } from "react";
import {
  MathUtils,
  PerspectiveCamera,
  Sphere,
  SphereGeometry,
  Vector3,
} from "three";
import type { Intersection, Mesh, Object3D, Raycaster } from "three";

import {
  LunarDitherMaterial,
  clampImpactCapacity,
  impactTiming,
  lunarDitherDefaults,
} from "./lunar-dither-material";
import { MeteorStreaks } from "./lunar-dither-streaks";

export interface LunarDitherSceneHandle {
  clearImpacts: () => void;
}

export interface LunarDitherSceneProps {
  ink?: string;
  paper?: string;
  pixelSize?: number;
  grain?: number;
  rotationSpeed?: number;
  craterScale?: number;
  followPointer?: boolean;
  lightDirection?: readonly [number, number, number];
  paused?: boolean;
  impacts?: boolean;
  maxImpacts?: number;
  onImpact?: (point: Vector3) => void;
  ref?: Ref<LunarDitherSceneHandle>;
}

interface MoonLook {
  ink: string;
  paper: string;
  pixelSize: number;
  grain: number;
  craterScale: number;
}

interface MoonFrame {
  cameraPosition: Vector3;
  lightDirection: readonly [number, number, number] | null;
  pointer: { x: number; y: number };
  delta: number;
  dpr: number;
  paused: boolean;
  rotationSpeed: number;
}

const cameraFov = 26;
const moonFill = 0.78;
const axialTilt = 0.12;
const restingTurn = 0.6;
const lightEase = 3.2;
const maxStep = 0.05;
const restingPointer = { x: 0, y: 0.15 };

const lightFromPointer = (x: number, y: number, target: Vector3) => {
  const azimuth = MathUtils.degToRad(MathUtils.clamp(x, -1, 1) * 110 - 55);
  const elevation = MathUtils.degToRad(MathUtils.clamp(y, -1, 1) * 55 + 12);
  return target.set(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    Math.cos(azimuth) * Math.cos(elevation)
  );
};

const hitSphere = new Sphere();
const hitPoint = new Vector3();

const raycastUnitSphere = function raycastUnitSphere(
  this: Object3D,
  raycaster: Raycaster,
  intersects: Intersection[]
) {
  hitSphere.center.setFromMatrixPosition(this.matrixWorld);
  hitSphere.radius = this.matrixWorld.getMaxScaleOnAxis();
  if (!raycaster.ray.intersectSphere(hitSphere, hitPoint)) {
    return;
  }
  const distance = raycaster.ray.origin.distanceTo(hitPoint);
  if (distance < raycaster.near || distance > raycaster.far) {
    return;
  }
  intersects.push({ distance, object: this, point: hitPoint.clone() });
};

const fitMoonCamera = (
  camera: PerspectiveCamera,
  width: number,
  height: number
) => {
  const aspect = width / Math.max(height, 1);
  const halfHeight = Math.tan(MathUtils.degToRad(cameraFov / 2));
  camera.aspect = aspect;
  camera.position.set(0, 0, 1 / (moonFill * halfHeight * Math.min(1, aspect)));
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
};

class MoonRig {
  readonly material = new LunarDitherMaterial();
  readonly geometry = new SphereGeometry(1, 160, 120);
  readonly streaks = new MeteorStreaks(this.material.uniforms);
  private readonly toCamera = new Vector3();
  private readonly light = lightFromPointer(
    restingPointer.x,
    restingPointer.y,
    new Vector3()
  );
  private readonly lightTarget = new Vector3();
  private elapsed = 0;

  applyLook({ ink, paper, pixelSize, grain, craterScale }: MoonLook) {
    const { uniforms } = this.material;
    uniforms.uInk.value.set(ink);
    uniforms.uPaper.value.set(paper);
    uniforms.uPixelSize.value = pixelSize;
    uniforms.uGrain.value = grain;
    uniforms.uCraterScale.value = craterScale;
  }

  advance(moon: Mesh | null, frame: MoonFrame) {
    const { uniforms } = this.material;
    if (frame.lightDirection) {
      this.lightTarget.set(...frame.lightDirection).normalize();
    } else {
      lightFromPointer(frame.pointer.x, frame.pointer.y, this.lightTarget);
    }
    if (frame.paused) {
      this.light.copy(this.lightTarget);
    } else {
      const step = Math.min(frame.delta, maxStep);
      this.elapsed += step;
      this.light
        .lerp(this.lightTarget, 1 - Math.exp(-lightEase * step))
        .normalize();
      if (moon) {
        moon.rotation.y += step * frame.rotationSpeed;
      }
    }
    uniforms.uLightDir.value.copy(this.light);
    uniforms.uTime.value = this.elapsed;
    uniforms.uDpr.value = frame.dpr;
    if (moon) {
      this.streaks.advance(this.elapsed, moon, frame.cameraPosition);
    }
  }

  strike(
    direction: Vector3,
    hit: Vector3,
    cameraPosition: Vector3,
    animate: boolean
  ) {
    if (animate) {
      this.toCamera.subVectors(cameraPosition, hit).normalize();
      this.streaks.launch(direction, hit, this.toCamera, this.elapsed);
      this.material.addImpact(direction, this.elapsed + impactTiming.flight);
    } else {
      this.material.addImpact(direction, this.elapsed - impactTiming.settled);
    }
  }

  clearImpacts() {
    this.material.clearImpacts();
    this.streaks.clear();
  }

  dispose() {
    this.material.dispose();
    this.geometry.dispose();
    this.streaks.dispose();
  }
}

const MoonCamera = () => {
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);
  const invalidate = useThree((state) => state.invalidate);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const camera = useMemo(
    () => new PerspectiveCamera(cameraFov, 1, 0.1, 100),
    []
  );

  useLayoutEffect(() => {
    fitMoonCamera(camera, width, height);
    invalidate();
  }, [camera, height, invalidate, width]);

  useLayoutEffect(() => {
    const previous = get().camera;
    set({ camera });
    return () => set({ camera: previous });
  }, [camera, get, set]);

  return null;
};

export const LunarDitherScene = ({
  ink = lunarDitherDefaults.ink,
  paper = lunarDitherDefaults.paper,
  pixelSize = lunarDitherDefaults.pixelSize,
  grain = lunarDitherDefaults.grain,
  rotationSpeed = lunarDitherDefaults.rotationSpeed,
  craterScale = lunarDitherDefaults.craterScale,
  followPointer = lunarDitherDefaults.followPointer,
  lightDirection,
  paused = lunarDitherDefaults.paused,
  impacts = lunarDitherDefaults.impacts,
  maxImpacts = lunarDitherDefaults.maxImpacts,
  onImpact,
  ref,
}: LunarDitherSceneProps) => {
  const invalidate = useThree((state) => state.invalidate);
  const moon = useRef<Mesh>(null);
  const rig = useMemo(() => new MoonRig(), []);

  useEffect(() => () => rig.dispose(), [rig]);

  useEffect(() => {
    rig.material.setImpactCapacity(clampImpactCapacity(maxImpacts));
    rig.streaks.clear();
    invalidate();
  }, [invalidate, maxImpacts, rig]);

  useImperativeHandle(
    ref,
    () => ({
      clearImpacts: () => {
        rig.clearImpacts();
        invalidate();
      },
    }),
    [invalidate, rig]
  );

  const strike = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      const mesh = moon.current;
      if (!mesh) {
        return;
      }
      event.stopPropagation();
      const direction = mesh.worldToLocal(event.point.clone()).normalize();
      rig.strike(direction, event.point, event.camera.position, !paused);
      onImpact?.(direction.clone());
      invalidate();
    },
    [invalidate, onImpact, paused, rig]
  );

  useEffect(() => {
    rig.applyLook({ craterScale, grain, ink, paper, pixelSize });
    invalidate();
  }, [craterScale, grain, ink, invalidate, paper, pixelSize, rig]);

  useFrame((state, delta) => {
    rig.advance(moon.current, {
      cameraPosition: state.camera.position,
      delta,
      dpr: state.viewport.dpr,
      lightDirection: followPointer ? null : (lightDirection ?? null),
      paused,
      pointer: followPointer ? state.pointer : restingPointer,
      rotationSpeed,
    });
  });

  return (
    <>
      <MoonCamera />
      <group rotation={[0, 0, axialTilt]}>
        <mesh
          geometry={rig.geometry}
          material={rig.material}
          onClick={impacts ? strike : undefined}
          raycast={raycastUnitSphere}
          ref={moon}
          rotation={[0, restingTurn, 0]}
        />
      </group>
      <primitive object={rig.streaks.mesh} />
    </>
  );
};
