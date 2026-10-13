"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type {
  InstancedMesh,
  PerspectiveCamera as PerspectiveCameraImpl,
} from "three";
import {
  BoxGeometry,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector3,
} from "three";

import { createRadialFadeTexture } from "@/components/agents/textures";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import type { StageCue } from "../companion-stages";
import { markStage } from "../companion-stages";
import type { RigPose, StageSpec } from "./scene-values";
import {
  layoutRigs,
  mergeShadows,
  mergeStill,
  resetPoses,
  restPose,
  writeRigs,
} from "./stage-mesh";

const fov = 26;
const elevation = 0.2;

const stillMaterial = new MeshStandardMaterial({
  roughness: 0.78,
  vertexColors: true,
});
const rigMaterial = new MeshStandardMaterial({ roughness: 0.7 });
const rigGeometry = new BoxGeometry(1, 1, 1);
const shadowMaterial = new MeshBasicMaterial({
  alphaMap: createRadialFadeTexture(),
  color: "#3b2a1f",
  depthWrite: false,
  opacity: 0.2,
  toneMapped: false,
  transparent: true,
});

const viewDirection = new Vector3();
const projected = new Vector3();

const useStageClock = (loopSeconds: number, keyTime: number) => {
  const isReduced = useReducedMotion();
  const start = useRef<number | null>(null);
  return (elapsed: number) => {
    if (isReduced) {
      return keyTime;
    }
    if (start.current === null) {
      start.current = elapsed;
    }
    return (elapsed - start.current) % loopSeconds;
  };
};

const fitCamera = (camera: PerspectiveCameraImpl, spec: StageSpec) => {
  const halfFov = MathUtils.degToRad(fov / 2);
  const distance = Math.max(
    spec.camera.fitHeight / 2 / Math.tan(halfFov),
    spec.camera.fitWidth / 2 / (Math.tan(halfFov) * camera.aspect)
  );
  viewDirection.set(0, Math.sin(elevation), Math.cos(elevation));
  camera.position
    .set(...spec.camera.target)
    .addScaledVector(viewDirection, distance);
  camera.lookAt(...spec.camera.target);
  camera.updateMatrixWorld();
};

const markActor = (
  camera: PerspectiveCameraImpl,
  spec: StageSpec,
  cue: StageCue
) => {
  const [x, y, z] = spec.actor.at;
  projected.set(x, y, z).project(camera);
  const feetY = (1 - projected.y) / 2;
  cue.x = (projected.x + 1) / 2;
  cue.y = feetY;
  projected.set(x, y + spec.actor.height, z).project(camera);
  cue.height = feetY - (1 - projected.y) / 2;
};

export const StageProps = ({
  cueId,
  spec,
}: {
  cueId: string;
  spec: StageSpec;
}) => {
  const camera = useRef<PerspectiveCameraImpl>(null);
  const instances = useRef<InstancedMesh>(null);
  const fittedAspect = useRef(0);
  const timeAt = useStageClock(spec.loopSeconds, spec.keyTime);
  const still = useMemo(() => mergeStill(spec.still), [spec]);
  const shadows = useMemo(() => mergeShadows(spec.shadows), [spec]);
  const layout = useMemo(() => layoutRigs(spec.rigs), [spec]);
  const poses = useMemo<RigPose[]>(() => spec.rigs.map(restPose), [spec]);

  useEffect(
    () => () => {
      still.dispose();
      shadows?.dispose();
    },
    [still, shadows]
  );

  useFrame((state) => {
    const view = camera.current;
    const mesh = instances.current;
    if (!(view && mesh)) {
      return;
    }
    if (Math.abs(view.aspect - fittedAspect.current) > 0.001) {
      fittedAspect.current = view.aspect;
      fitCamera(view, spec);
    }
    const time = timeAt(state.clock.elapsedTime);
    resetPoses(poses);
    const action = spec.play(time, poses);
    writeRigs(spec.rigs, poses, layout, {
      color: (index, color) => mesh.setColorAt(index, color),
      matrix: (index, matrix) => mesh.setMatrixAt(index, matrix),
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
    markStage(cueId, (cue) => {
      cue.action = action;
      cue.yaw = spec.actor.yaw;
      markActor(view, spec, cue);
    });
  });

  return (
    <>
      <PerspectiveCamera fov={fov} makeDefault ref={camera} />
      <mesh geometry={still} material={stillMaterial} />
      <instancedMesh
        args={[rigGeometry, rigMaterial, layout.count]}
        frustumCulled={false}
        key={layout.count}
        ref={(mesh) => {
          instances.current = mesh;
          if (!mesh) {
            return;
          }
          for (const [index, color] of layout.baseColors.entries()) {
            mesh.setColorAt(index, color);
          }
        }}
      />
      {shadows ? <mesh geometry={shadows} material={shadowMaterial} /> : null}
    </>
  );
};
