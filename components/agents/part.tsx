"use client";

import type { ThreeElements } from "@react-three/fiber";
import type { BufferGeometry } from "three";

import type { AgentMaterialName } from "./materials";
import { agentMaterials } from "./materials";

export interface PartProps extends Omit<
  ThreeElements["mesh"],
  "geometry" | "material" | "children"
> {
  geometry: BufferGeometry;
  material: AgentMaterialName;
}

export const Part = ({
  geometry,
  material,
  castShadow = false,
  receiveShadow = true,
  ...meshProps
}: PartProps) => (
  <mesh
    {...meshProps}
    castShadow={castShadow}
    geometry={geometry}
    material={agentMaterials[material]}
    receiveShadow={receiveShadow}
  />
);
