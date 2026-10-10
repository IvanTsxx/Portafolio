"use client";

import { cylinder, roundedBox, sphere, torus } from "../geometry";
import { useHeldPose } from "../held-pose";
import { Part } from "../part";
import { handReach } from "../rig";
import { Rod } from "./shapes";

const earY = -0.3;

const EarCup = ({ side }: { side: 1 | -1 }) => (
  <group position={[side * 0.66, earY, -0.04]} rotation={[0, 0, Math.PI / 2]}>
    <Part
      geometry={cylinder(28)}
      material="hardHatWhite"
      scale={[0.15, 0.1, 0.15]}
    />
    <Part
      geometry={cylinder(28)}
      material="knitBlue"
      position={[0, side * 0.05, 0]}
      scale={[0.13, 0.04, 0.13]}
    />
    <Part
      geometry={cylinder(28)}
      material="ink"
      position={[0, -side * 0.055, 0]}
      scale={[0.09, 0.02, 0.09]}
    />
  </group>
);

const boomPivot = [-0.71, earY - 0.02, 0.02] as const;
const boomElbow = [-0.69, earY - 0.13, 0.36] as const;
const boomTip = [-0.42, earY - 0.21, 0.6] as const;

export const Headset = () => (
  <group>
    <Part
      castShadow
      geometry={torus(0.06, Math.PI)}
      material="darkPlastic"
      position={[0, earY, -0.04]}
      scale={[0.68, 0.46, 0.68]}
    />
    <Part
      geometry={roundedBox(0.34, 0.05, 0.12, 0.022, 2)}
      material="knitBlue"
      position={[0, earY + 0.47, -0.04]}
    />
    <EarCup side={1} />
    <EarCup side={-1} />
    <Part
      geometry={cylinder(20)}
      material="darkPlastic"
      position={boomPivot}
      rotation={[0, 0, Math.PI / 2]}
      scale={[0.05, 0.05, 0.05]}
    />
    <Rod
      from={boomPivot}
      material="darkPlastic"
      radius={0.016}
      to={boomElbow}
    />
    <Rod from={boomElbow} material="darkPlastic" radius={0.016} to={boomTip} />
    <group position={boomTip} rotation={[0, -0.75, 0]}>
      <Part
        geometry={roundedBox(0.13, 0.065, 0.075, 0.03, 3)}
        material="darkPlastic"
        position={[0.05, 0, 0]}
      />
      <Part
        geometry={sphere(16)}
        material="knitBlue"
        position={[0.13, 0, 0]}
        scale={0.05}
      />
    </group>
  </group>
);

const lensSize = [0.36, 0.19, 0.04] as const;

export const PixelShades = () => (
  <group position={[0, -0.01, 0.035]}>
    <Part
      geometry={roundedBox(1.12, 0.05, 0.05, 0.015, 2)}
      material="ink"
      position={[0, 0.11, 0]}
    />
    {[1, -1].map((side) => (
      <group key={side} position={[side * 0.38, 0, 0]}>
        <Part
          geometry={roundedBox(...lensSize, 0.012, 2)}
          material="codeGlow"
        />
        <Part
          geometry={roundedBox(0.14, 0.07, 0.04, 0.01, 2)}
          material="ink"
          position={[-side * 0.11, -0.12, 0]}
        />
        <Part
          geometry={roundedBox(0.04, 0.04, 0.5, 0.01, 2)}
          material="ink"
          position={[side * 0.25, 0.11, -0.25]}
        />
      </group>
    ))}
  </group>
);

const tabletRest = {
  position: [handReach - 0.02, -0.06, 0.26],
  rotation: [1.2, -0.5, 0],
} as const;

const tabletPoses = {
  direct: {
    facing: 0.35,
    position: [0.5, 0, 0.36],
    rotation: [0.9, 0, 0],
  },
  type: { position: [handReach, -0.04, 0.2], rotation: [0.95, -1.1, 0] },
} as const;

export const ControlTablet = () => {
  const held = useHeldPose(tabletRest, tabletPoses);
  return (
    <group {...held}>
      <Part
        geometry={roundedBox(0.34, 0.03, 0.24, 0.012, 2)}
        material="darkPlastic"
      />
      <Part
        geometry={roundedBox(0.29, 0.012, 0.19, 0.004, 1)}
        material="codeGlow"
        position={[0, 0.017, 0]}
      />
    </group>
  );
};
