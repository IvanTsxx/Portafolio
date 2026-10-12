import type { OutfitPieceId, OutfitSlot } from "@/components/agents/outfit";

import type { AgentAction, AgentRole } from "./roles";

export interface Annotated {
  label: string;
  jp: string;
}

type PieceCopy = {
  readonly [Slot in OutfitSlot]: Record<OutfitPieceId<Slot>, Annotated>;
};

const none = { jp: "なし", label: "None" } as const;

export const slotCopy = {
  face: { jp: "顔", label: "Face" },
  head: { jp: "頭", label: "Head" },
  held: { jp: "持ち物", label: "Held" },
  offhand: { jp: "片手", label: "Off hand" },
  torso: { jp: "胴", label: "Torso" },
} as const satisfies Record<OutfitSlot, Annotated>;

export const pieceCopy: PieceCopy = {
  face: {
    none,
    "pixel-shades": { jp: "色眼鏡", label: "Pixel shades" },
    "round-glasses": { jp: "丸眼鏡", label: "Round glasses" },
    "teal-visor": { jp: "バイザー", label: "Teal band" },
  },
  head: {
    deerstalker: { jp: "鹿撃ち帽", label: "Deerstalker" },
    goggles: { jp: "ゴーグル", label: "Goggles" },
    headset: { jp: "インカム", label: "Headset" },
    mortarboard: { jp: "角帽", label: "Mortarboard" },
    none,
    "safety-helmet": { jp: "保安帽", label: "Helmet" },
    "white-hard-hat": { jp: "白帽", label: "White hat" },
    "yellow-hard-hat": { jp: "安全帽", label: "Hard hat" },
  },
  held: {
    book: { jp: "本", label: "Book" },
    laptop: { jp: "端末", label: "Laptop" },
    magnifier: { jp: "虫眼鏡", label: "Magnifier" },
    none,
    pencil: { jp: "鉛筆", label: "Pencil" },
    pointer: { jp: "指し棒", label: "Pointer" },
    "tape-measure": { jp: "巻尺", label: "Tape" },
  },
  offhand: {
    "blueprint-roll": { jp: "青図", label: "Blueprint" },
    clipboard: { jp: "用箋挟", label: "Clipboard" },
    none,
    tablet: { jp: "板端末", label: "Tablet" },
  },
  torso: {
    "knit-sweater": { jp: "セーター", label: "Sweater" },
    "lab-coat": { jp: "白衣", label: "Lab coat" },
    none,
    "plaid-coat": { jp: "格子柄", label: "Plaid coat" },
    "safety-vest": { jp: "反射衣", label: "Safety vest" },
    "tweed-vest": { jp: "ツイード", label: "Tweed vest" },
  },
};

export const pieceAnnotation = <Slot extends OutfitSlot>(
  slot: Slot,
  piece: OutfitPieceId<Slot>
): Annotated => pieceCopy[slot][piece];

export const actionCopy = {
  build: { jp: "建設", label: "Build" },
  carry: { jp: "運搬", label: "Carry" },
  celebrate: { jp: "祝賀", label: "Celebrate" },
  check: { jp: "確認", label: "Check" },
  direct: { jp: "指揮", label: "Direct" },
  idle: { jp: "待機", label: "Idle" },
  inspect: { jp: "調査", label: "Inspect" },
  measure: { jp: "測定", label: "Measure" },
  point: { jp: "指差し", label: "Point" },
  read: { jp: "読書", label: "Read" },
  type: { jp: "入力", label: "Type" },
  walk: { jp: "歩行", label: "Walk" },
  wave: { jp: "挨拶", label: "Wave" },
} as const satisfies Record<AgentAction, Annotated>;

export const roleJp = {
  analyst: "分析",
  architect: "設計",
  builder: "建築",
  debugger: "探偵",
  inspector: "検査",
  orchestrator: "指揮",
  researcher: "研究",
} as const satisfies Record<AgentRole, string>;
