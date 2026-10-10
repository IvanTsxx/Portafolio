"use client";

import { cylinder, roundedBox } from "../geometry";
import { useHeldPose } from "../held-pose";
import { Part } from "../part";
import { handReach } from "../rig";
import { HardHat } from "./shapes";

export const SafetyHelmet = () => (
  <group>
    <HardHat material="helmetSteel" />
    <Part
      geometry={cylinder(40)}
      material="reflective"
      position={[0, 0.08, 0.02]}
      scale={[0.48, 0.05, 0.42]}
    />
    <group position={[0, 0.2, 0.36]} rotation={[-0.55, 0, 0]}>
      <Part geometry={roundedBox(0.16, 0.1, 0.07, 0.025, 2)} material="ink" />
      <Part
        geometry={cylinder(20)}
        material="highlight"
        position={[0, 0, 0.037]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.035, 0.01, 0.035]}
      />
    </group>
  </group>
);

const checkRows = [0.1, 0.03, -0.04, -0.11] as const;

const clipboardRest = {
  position: [handReach + 0.02, -0.02, 0.24],
  rotation: [0, -0.25, 0],
} as const;

const clipboardPoses = {
  check: {
    facing: 0.15,
    position: [0.62, -0.08, 0.16],
    rotation: [-0.3, 0, 0],
  },
} as const;

export const Clipboard = () => {
  const held = useHeldPose(clipboardRest, clipboardPoses);
  return (
    <group {...held}>
      <Part geometry={roundedBox(0.34, 0.44, 0.03, 0.015, 2)} material="wood" />
      <Part
        geometry={roundedBox(0.28, 0.34, 0.006, 0.003, 1)}
        material="paper"
        position={[0, -0.02, 0.017]}
      />
      <Part
        geometry={roundedBox(0.14, 0.05, 0.03, 0.012, 2)}
        material="steel"
        position={[0, 0.19, 0.022]}
      />
      {checkRows.map((y) => (
        <group key={y} position={[0, y - 0.02, 0.022]}>
          <Part
            geometry={roundedBox(0.04, 0.03, 0.004, 0.002, 1)}
            material="teal"
            position={[-0.09, 0, 0]}
          />
          <Part
            geometry={roundedBox(0.14, 0.012, 0.004, 0.002, 1)}
            material="mortarboard"
            position={[0.03, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
};

export const Pencil = () => (
  <group
    position={[handReach + 0.02, -0.02, 0.1]}
    rotation={[Math.PI / 2 + 0.3, 0, 0]}
  >
    <Part
      geometry={cylinder(8)}
      material="hardHatYellow"
      position={[0, 0.08, 0]}
      scale={[0.022, 0.24, 0.022]}
    />
    <Part
      geometry={cylinder(8)}
      material="ink"
      position={[0, 0.22, 0]}
      scale={[0.012, 0.04, 0.012]}
    />
    <Part
      geometry={cylinder(8)}
      material="penRed"
      position={[0, -0.05, 0]}
      scale={[0.024, 0.03, 0.024]}
    />
  </group>
);
