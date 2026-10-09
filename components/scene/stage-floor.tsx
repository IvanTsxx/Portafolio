"use client";

import { MeshBasicMaterial } from "three";

import { disc } from "@/components/agents/geometry";
import { createRadialFadeTexture } from "@/components/agents/textures";

const floorMaterial = new MeshBasicMaterial({
  alphaMap: createRadialFadeTexture(),
  color: "#37312c",
  depthWrite: false,
  toneMapped: false,
  transparent: true,
});

export const StageFloor = ({ radius = 9 }: { radius?: number }) => (
  <mesh
    geometry={disc()}
    material={floorMaterial}
    rotation-x={-Math.PI / 2}
    scale={radius}
  />
);
