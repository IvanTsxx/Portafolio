"use client";

import { cylinder, roundedBox, sphere, torus } from "../geometry";
import { Part } from "../part";
import { bodySize, handReach } from "../rig";
import { BodyShell, Rod, Sleeve } from "./shapes";

export const PushedUpGoggles = () => (
  <group>
    <Part
      geometry={roundedBox(bodySize.width + 0.03, 0.05, 0.08, 0.02, 2)}
      material="ink"
      position={[0, 0.005, 0.24]}
    />
    <group position={[0, 0.07, 0.24]} rotation={[-1.05, 0, 0]}>
      {[1, -1].map((side) => (
        <group key={side} position={[side * 0.25, 0, 0]}>
          <Part
            geometry={cylinder(28)}
            material="ink"
            position={[0, 0, -0.04]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.15, 0.08, 0.15]}
          />
          <Part geometry={torus(0.24)} material="brass" scale={0.15} />
          <Part
            geometry={cylinder(28)}
            material="glass"
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.13, 0.01, 0.13]}
          />
        </group>
      ))}
      <Part
        geometry={roundedBox(0.16, 0.05, 0.05, 0.02, 2)}
        material="brass"
        position={[0, 0.02, -0.02]}
      />
    </group>
  </group>
);

const bandWidth = bodySize.width + 0.04;

export const TealGlassesBand = () => (
  <group position={[0, 0, 0.035]}>
    <Part
      geometry={roundedBox(bandWidth, 0.05, 0.05, 0.02, 2)}
      material="teal"
      position={[0, 0.13, 0]}
    />
    <Part
      geometry={roundedBox(bandWidth - 0.04, 0.24, 0.012, 0.005, 1)}
      material="glass"
      position={[0, 0.01, 0]}
    />
    {[1, -1].map((side) => (
      <Part
        geometry={roundedBox(0.05, 0.2, 0.16, 0.02, 2)}
        key={side}
        material="teal"
        position={[side * (bandWidth / 2), 0.04, -0.06]}
      />
    ))}
  </group>
);

const coatHeight = 0.62;
const frontZ = bodySize.depth / 2 + 0.035;

export const LabCoat = () => (
  <group>
    <BodyShell height={coatHeight} material="knitWhite" />
    <Part
      geometry={roundedBox(0.3, 0.42, 0.03, 0.01, 2)}
      material="teal"
      position={[0, coatHeight - 0.2, frontZ]}
    />
    <Part
      geometry={roundedBox(0.09, 0.07, 0.04, 0.015, 2)}
      material="tieRed"
      position={[0, coatHeight - 0.05, frontZ + 0.02]}
    />
    <Part
      geometry={roundedBox(0.1, 0.3, 0.03, 0.02, 2)}
      material="tieRed"
      position={[0, coatHeight - 0.24, frontZ + 0.02]}
    />
    {[1, -1].map((side) => (
      <Part
        geometry={roundedBox(0.1, 0.46, 0.05, 0.02, 2)}
        key={side}
        material="knitWhite"
        position={[side * 0.19, coatHeight - 0.22, frontZ + 0.01]}
        rotation={[0, 0, side * 0.12]}
      />
    ))}
    <Part
      geometry={roundedBox(0.24, 0.14, 0.04, 0.02, 2)}
      material="knitWhite"
      position={[-0.4, 0.32, frontZ + 0.01]}
    />
    {(
      [
        [-0.47, "penRed"],
        [-0.4, "penBlue"],
        [-0.33, "ink"],
      ] as const
    ).map(([x, material]) => (
      <Part
        geometry={cylinder(10)}
        key={x}
        material={material}
        position={[x, 0.4, frontZ + 0.02]}
        scale={[0.018, 0.17, 0.018]}
      />
    ))}
  </group>
);

export const WhiteSleeve = () => <Sleeve material="knitWhite" />;

export const Pointer = () => (
  <group>
    <Rod
      from={[handReach, 0, 0.12]}
      material="ink"
      radius={0.014}
      to={[handReach + 0.78, 0.1, 0.3]}
    />
    <Part
      geometry={sphere(12)}
      material="tieRed"
      position={[handReach + 0.78, 0.1, 0.3]}
      scale={0.03}
    />
  </group>
);
