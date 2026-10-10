import type { ComponentType } from "react";
import { createElement, Fragment } from "react";

import type { Outfit, OutfitPieceId, OutfitSlot } from "../outfit";
import { outfitSlots, rolePresets } from "../outfit";
import type { AgentRole } from "../types";
import * as analystParts from "./analyst";
import * as architectParts from "./architect";
import * as builderParts from "./builder";
import * as debuggerParts from "./debugger";
import * as inspectorParts from "./inspector";
import type { AccessoryKit, AgentAnchor } from "./kit";
import { agentAnchors } from "./kit";
import * as knitwearParts from "./knitwear";
import * as orchestratorParts from "./orchestrator";
import * as researcherParts from "./researcher";

type PieceRegistry = {
  readonly [Slot in OutfitSlot]: Record<OutfitPieceId<Slot>, AccessoryKit>;
};

export const outfitPieces: PieceRegistry = {
  face: {
    none: {},
    "pixel-shades": { face: orchestratorParts.PixelShades },
    "round-glasses": { face: researcherParts.RoundGlasses },
    "teal-visor": { face: analystParts.TealGlassesBand },
  },
  head: {
    deerstalker: { head: debuggerParts.Deerstalker },
    goggles: { head: analystParts.PushedUpGoggles },
    headset: { head: orchestratorParts.Headset },
    mortarboard: { head: researcherParts.Mortarboard },
    none: {},
    "safety-helmet": { head: inspectorParts.SafetyHelmet },
    "white-hard-hat": { head: architectParts.WhiteHardHat },
    "yellow-hard-hat": { head: builderParts.YellowHardHat },
  },
  held: {
    book: { torso: researcherParts.OpenBook },
    laptop: { torso: builderParts.Laptop },
    magnifier: { rightArm: debuggerParts.MagnifyingGlass },
    none: {},
    pencil: { rightArm: inspectorParts.Pencil },
    pointer: { rightArm: analystParts.Pointer },
    "tape-measure": { rightArm: architectParts.TapeMeasure },
  },
  offhand: {
    "blueprint-roll": { leftArm: architectParts.BlueprintRoll },
    clipboard: { leftArm: inspectorParts.Clipboard },
    none: {},
    tablet: { leftArm: orchestratorParts.ControlTablet },
  },
  torso: {
    "knit-sweater": {
      body: knitwearParts.KnitSweater,
      leftArm: knitwearParts.KnitSleeve,
      rightArm: knitwearParts.KnitSleeve,
    },
    "lab-coat": {
      body: analystParts.LabCoat,
      leftArm: analystParts.WhiteSleeve,
      rightArm: analystParts.WhiteSleeve,
    },
    none: {},
    "plaid-coat": {
      body: debuggerParts.PlaidCoat,
      leftArm: debuggerParts.PlaidSleeve,
      rightArm: debuggerParts.PlaidSleeve,
    },
    "safety-vest": { body: builderParts.SafetyVest },
    "tweed-vest": { body: researcherParts.TweedVest },
  },
};

export interface WornPart {
  key: string;
  Wear: ComponentType;
}

export type WornParts = Record<AgentAnchor, WornPart[]>;

const pieceKit = <Slot extends OutfitSlot>(
  slot: Slot,
  piece: OutfitPieceId<Slot>
): AccessoryKit => outfitPieces[slot][piece];

export const wornParts = (outfit: Outfit): WornParts => {
  const worn: WornParts = {
    body: [],
    face: [],
    head: [],
    leftArm: [],
    rightArm: [],
    torso: [],
  };
  for (const slot of outfitSlots) {
    const kit = pieceKit(slot, outfit[slot]);
    for (const anchor of agentAnchors) {
      const Wear = kit[anchor];
      if (Wear) {
        worn[anchor].push({ Wear, key: `${slot}:${outfit[slot]}` });
      }
    }
  }
  return worn;
};

const composeKit = (outfit: Outfit): AccessoryKit => {
  const worn = wornParts(outfit);
  const kit: AccessoryKit = {};
  for (const anchor of agentAnchors) {
    const parts = worn[anchor];
    if (parts.length === 1) {
      kit[anchor] = parts[0]?.Wear;
    } else if (parts.length > 1) {
      kit[anchor] = () =>
        createElement(
          Fragment,
          null,
          parts.map(({ key, Wear }) => createElement(Wear, { key }))
        );
    }
  }
  return kit;
};

export const accessoryKits: Record<AgentRole, AccessoryKit> = {
  analyst: composeKit(rolePresets.analyst),
  architect: composeKit(rolePresets.architect),
  builder: composeKit(rolePresets.builder),
  debugger: composeKit(rolePresets.debugger),
  inspector: composeKit(rolePresets.inspector),
  orchestrator: composeKit(rolePresets.orchestrator),
  researcher: composeKit(rolePresets.researcher),
};
