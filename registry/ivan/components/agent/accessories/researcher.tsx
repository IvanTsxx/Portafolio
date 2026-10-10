"use client";

import { cylinder, roundedBox, torus } from "../geometry";
import { Part } from "../part";
import { bodySize, eyeSize } from "../rig";
import { Rod } from "./shapes";

export const Mortarboard = () => (
  <group position={[0, 0, -0.02]} rotation={[0, 0.06, 0]}>
    <Part
      geometry={roundedBox(0.7, 0.2, 0.62, 0.05, 3)}
      material="mortarboard"
      position={[0, 0.08, 0]}
    />
    <Part
      castShadow
      geometry={roundedBox(1.02, 0.04, 1.02, 0.015, 2)}
      material="mortarboard"
      position={[0, 0.2, 0]}
    />
    <Part
      geometry={cylinder(16)}
      material="brass"
      position={[0, 0.225, 0]}
      scale={[0.035, 0.02, 0.035]}
    />
    <Rod
      from={[0, 0.226, 0]}
      material="brass"
      radius={0.009}
      to={[0.5, 0.226, 0.12]}
    />
    <Rod
      from={[0.5, 0.226, 0.12]}
      material="brass"
      radius={0.009}
      to={[0.52, 0.02, 0.13]}
    />
    <Part
      geometry={cylinder(12)}
      material="brass"
      position={[0.52, -0.02, 0.13]}
      scale={[0.025, 0.09, 0.025]}
    />
  </group>
);

const lensRadius = 0.12;
const templeX = bodySize.width / 2 + 0.012;

export const RoundGlasses = () => (
  <group position={[0, 0, 0.04]}>
    {[1, -1].map((side) => (
      <group key={side}>
        <Part
          geometry={torus(0.09)}
          material="wire"
          position={[side * eyeSize.spacing, 0, 0]}
          scale={lensRadius}
        />
        <Part
          geometry={cylinder(32)}
          material="glass"
          position={[side * eyeSize.spacing, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[lensRadius, 0.004, lensRadius]}
        />
        <Rod
          from={[side * (eyeSize.spacing + lensRadius), 0.02, 0]}
          material="wire"
          radius={0.011}
          to={[side * templeX, 0.02, -0.05]}
        />
        <Rod
          from={[side * templeX, 0.02, -0.05]}
          material="wire"
          radius={0.011}
          to={[side * templeX, 0, -0.5]}
        />
      </group>
    ))}
    <Part
      geometry={torus(0.04, Math.PI)}
      material="wire"
      position={[0, 0.01, 0]}
      scale={[eyeSize.spacing - lensRadius, 0.1, 0.3]}
    />
  </group>
);

const vestHeight = 0.62;
const frontZ = bodySize.depth / 2 + 0.02;

export const TweedVest = () => (
  <group>
    {[1, -1].map((side) => (
      <group key={side}>
        <Part
          geometry={roundedBox(0.5, vestHeight, 0.05, 0.02, 2)}
          material="tweed"
          position={[side * 0.36, vestHeight / 2 - 0.01, frontZ]}
        />
        <Part
          geometry={roundedBox(
            0.05,
            vestHeight,
            bodySize.depth - 0.02,
            0.02,
            2
          )}
          material="tweed"
          position={[
            side * (bodySize.width / 2 + 0.02),
            vestHeight / 2 - 0.01,
            0,
          ]}
        />
        <Part
          geometry={roundedBox(0.16, 0.1, 0.04, 0.02, 2)}
          material="tieRed"
          position={[side * 0.085, vestHeight - 0.04, frontZ + 0.04]}
          rotation={[0, 0, side * -0.28]}
        />
      </group>
    ))}
    <Part
      geometry={roundedBox(bodySize.width - 0.02, vestHeight, 0.05, 0.02, 2)}
      material="tweed"
      position={[0, vestHeight / 2 - 0.01, -frontZ]}
    />
    <Part
      geometry={roundedBox(0.24, 0.2, 0.03, 0.01, 2)}
      material="paper"
      position={[0, vestHeight - 0.07, frontZ - 0.005]}
    />
    <Part
      geometry={roundedBox(0.06, 0.07, 0.05, 0.015, 2)}
      material="tieRed"
      position={[0, vestHeight - 0.04, frontZ + 0.055]}
    />
    {[0.36, 0.22, 0.08].map((y) => (
      <Part
        geometry={cylinder(12)}
        key={y}
        material="trim"
        position={[0.13, y, frontZ + 0.03]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.022, 0.015, 0.022]}
      />
    ))}
  </group>
);

const pageAngle = 0.16;

export const OpenBook = () => (
  <group position={[0, 0.06, 0.34]} rotation={[-0.85, 0, 0]}>
    {[1, -1].map((side) => (
      <group key={side} rotation={[0, 0, side * pageAngle]}>
        <Part
          geometry={roundedBox(0.34, 0.025, 0.44, 0.01, 2)}
          material="bookCover"
          position={[side * 0.17, 0, 0]}
        />
        <Part
          geometry={roundedBox(0.31, 0.04, 0.4, 0.012, 2)}
          material="paper"
          position={[side * 0.165, 0.03, 0]}
        />
        {[0.1, 0.03, -0.04, -0.11].map((z) => (
          <Part
            geometry={roundedBox(0.22, 0.004, 0.018, 0.002, 1)}
            key={z}
            material="mortarboard"
            position={[side * 0.17, 0.051, z]}
          />
        ))}
      </group>
    ))}
  </group>
);
