"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  MathUtils,
  PerspectiveCamera,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
} from "three";
import type { Group } from "three";

import { OrbitCoreMaterial } from "./orbit-core-material";
import {
  OrbitDustMaterial,
  createDustGeometry,
  dustOpacityFor,
  normalizeDustCount,
  orbitDustDefaults,
} from "./orbit-dust-material";

export interface OrbitDustSceneProps {
  count?: number;
  radius?: number;
  thickness?: number;
  turbulence?: number;
  speed?: number;
  ink?: string;
  paper?: string;
  paused?: boolean;
}

const cameraFov = 30;
const cameraElevation = 0.3;
const ringRoll = -0.16;
const frameRadius = 2;
const coreShare = 0.36;
const wellEase = 4;
const maxStep = 0.05;

const fitDustCamera = (
  camera: PerspectiveCamera,
  width: number,
  height: number
) => {
  const aspect = width / Math.max(height, 1);
  const halfTangent = Math.tan(MathUtils.degToRad(cameraFov / 2));
  const distance = Math.max(
    (frameRadius * 1.12) / (halfTangent * aspect),
    (frameRadius * 0.62) / halfTangent
  );
  camera.aspect = aspect;
  camera.position.set(
    0,
    Math.sin(cameraElevation) * distance,
    Math.cos(cameraElevation) * distance
  );
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return distance;
};

class DustRig {
  readonly material = new OrbitDustMaterial();
  readonly core = new SphereGeometry(1, 48, 32);
  readonly coreMaterial = new OrbitCoreMaterial();
  readonly hitPlane = new PlaneGeometry(1, 1);
  private readonly wellTarget = new Vector3();
  private wellStrengthTarget = 0;
  private elapsed = 0;
  private isLitDust = true;

  applyTones(ink: string, paper: string, count: number) {
    this.isLitDust = this.material.setTones(ink, paper);
    this.coreMaterial.setTones(ink, paper);
    this.material.uniforms.uOpacity.value = dustOpacityFor(
      count,
      this.isLitDust
    );
  }

  applyRingGeometry(radius: number, thickness: number, turbulence: number) {
    const { uniforms } = this.material;
    uniforms.uRadius.value = radius;
    uniforms.uThickness.value = thickness;
    uniforms.uTurbulence.value = turbulence;
  }

  applyViewport(distance: number, height: number, pixelRatio: number) {
    const { uniforms } = this.material;
    uniforms.uCameraDistance.value = distance;
    uniforms.uViewportHeight.value = height;
    uniforms.uPixelRatio.value = pixelRatio;
  }

  aim(point: Vector3 | null) {
    if (point) {
      this.wellTarget.copy(point);
      this.wellStrengthTarget = 1;
    } else {
      this.wellStrengthTarget = 0;
    }
  }

  advance(delta: number, speed: number, paused: boolean) {
    const { uniforms } = this.material;
    const step = Math.min(delta, maxStep);
    if (paused) {
      uniforms.uWell.value.copy(this.wellTarget);
      uniforms.uWellStrength.value = this.wellStrengthTarget;
      return;
    }
    this.elapsed += step * speed;
    const blend = 1 - Math.exp(-wellEase * step);
    uniforms.uWell.value.lerp(this.wellTarget, blend);
    uniforms.uWellStrength.value = MathUtils.lerp(
      uniforms.uWellStrength.value,
      this.wellStrengthTarget,
      blend
    );
    uniforms.uTime.value = this.elapsed;
  }

  dispose() {
    this.material.dispose();
    this.core.dispose();
    this.coreMaterial.dispose();
    this.hitPlane.dispose();
  }
}

const DustCamera = ({ rig }: { rig: DustRig }) => {
  const set = useThree((state) => state.set);
  const get = useThree((state) => state.get);
  const invalidate = useThree((state) => state.invalidate);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const camera = useMemo(
    () => new PerspectiveCamera(cameraFov, 1, 0.1, 100),
    []
  );

  useLayoutEffect(() => {
    rig.applyViewport(fitDustCamera(camera, width, height), height, pixelRatio);
    invalidate();
  }, [camera, height, invalidate, pixelRatio, rig, width]);

  useLayoutEffect(() => {
    const previous = get().camera;
    set({ camera });
    return () => set({ camera: previous });
  }, [camera, get, set]);

  return null;
};

export const OrbitDustScene = ({
  count,
  radius = orbitDustDefaults.radius,
  thickness = orbitDustDefaults.thickness,
  turbulence = orbitDustDefaults.turbulence,
  speed = orbitDustDefaults.speed,
  ink = orbitDustDefaults.ink,
  paper = orbitDustDefaults.paper,
  paused = orbitDustDefaults.paused,
}: OrbitDustSceneProps) => {
  const invalidate = useThree((state) => state.invalidate);
  const ring = useRef<Group>(null);
  const rig = useMemo(() => new DustRig(), []);
  const particleCount = useMemo(() => normalizeDustCount(count), [count]);
  const geometry = useMemo(
    () => createDustGeometry(particleCount),
    [particleCount]
  );

  useEffect(() => () => rig.dispose(), [rig]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    rig.applyTones(ink, paper, particleCount);
    invalidate();
  }, [ink, invalidate, paper, particleCount, rig]);

  useEffect(() => {
    rig.applyRingGeometry(radius, thickness, turbulence);
    invalidate();
  }, [invalidate, radius, rig, thickness, turbulence]);

  useFrame((_, delta) => {
    rig.advance(delta, speed, paused);
  });

  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    const group = ring.current;
    if (!group) {
      return;
    }
    rig.aim(group.worldToLocal(event.point.clone()));
    invalidate();
  };

  const handleLeave = () => {
    rig.aim(null);
    invalidate();
  };

  return (
    <>
      <DustCamera rig={rig} />
      <group ref={ring} rotation={[0, 0, ringRoll]}>
        <points
          frustumCulled={false}
          geometry={geometry}
          material={rig.material}
        />
        <mesh
          geometry={rig.core}
          material={rig.coreMaterial}
          scale={radius * coreShare}
        />
        <mesh
          geometry={rig.hitPlane}
          onPointerLeave={handleLeave}
          onPointerMove={handleMove}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={radius * 6}
          visible={false}
        />
      </group>
    </>
  );
};
