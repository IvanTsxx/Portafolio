"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ThreeElements } from "@react-three/fiber";
import { useRef } from "react";
import type { PerspectiveCamera as PerspectiveCameraImpl } from "three";
import { MathUtils, Vector3 } from "three";

import { disc, roundedBox } from "@/components/agents/geometry";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import type { SceneMaterialName } from "./scene-values";
import { blobMaterial, boxGeometry, sceneMaterials } from "./scene-values";

type MeshProps = Omit<ThreeElements["mesh"], "geometry" | "material">;
type GroupProps = ThreeElements["group"];

interface BlockProps extends MeshProps {
  material?: SceneMaterialName;
}

export const Block = ({ material = "ink", ...props }: BlockProps) => (
  <mesh {...props} geometry={boxGeometry} material={sceneMaterials[material]} />
);

interface SlabProps extends MeshProps {
  size: readonly [number, number, number];
  material?: SceneMaterialName;
  radius?: number;
}

export const Slab = ({
  size,
  material = "paper",
  radius = 0.035,
  ...props
}: SlabProps) => (
  <mesh
    {...props}
    geometry={roundedBox(size[0], size[1], size[2], radius, 2)}
    material={sceneMaterials[material]}
  />
);

export const BlobShadow = ({
  position,
  scale,
}: {
  position: readonly [number, number, number];
  scale: readonly [number, number];
}) => (
  <mesh
    geometry={disc()}
    material={blobMaterial}
    position={position}
    rotation-x={-Math.PI / 2}
    scale={[scale[0], scale[1], 1]}
  />
);

interface SceneCameraProps {
  target: readonly [number, number, number];
  fitWidth: number;
  fitHeight: number;
  elevation?: number;
  fov?: number;
}

const viewDirection = new Vector3();

export const SceneCamera = ({
  target,
  fitWidth,
  fitHeight,
  elevation = 0.2,
  fov = 26,
}: SceneCameraProps) => {
  const camera = useRef<PerspectiveCameraImpl>(null);
  const lastAspect = useRef(0);

  useFrame(() => {
    const view = camera.current;
    if (!view || Math.abs(view.aspect - lastAspect.current) < 0.001) {
      return;
    }
    lastAspect.current = view.aspect;
    const halfFov = MathUtils.degToRad(fov / 2);
    const distance = Math.max(
      fitHeight / 2 / Math.tan(halfFov),
      fitWidth / 2 / (Math.tan(halfFov) * view.aspect)
    );
    viewDirection.set(0, Math.sin(elevation), Math.cos(elevation));
    view.position.set(...target).addScaledVector(viewDirection, distance);
    view.lookAt(...target);
  });

  return <PerspectiveCamera fov={fov} makeDefault ref={camera} />;
};

export const useSceneClock = (loopSeconds: number, keyTime: number) => {
  const isReduced = useReducedMotion();
  const start = useRef<number | null>(null);
  return {
    isReduced,
    timeAt: (elapsed: number) => {
      if (isReduced) {
        return keyTime;
      }
      if (start.current === null) {
        start.current = elapsed;
      }
      return (elapsed - start.current) % loopSeconds;
    },
  };
};

interface CheckProps extends GroupProps {
  material?: SceneMaterialName;
}

export const Check = ({ material = "ink", ...props }: CheckProps) => (
  <group {...props}>
    <Block
      material={material}
      position={[-0.1, -0.05, 0]}
      rotation-z={Math.PI / 4}
      scale={[0.06, 0.17, 0.06]}
    />
    <Block
      material={material}
      position={[0.075, 0.05, 0]}
      rotation-z={-0.69}
      scale={[0.06, 0.42, 0.06]}
    />
  </group>
);

interface PanelLegsProps {
  panelY: number;
  panelHeight: number;
  spread: number;
}

export const PanelLegs = ({ panelY, panelHeight, spread }: PanelLegsProps) => {
  const legHeight = panelY - panelHeight / 2 + 0.06;
  return [-spread, spread].map((x) => (
    <Block
      key={x}
      position={[x, -panelY + legHeight / 2, -0.02]}
      scale={[0.045, legHeight, 0.045]}
    />
  ));
};
