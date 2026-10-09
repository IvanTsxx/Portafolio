"use client";

import { cylinder, disc, roundedBox } from "../geometry";
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

export const TapeMeasure = () => (
  <group position={[handReach + 0.02, -0.06, 0.24]} rotation={[0, -0.3, 0]}>
    <Part
      geometry={roundedBox(0.22, 0.22, 0.11, 0.05, 3)}
      material="hardHatYellow"
    />
    <Part
      geometry={cylinder(20)}
      material="ink"
      position={[0, 0, 0.057]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[0.06, 0.01, 0.06]}
    />
    <Part
      geometry={roundedBox(0.3, 0.008, 0.04, 0.003, 1)}
      material="hardHatYellow"
      position={[0.25, -0.1, 0]}
      rotation={[0, 0, -0.08]}
    />
    <Part
      geometry={roundedBox(0.012, 0.04, 0.045, 0.004, 1)}
      material="steel"
      position={[0.4, -0.095, 0]}
    />
  </group>
);
