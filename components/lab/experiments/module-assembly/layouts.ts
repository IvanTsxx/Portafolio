export type ModuleTone = "plate" | "panel" | "ink";

export interface ModuleSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  lift: number;
  tone: ModuleTone;
}

type SlotTuple = readonly [
  x: number,
  y: number,
  width: number,
  height: number,
  lift: number,
  tone: ModuleTone,
];

const toSlots = (tuples: readonly SlotTuple[], depth = 0.12): ModuleSlot[] =>
  tuples.map(([x, y, width, height, lift, tone]) => ({
    depth,
    height,
    lift,
    tone,
    width,
    x,
    y,
  }));

const mosaic = (
  originX: number,
  originY: number,
  columns: number,
  rows: number,
  cell: number
): SlotTuple[] =>
  Array.from({ length: columns * rows }, (_, tileIndex) => [
    originX + (tileIndex % columns) * cell,
    originY + Math.floor(tileIndex / columns) * cell,
    cell,
    cell,
    0.14,
    "panel",
  ]);

const card = toSlots([
  [2, 0, 8, 8, 0, "plate"],
  ...mosaic(2.5, 0.5, 7, 3, 1),
  [2.5, 4, 4.5, 0.7, 0.14, "ink"],
  [2.5, 5, 7, 0.35, 0.14, "panel"],
  [2.5, 5.6, 5.5, 0.35, 0.14, "panel"],
  [2.5, 6.8, 2.6, 0.7, 0.2, "ink"],
  [5.4, 6.8, 2, 0.7, 0.14, "panel"],
]);

const stack = toSlots([
  [1, 0.4, 7, 5, 0, "plate"],
  [2, 1.4, 7, 5, 0.5, "plate"],
  [3, 2.4, 7, 5, 1, "plate"],
  [3.5, 2.9, 6, 1.2, 1.12, "panel"],
  [3.5, 4.4, 2.8, 2.4, 1.12, "panel"],
  [6.7, 4.4, 2.8, 2.4, 1.12, "panel"],
  [3.5, 7.1, 1.6, 0.3, 1.12, "ink"],
  ...mosaic(2.3, 1.8, 6, 1, 1).map(([x, y, width]): SlotTuple => [
    x + 0.1,
    y,
    width - 0.2,
    0.3,
    0.62,
    "panel",
  ]),
  ...mosaic(1.3, 0.8, 6, 1, 1).map(([x, y, width]): SlotTuple => [
    x + 0.1,
    y,
    width - 0.2,
    0.3,
    0.12,
    "panel",
  ]),
]);

const bento = toSlots([
  [0.5, 0.5, 6.5, 4, 0, "panel"],
  [7.3, 0.5, 4.2, 1.9, 0, "panel"],
  [7.3, 2.6, 4.2, 1.9, 0, "panel"],
  [0.5, 4.8, 3.1, 2.7, 0, "panel"],
  [3.9, 4.8, 3.1, 2.7, 0, "panel"],
  [7.3, 4.8, 4.2, 2.7, 0, "plate"],
  [1, 1, 3.4, 0.7, 0.12, "ink"],
  [1, 2, 5.5, 0.3, 0.12, "plate"],
  [1, 2.5, 4.4, 0.3, 0.12, "plate"],
  [7.8, 1, 1.2, 0.9, 0.12, "ink"],
  [7.8, 3.1, 3.2, 0.3, 0.12, "plate"],
  [7.8, 3.6, 2.2, 0.3, 0.12, "plate"],
  ...mosaic(7.8, 5.3, 3, 2, 0.95).map(([x, y, width, height]): SlotTuple => [
    x,
    y,
    width - 0.12,
    height - 0.12,
    0.12,
    "panel",
  ]),
]);

export const moduleLayouts = { bento, card, stack } as const;

export type ModuleLayout = keyof typeof moduleLayouts;

export const moduleCount = Math.max(
  ...Object.values(moduleLayouts).map((slots) => slots.length)
);

export const layoutGrid = { columns: 12, rows: 8, unit: 0.3 } as const;
