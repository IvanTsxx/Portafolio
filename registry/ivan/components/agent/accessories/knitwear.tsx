"use client";

import { roundedBox } from "../geometry";
import { Part } from "../part";
import { bodySize } from "../rig";
import { BodyShell, Sleeve } from "./shapes";

const sweaterHeight = 0.64;
const ribHeight = 0.08;
const stripeY = 0.44;
const stripeHeight = 0.09;

export const KnitSweater = () => (
  <group>
    <BodyShell height={sweaterHeight} material="knitBlue" />
    <Part
      geometry={roundedBox(
        bodySize.width + 0.1,
        ribHeight,
        bodySize.depth + 0.1,
        0.04,
        2
      )}
      material="knitBlue"
      position={[0, ribHeight / 2 - 0.01, 0]}
    />
    <Part
      geometry={roundedBox(
        bodySize.width + 0.08,
        stripeHeight,
        bodySize.depth + 0.08,
        0.035,
        2
      )}
      material="knitWhite"
      position={[0, stripeY, 0]}
    />
    <Part
      geometry={roundedBox(0.42, 0.06, 0.05, 0.025, 2)}
      material="knitWhite"
      position={[0, sweaterHeight - 0.03, bodySize.depth / 2 + 0.03]}
    />
  </group>
);

export const KnitSleeve = () => <Sleeve material="knitBlue" />;
