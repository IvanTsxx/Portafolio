import type { AgentRole } from "@/lib/agents/roles";

export const outfitPieceIds = {
  face: ["none", "round-glasses", "pixel-shades", "teal-visor"],
  head: [
    "none",
    "yellow-hard-hat",
    "white-hard-hat",
    "safety-helmet",
    "deerstalker",
    "mortarboard",
    "headset",
    "goggles",
  ],
  held: [
    "none",
    "laptop",
    "book",
    "magnifier",
    "tape-measure",
    "pointer",
    "pencil",
  ],
  offhand: ["none", "clipboard", "blueprint-roll", "tablet"],
  torso: [
    "none",
    "safety-vest",
    "tweed-vest",
    "lab-coat",
    "plaid-coat",
    "knit-sweater",
  ],
} as const;

export type OutfitSlot = keyof typeof outfitPieceIds;

export const outfitSlots = [
  "head",
  "face",
  "torso",
  "held",
  "offhand",
] as const satisfies readonly OutfitSlot[];

export type OutfitPieceId<Slot extends OutfitSlot = OutfitSlot> =
  (typeof outfitPieceIds)[Slot][number];

export type Outfit = { readonly [Slot in OutfitSlot]: OutfitPieceId<Slot> };

export const rolePresets = {
  analyst: {
    face: "teal-visor",
    head: "goggles",
    held: "pointer",
    offhand: "none",
    torso: "lab-coat",
  },
  architect: {
    face: "none",
    head: "white-hard-hat",
    held: "tape-measure",
    offhand: "blueprint-roll",
    torso: "none",
  },
  builder: {
    face: "none",
    head: "yellow-hard-hat",
    held: "laptop",
    offhand: "none",
    torso: "safety-vest",
  },
  debugger: {
    face: "none",
    head: "deerstalker",
    held: "magnifier",
    offhand: "none",
    torso: "plaid-coat",
  },
  inspector: {
    face: "none",
    head: "safety-helmet",
    held: "pencil",
    offhand: "clipboard",
    torso: "none",
  },
  orchestrator: {
    face: "pixel-shades",
    head: "headset",
    held: "none",
    offhand: "tablet",
    torso: "none",
  },
  researcher: {
    face: "round-glasses",
    head: "mortarboard",
    held: "book",
    offhand: "none",
    torso: "tweed-vest",
  },
} as const satisfies Record<AgentRole, Outfit>;

export const isOutfitPiece = <Slot extends OutfitSlot>(
  slot: Slot,
  value: unknown
): value is OutfitPieceId<Slot> =>
  outfitPieceIds[slot].some((piece) => piece === value);

export const outfitsMatch = (first: Outfit, second: Outfit) =>
  outfitSlots.every((slot) => first[slot] === second[slot]);
