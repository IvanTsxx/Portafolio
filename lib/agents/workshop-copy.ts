import type { OutfitPieceId, OutfitSlot } from "@/components/agents/outfit";

import type { AgentAction } from "./roles";

export interface Labeled {
  label: string;
}

type PieceCopy = {
  readonly [Slot in OutfitSlot]: Record<OutfitPieceId<Slot>, Labeled>;
};

const none = { label: "None" } as const;

export const slotCopy = {
  face: { label: "Face" },
  head: { label: "Head" },
  held: { label: "Held" },
  offhand: { label: "Off hand" },
  torso: { label: "Torso" },
} as const satisfies Record<OutfitSlot, Labeled>;

export const pieceCopy: PieceCopy = {
  face: {
    none,
    "pixel-shades": { label: "Pixel shades" },
    "round-glasses": { label: "Round glasses" },
    "teal-visor": { label: "Teal band" },
  },
  head: {
    deerstalker: { label: "Deerstalker" },
    goggles: { label: "Goggles" },
    headset: { label: "Headset" },
    mortarboard: { label: "Mortarboard" },
    none,
    "safety-helmet": { label: "Helmet" },
    "white-hard-hat": { label: "White hat" },
    "yellow-hard-hat": { label: "Hard hat" },
  },
  held: {
    book: { label: "Book" },
    laptop: { label: "Laptop" },
    magnifier: { label: "Magnifier" },
    none,
    pencil: { label: "Pencil" },
    pointer: { label: "Pointer" },
    "tape-measure": { label: "Tape" },
  },
  offhand: {
    "blueprint-roll": { label: "Blueprint" },
    clipboard: { label: "Clipboard" },
    none,
    tablet: { label: "Tablet" },
  },
  torso: {
    "knit-sweater": { label: "Sweater" },
    "lab-coat": { label: "Lab coat" },
    none,
    "plaid-coat": { label: "Plaid coat" },
    "safety-vest": { label: "Safety vest" },
    "tweed-vest": { label: "Tweed vest" },
  },
};

export const pieceAnnotation = <Slot extends OutfitSlot>(
  slot: Slot,
  piece: OutfitPieceId<Slot>
): Labeled => pieceCopy[slot][piece];

export const actionCopy = {
  build: { label: "Build" },
  carry: { label: "Carry" },
  celebrate: { label: "Celebrate" },
  check: { label: "Check" },
  direct: { label: "Direct" },
  idle: { label: "Idle" },
  inspect: { label: "Inspect" },
  measure: { label: "Measure" },
  point: { label: "Point" },
  read: { label: "Read" },
  type: { label: "Type" },
  walk: { label: "Walk" },
  wave: { label: "Wave" },
} as const satisfies Record<AgentAction, Labeled>;
