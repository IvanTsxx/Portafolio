"use client";

import { Quaternion, Vector3 } from "three";

import { cylinder, dome, roundedBox } from "../geometry";
import type { AgentMaterialName } from "../materials";
import { Part } from "../part";
import { bodySize } from "../rig";

type Point = readonly [number, number, number];

const upAxis = new Vector3(0, 1, 0);

interface RodProps {
  from: Point;
  to: Point;
  radius: number;
  material: AgentMaterialName;
}

export const Rod = ({ from, to, radius, material }: RodProps) => {
  const start = new Vector3(...from);
  const direction = new Vector3(...to).sub(start);
  const length = direction.length();
  const quaternion = new Quaternion().setFromUnitVectors(
    upAxis,
    direction.clone().normalize()
  );
  const center = start.addScaledVector(direction, 0.5);
  return (
    <Part
      geometry={cylinder(12)}
      material={material}
      position={center}
      quaternion={quaternion}
      scale={[radius, length, radius]}
    />
  );
};

interface HardHatProps {
  material: AgentMaterialName;
}

export const HardHat = ({ material }: HardHatProps) => (
  <group position={[0, -0.02, 0.02]}>
    <Part
      castShadow
      geometry={dome()}
      material={material}
      scale={[0.5, 0.34, 0.44]}
    />
    <Part geometry={dome()} material={material} scale={[0.07, 0.37, 0.47]} />
    <Part
      castShadow
      geometry={cylinder(40)}
      material={material}
      position={[0, 0.015, 0.05]}
      scale={[0.6, 0.03, 0.56]}
    />
  </group>
);

const shellDepth = bodySize.depth + 0.06;
const shellWidth = bodySize.width + 0.06;

interface ShellProps {
  height: number;
  material: AgentMaterialName;
}

export const BodyShell = ({ height, material }: ShellProps) => (
  <Part
    castShadow
    geometry={roundedBox(shellWidth, height, shellDepth, 0.1, 4)}
    material={material}
    position={[0, height / 2 - 0.01, 0]}
  />
);

export const Sleeve = ({ material }: { material: AgentMaterialName }) => (
  <Part
    castShadow
    geometry={roundedBox(0.2, 0.33, 0.42, 0.06)}
    material={material}
    position={[0.1, 0, 0]}
  />
);
