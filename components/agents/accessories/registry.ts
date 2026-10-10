import type { AgentRole } from "@/lib/agents/roles";

import * as analystParts from "./analyst";
import * as architectParts from "./architect";
import * as builderParts from "./builder";
import * as debuggerParts from "./debugger";
import * as inspectorParts from "./inspector";
import type { AccessoryKit } from "./kit";
import * as orchestratorParts from "./orchestrator";
import * as researcherParts from "./researcher";

export const accessoryKits = {
  analyst: {
    body: analystParts.LabCoat,
    face: analystParts.TealGlassesBand,
    head: analystParts.PushedUpGoggles,
    leftArm: analystParts.WhiteSleeve,
    rightArm: analystParts.Pointer,
  },
  architect: {
    head: architectParts.WhiteHardHat,
    leftArm: architectParts.BlueprintRoll,
    rightArm: architectParts.TapeMeasure,
  },
  builder: {
    body: builderParts.SafetyVest,
    head: builderParts.YellowHardHat,
    torso: builderParts.Laptop,
  },
  debugger: {
    body: debuggerParts.PlaidCoat,
    head: debuggerParts.Deerstalker,
    leftArm: debuggerParts.PlaidSleeve,
    rightArm: debuggerParts.MagnifyingGlass,
  },
  inspector: {
    head: inspectorParts.SafetyHelmet,
    leftArm: inspectorParts.Clipboard,
    rightArm: inspectorParts.Pencil,
  },
  orchestrator: {
    face: orchestratorParts.PixelShades,
    head: orchestratorParts.Headset,
    leftArm: orchestratorParts.ControlTablet,
  },
  researcher: {
    body: researcherParts.TweedVest,
    face: researcherParts.RoundGlasses,
    head: researcherParts.Mortarboard,
    torso: researcherParts.OpenBook,
  },
} as const satisfies Record<AgentRole, AccessoryKit>;
