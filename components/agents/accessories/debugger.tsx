"use client";

import { cylinder, roundedBox, sphere, torus } from "../geometry";
import { useHeldPose } from "../held-pose";
import { Part } from "../part";
import { bodySize, handReach } from "../rig";
import { BodyShell, Rod, Sleeve } from "./shapes";

export const Deerstalker = () => (
  <group position={[0, -0.02, 0]}>
    <Part
      castShadow
      geometry={roundedBox(0.98, 0.3, 0.86, 0.13, 4)}
      material="plaid"
      position={[0, 0.15, 0]}
    />
    <Part
      castShadow
      geometry={roundedBox(0.66, 0.04, 0.28, 0.018, 2)}
      material="plaid"
      position={[0, 0.04, 0.52]}
      rotation={[0.2, 0, 0]}
    />
    <Part
      geometry={roundedBox(0.6, 0.04, 0.22, 0.018, 2)}
      material="plaid"
      position={[0, 0.04, -0.49]}
      rotation={[-0.2, 0, 0]}
    />
    {[1, -1].map((side) => (
      <Part
        geometry={roundedBox(0.05, 0.24, 0.42, 0.02, 2)}
        key={side}
        material="plaid"
        position={[side * 0.47, 0.34, 0]}
        rotation={[0, 0, side * 0.42]}
      />
    ))}
    <Part
      geometry={roundedBox(0.24, 0.035, 0.07, 0.015, 2)}
      material="trim"
      position={[0, 0.31, 0]}
    />
    <Part
      geometry={sphere(12)}
      material="trim"
      position={[0, 0.31, 0]}
      scale={0.04}
    />
  </group>
);

const coatHeight = 0.6;
const frontZ = bodySize.depth / 2 + 0.035;

export const PlaidCoat = () => (
  <group>
    <BodyShell height={coatHeight} material="plaid" />
    <Part
      geometry={roundedBox(
        bodySize.width + 0.09,
        0.07,
        bodySize.depth + 0.09,
        0.03,
        2
      )}
      material="trim"
      position={[0, 0.03, 0]}
    />
    {[1, -1].map((side) => (
      <Part
        geometry={roundedBox(0.4, 0.07, 0.04, 0.02, 2)}
        key={side}
        material="trim"
        position={[side * 0.19, coatHeight - 0.06, frontZ + 0.005]}
        rotation={[0, 0, side * 0.22]}
      />
    ))}
    {[0.42, 0.3, 0.18].map((y) => (
      <Part
        geometry={cylinder(16)}
        key={y}
        material="trim"
        position={[0, y, frontZ + 0.01]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.03, 0.02, 0.03]}
      />
    ))}
  </group>
);

export const PlaidSleeve = () => <Sleeve material="plaid" />;

const magnifierRest = {
  position: [handReach, -0.03, 0.12],
  rotation: [0, -0.35, 0],
} as const;

const magnifierPoses = {
  inspect: {
    facing: -1.05,
    position: [handReach, 0.02, 0.1],
    rotation: [0, 0, 0.15],
  },
  point: { position: [handReach, -0.02, 0.12], rotation: [0, -0.6, 0.1] },
} as const;

export const MagnifyingGlass = () => {
  const held = useHeldPose(magnifierRest, magnifierPoses);
  return (
    <group>
      <PlaidSleeve />
      <group {...held}>
        <Rod
          from={[0, 0, 0]}
          material="leather"
          radius={0.026}
          to={[0.24, 0.04, 0]}
        />
        <Part
          geometry={cylinder(16)}
          material="brass"
          position={[0.26, 0.045, 0]}
          rotation={[0, 0, Math.PI / 2 - 0.16]}
          scale={[0.032, 0.05, 0.032]}
        />
        <group position={[0.44, 0.075, 0]} rotation={[0, 1.05, 0]}>
          <Part geometry={torus(0.14)} material="brass" scale={0.17} />
          <Part
            geometry={cylinder(32)}
            material="glass"
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.165, 0.01, 0.165]}
          />
        </group>
      </group>
    </group>
  );
};
