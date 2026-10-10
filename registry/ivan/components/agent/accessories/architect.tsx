"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { MathUtils } from "three";

import { measureExtension } from "../actions";
import { box, cylinder, disc, roundedBox } from "../geometry";
import { useAgentLive, useHeldPose } from "../held-pose";
import { Part } from "../part";
import { handReach } from "../rig";
import { HardHat } from "./shapes";

export const WhiteHardHat = () => <HardHat material="hardHatWhite" />;

export const BlueprintRoll = () => (
  <group position={[handReach - 0.02, 0.08, 0.14]} rotation={[0.35, 0, -0.55]}>
    <Part
      geometry={cylinder(24)}
      material="blueprint"
      scale={[0.085, 0.9, 0.085]}
    />
    {[1, -1].map((end) => (
      <Part
        geometry={disc()}
        key={end}
        material="paper"
        position={[0, end * 0.451, 0]}
        rotation={[(-end * Math.PI) / 2, 0, 0]}
        scale={0.07}
      />
    ))}
    <Part
      geometry={cylinder(24)}
      material="paper"
      position={[0, 0.12, 0]}
      scale={[0.088, 0.03, 0.088]}
    />
  </group>
);

const tapeRest = {
  position: [handReach + 0.03, -0.05, 0.22],
  rotation: [0, -0.3, 0],
} as const;

const tapePoses = {
  measure: {
    facing: 0.1,
    position: [0.58, -0.02, 0.2],
    rotation: [0, 0, 0],
  },
  point: {
    facing: 0.2,
    position: [0.5, -0.04, 0.2],
    rotation: [0, 0, 0],
  },
} as const;

const restingBlade = 0.05;
const fullBlade = 1.05;

const boxGeometry = box();

export const TapeMeasure = () => {
  const held = useHeldPose(tapeRest, tapePoses);
  const { liveAction, motion } = useAgentLive();
  const blade = useRef<Group>(null);
  const hook = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!(blade.current && hook.current)) {
      return;
    }
    const isMeasuring = liveAction.current === "measure";
    const time = motion === "reduced" ? 1.2 : state.clock.elapsedTime;
    const target = isMeasuring
      ? restingBlade + measureExtension(time) * (fullBlade - restingBlade)
      : restingBlade;
    const length =
      motion === "reduced" || isMeasuring
        ? target
        : MathUtils.damp(blade.current.scale.z, target, 10, delta);
    blade.current.scale.x = length;
    hook.current.position.x = -length;
  });

  return (
    <group {...held}>
      <Part
        castShadow
        geometry={roundedBox(0.24, 0.24, 0.12, 0.06, 4)}
        material="hardHatYellow"
      />
      <Part
        geometry={cylinder(28)}
        material="darkPlastic"
        position={[0, 0, 0.062]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.075, 0.012, 0.075]}
      />
      <Part
        geometry={cylinder(20)}
        material="steel"
        position={[0, 0, 0.07]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.025, 0.012, 0.025]}
      />
      <Part
        geometry={roundedBox(0.05, 0.14, 0.02, 0.008, 1)}
        material="darkPlastic"
        position={[0, 0.02, -0.07]}
      />
      <Part
        geometry={roundedBox(0.06, 0.04, 0.09, 0.012, 2)}
        material="darkPlastic"
        position={[-0.1, -0.1, 0.02]}
      />
      <group position={[-0.12, -0.1, 0.02]}>
        <group ref={blade} scale={[restingBlade, 1, 1]}>
          <Part
            geometry={boxGeometry}
            material="hardHatYellow"
            position={[-0.5, 0, 0]}
            scale={[1, 0.012, 0.06]}
          />
        </group>
        <group position={[-restingBlade, 0, 0]} ref={hook}>
          <Part
            geometry={roundedBox(0.014, 0.06, 0.07, 0.004, 1)}
            material="steel"
            position={[0, -0.018, 0]}
          />
        </group>
      </group>
    </group>
  );
};
