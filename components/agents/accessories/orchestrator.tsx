"use client";

import { cylinder, roundedBox, sphere, torus } from "../geometry";
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

export const Headset = () => (
  <group>
    <Part
      castShadow
      geometry={torus(0.085, Math.PI)}
      material="knitBlue"
      position={[0, earY, -0.04]}
      scale={[0.67, 0.5, 0.67]}
    />
    <EarCup side={1} />
    <EarCup side={-1} />
    <Rod
      from={[-0.7, earY - 0.04, 0.06]}
      material="ink"
      radius={0.016}
      to={[-0.36, earY - 0.24, 0.6]}
    />
    <Part
      geometry={sphere(16)}
      material="ink"
      position={[-0.34, earY - 0.25, 0.62]}
      scale={0.045}
    />
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

export const ControlTablet = () => (
  <group position={[handReach - 0.02, -0.06, 0.26]} rotation={[1.2, -0.5, 0]}>
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
