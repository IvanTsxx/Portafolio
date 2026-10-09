"use client";

import { roundedBox } from "../geometry";
import { Part } from "../part";
import { bodySize } from "../rig";
import { HardHat } from "./shapes";

export const YellowHardHat = () => <HardHat material="hardHatYellow" />;

const vestHeight = 0.6;
const vestY = vestHeight / 2 - 0.01;
const frontZ = bodySize.depth / 2 + 0.02;
const sideX = bodySize.width / 2 + 0.02;
const stripeY = 0.2;

export const SafetyVest = () => (
  <group>
    {[1, -1].map((side) => (
      <group key={side}>
        <Part
          geometry={roundedBox(0.44, vestHeight, 0.05, 0.02, 2)}
          material="hiVis"
          position={[side * 0.38, vestY, frontZ]}
        />
        <Part
          geometry={roundedBox(0.45, 0.07, 0.06, 0.015, 2)}
          material="reflective"
          position={[side * 0.38, stripeY, frontZ + 0.005]}
        />
        <Part
          geometry={roundedBox(
            0.05,
            vestHeight,
            bodySize.depth - 0.02,
            0.02,
            2
          )}
          material="hiVis"
          position={[side * sideX, vestY, 0]}
        />
        <Part
          geometry={roundedBox(0.06, 0.07, bodySize.depth - 0.01, 0.015, 2)}
          material="reflective"
          position={[side * (sideX + 0.005), stripeY, 0]}
        />
      </group>
    ))}
    <Part
      geometry={roundedBox(bodySize.width - 0.02, vestHeight, 0.05, 0.02, 2)}
      material="hiVis"
      position={[0, vestY, -frontZ]}
    />
  </group>
);

export const Laptop = () => (
  <group position={[0, -0.16, 0.3]}>
    <Part
      geometry={roundedBox(0.62, 0.035, 0.4, 0.015, 2)}
      material="aluminum"
    />
    <Part
      geometry={roundedBox(0.54, 0.01, 0.22, 0.004, 1)}
      material="ink"
      position={[0, 0.018, -0.04]}
    />
    <group position={[0, 0.0175, 0.19]} rotation={[0.5, 0, 0]}>
      <Part
        geometry={roundedBox(0.62, 0.34, 0.03, 0.015, 2)}
        material="aluminum"
        position={[0, 0.17, 0]}
      />
      <Part
        geometry={roundedBox(0.08, 0.08, 0.01, 0.02, 2)}
        material="ink"
        position={[0, 0.17, 0.016]}
      />
      <Part
        geometry={roundedBox(0.56, 0.28, 0.006, 0.004, 1)}
        material="screenGlow"
        position={[0, 0.17, -0.016]}
      />
    </group>
  </group>
);
