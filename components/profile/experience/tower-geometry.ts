import {
  corners,
  cylinder,
  fitWidth,
  shiftProjection,
  insetPlan,
  iso,
  planeMatrix,
  planOutline,
  segment,
  sideSeam,
  slabOf,
} from "@/components/iso/iso-kit";
import type {
  Flat,
  Plan,
  Point3,
  Projection,
  SolidPaths,
} from "@/components/iso/iso-kit";

import type { Ledger, LedgerEntry } from "./ledger";

export interface TowerFrame {
  callout: number;
  split: boolean;
  maxHeight: number;
  type: number;
  width: number;
}

export const towerFrames = {
  tall: { callout: 170, maxHeight: 520, split: true, type: 1, width: 380 },
  wide: { callout: 400, maxHeight: 600, split: false, type: 1.3, width: 1040 },
} as const satisfies Record<string, TowerFrame>;

const AZIMUTH = 36;
const ELEVATION = 30;
const WIDTH = 132;
const MONTH = 9;
const STOREY = 40;
const SLAB = 8;
const GROUND = 10;
const SITE_PAD = 34;
const MAST = 74;
const DESK_PITCH = 24;

export interface Desk {
  chair: SolidPaths;
  desk: SolidPaths;
  screen: SolidPaths;
}

export interface TowerFloor {
  callout: {
    company: string;
    companyAt: Flat;
    notes: readonly { at: Flat; text: string }[];
    leader: string;
    level: string;
    levelAt: Flat;
    tick: string;
  };
  columns: readonly SolidPaths[];
  desks: readonly Desk[];
  index: number;
  isOpen: boolean;
  mullions: string;
  sign: SolidPaths;
  signAt: string;
  company: string;
  slab: SolidPaths;
  slabSeams: string;
  wallLeft: SolidPaths;
  wallBack: SolidPaths;
  wallSeams: string;
}

export interface TowerCrane {
  boom: SolidPaths;
  boomLattice: string;
  cab: SolidPaths;
  counterweight: SolidPaths;
  counterJib: SolidPaths;
  deck: SolidPaths;
  deckSeams: string;
  hoist: string;
  hook: SolidPaths;
  load: SolidPaths;
  loadSeams: string;
  mast: SolidPaths;
  mastLattice: string;
  pallet: readonly SolidPaths[];
  rails: readonly SolidPaths[];
  trolley: SolidPaths;
}

export interface TowerScene {
  crane: TowerCrane | null;
  floors: readonly TowerFloor[];
  ground: {
    curb: string;
    halo: string;
    plate: SolidPaths;
    plateSeam: string;
    screws: readonly Flat[];
    walk: SolidPaths;
    walkSeams: string;
  };
  roof: SolidPaths | null;
  type: number;
  viewBox: string;
}

const join = (paths: readonly string[]) => paths.join("");

const depthOf = (entry: LedgerEntry) => Math.max(entry.months, 3) * MONTH;

const desksOf = (depth: number, z: number, P: Projection): Desk[] => {
  const rows = Math.max(1, Math.floor((depth - 18) / DESK_PITCH));
  return Array.from({ length: rows }, (_, row) =>
    [22, WIDTH - 52].map((x): Desk => {
      const y = 12 + row * DESK_PITCH;
      return {
        chair: cylinder(x + 14, y + 13.5, 2.6, z, 4.2, P, 14),
        desk: slabOf({ d: 8, r: 0.6, w: 28, x, y }, z, 7, P, 2),
        screen: slabOf(
          { d: 1.2, r: 0.3, w: 11, x: x + 9, y: y + 1.6 },
          z + 7,
          7,
          P,
          1
        ),
      };
    })
  ).flat();
};

const floorOf = (
  entry: LedgerEntry,
  index: number,
  frame: TowerFrame,
  calloutX: number,
  P: Projection
): TowerFloor => {
  const depth = depthOf(entry);
  const z = GROUND + index * STOREY;
  const room = z + SLAB;
  const ceiling = z + STOREY;
  const plan: Plan = { d: depth, r: 0, w: WIDTH, x: 0, y: 0 };
  const seams = Array.from({ length: entry.months - 1 }, (_, month) =>
    segment(
      [WIDTH, (month + 1) * MONTH, z + 1.5],
      [WIDTH, (month + 1) * MONTH, z + SLAB - 1.5],
      P
    )
  );
  const mullions = [
    ...Array.from({ length: 5 }, (_, step) => {
      const x = ((step + 1) * WIDTH) / 6;
      return segment([x, depth, room], [x, depth, ceiling], P);
    }),
    ...Array.from(
      { length: Math.max(0, Math.floor(depth / 24) - 1) },
      (_, step) => {
        const y = ((step + 1) * depth) / Math.floor(depth / 24);
        return segment([WIDTH, y, room], [WIDTH, y, ceiling], P);
      }
    ),
  ];
  const anchor = iso([WIDTH, 0, z + STOREY / 2], P);
  const [ax, ay] = anchor;
  const lineY = ay;
  const textX = calloutX + 10 * frame.type;
  return {
    callout: {
      company: entry.company,
      companyAt: [textX, lineY - (frame.split ? 2 : 4) * frame.type],
      leader: `M${(ax + 6).toFixed(1)} ${lineY.toFixed(1)}H${calloutX.toFixed(1)}`,
      level: `L${String(index + 1).padStart(2, "0")}`,
      levelAt: [ax + 8, lineY - 3],
      notes: (frame.split
        ? [entry.dates]
        : [`${entry.role} · ${entry.dates} · ${entry.length}`]
      ).map((text, line) => ({
        at: [textX, lineY + (frame.split ? 9 : 10) * frame.type + line * 10],
        text,
      })),
      tick: `M${calloutX.toFixed(1)} ${(lineY - 5).toFixed(1)}V${(lineY + 5).toFixed(1)}`,
    },
    columns: [
      [WIDTH - 3, depth - 3],
      [0, depth - 3],
      [WIDTH - 3, 0],
    ].map(([x = 0, y = 0]) =>
      slabOf({ d: 3, r: 0, w: 3, x, y }, room, STOREY - SLAB, P, 0)
    ),
    company: entry.company,
    desks: desksOf(depth, room, P),
    index,
    isOpen: entry.bar.isOpen,
    mullions: join(mullions),
    sign: slabOf(
      { d: 0.8, r: 0, w: WIDTH - 24, x: 12, y: depth },
      z + 1.2,
      SLAB - 2.4,
      P,
      0
    ),
    signAt: planeMatrix(
      [17, depth + 0.8, z + SLAB - 2.6],
      [1, 0, 0],
      [0, 0, -1],
      P
    ),
    slab: slabOf(plan, z, SLAB, P, 0, 0.6),
    slabSeams: join(seams),
    wallBack: slabOf(
      { d: 2, r: 0, w: WIDTH, x: 0, y: 0 },
      room,
      STOREY - SLAB,
      P,
      0
    ),
    wallLeft: slabOf(
      { d: depth, r: 0, w: 2, x: 0, y: 0 },
      room,
      STOREY - SLAB,
      P,
      0
    ),
    wallSeams: sideSeam({ d: 2, r: 0, w: WIDTH, x: 0, y: 0 }, room + 12, P, 0),
  };
};

const DECK_SLAB = 5;

const craneOf = (roofZ: number, depth: number, P: Projection): TowerCrane => {
  const deck: Plan = { d: Math.round(depth * 0.5), r: 0, w: WIDTH, x: 0, y: 0 };
  const deckTop = roofZ + DECK_SLAB;
  const mastX = 16;
  const mastY = 14;
  const top = deckTop + MAST;
  const boomZ = top - 10;
  const reach = WIDTH + 4;
  const lattice = Array.from({ length: 6 }, (_, step) => {
    const low = deckTop + 4 + step * 10;
    return join([
      segment([mastX + 6, mastY + 6, low], [mastX + 6, mastY, low + 10], P),
      segment([mastX, mastY + 6, low], [mastX + 6, mastY + 6, low + 10], P),
    ]);
  });
  const boomLattice = Array.from({ length: 11 }, (_, step) => {
    const x = mastX + 8 + step * 10;
    return segment([x, mastY + 6, boomZ], [x + 5, mastY + 6, boomZ + 5], P);
  });
  const trolleyX = WIDTH - 40;
  const hookZ = roofZ + 22;
  const loadY = Math.min(depth - 10, 44);
  return {
    boom: slabOf(
      { d: 6, r: 0, w: reach, x: mastX + 6, y: mastY },
      boomZ,
      5,
      P,
      0
    ),
    boomLattice: join(boomLattice),
    cab: slabOf(
      { d: 8, r: 0.6, w: 9, x: mastX - 1, y: mastY + 6 },
      boomZ - 9,
      8,
      P,
      0
    ),
    counterJib: slabOf(
      { d: 6, r: 0, w: 34, x: mastX - 34, y: mastY },
      boomZ,
      4,
      P,
      0
    ),
    counterweight: slabOf(
      { d: 7, r: 0, w: 10, x: mastX - 32, y: mastY - 0.5 },
      boomZ - 9,
      9,
      P,
      0
    ),
    deck: slabOf(deck, roofZ, DECK_SLAB, P, 0, 0.5),
    deckSeams: join(
      Array.from({ length: 5 }, (_, step) => {
        const x = ((step + 1) * WIDTH) / 6;
        return segment([x, 0, deckTop], [x, deck.d, deckTop], P);
      })
    ),
    hoist: segment(
      [trolleyX + 3, loadY, boomZ - 1.5],
      [trolleyX + 3, loadY, hookZ + 8],
      P
    ),
    hook: slabOf(
      { d: 3, r: 0.4, w: 4, x: trolleyX + 1, y: loadY - 1.5 },
      hookZ + 5,
      3,
      P,
      0
    ),
    load: slabOf(
      { d: 14, r: 0, w: 22, x: trolleyX - 8, y: loadY - 7 },
      hookZ - 3,
      8,
      P,
      0,
      0.4
    ),
    loadSeams: sideSeam(
      { d: 14, r: 0, w: 22, x: trolleyX - 8, y: loadY - 7 },
      hookZ + 1,
      P,
      0
    ),
    mast: slabOf({ d: 6, r: 0, w: 6, x: mastX, y: mastY }, deckTop, MAST, P, 0),
    mastLattice: join(lattice),
    pallet: [0, 1, 2].map((step) =>
      slabOf({ d: 14, r: 0, w: 24, x: 58, y: 6 }, deckTop + step * 3.2, 3, P, 0)
    ),
    rails: [
      slabOf({ d: 2, r: 0, w: WIDTH, x: 0, y: depth - 2 }, roofZ, 4, P, 0),
      slabOf({ d: depth, r: 0, w: 2, x: WIDTH - 2, y: 0 }, roofZ, 4, P, 0),
    ],
    trolley: slabOf(
      { d: 8, r: 0.4, w: 7, x: trolleyX, y: mastY - 1 },
      boomZ - 3,
      3,
      P,
      0
    ),
  };
};

export const towerSceneOf = (ledger: Ledger, frame: TowerFrame): TowerScene => {
  const oldestFirst = ledger.entries.toReversed();
  const deepest = Math.max(...oldestFirst.map(depthOf));
  const site: Plan = {
    d: deepest + SITE_PAD * 2,
    r: 3,
    w: WIDTH + SITE_PAD * 2,
    x: -SITE_PAD,
    y: -SITE_PAD,
  };
  const roofZ = GROUND + oldestFirst.length * STOREY;
  const box: Point3[] = [
    [site.x, site.y, 0],
    [site.x + site.w, site.y, 0],
    [site.x, site.y + site.d, 0],
    [site.x + site.w, site.y + site.d, 0],
    [0, 0, roofZ + MAST + 4],
    [-20, 14, roofZ + MAST],
    [WIDTH + 24, 14, roofZ + MAST],
  ];
  const fit = fitWidth(box, frame.width - frame.callout, {
    azimuth: AZIMUTH,
    elevation: ELEVATION,
    maxHeight: frame.maxHeight,
    pad: 14,
  });
  const offset = Math.max(0, (frame.width - fit.width - frame.callout) / 2);
  const P = shiftProjection(fit.projection, [offset, 0]);
  const calloutX = offset + fit.width + 4;
  const top = oldestFirst.at(-1);
  const topDepth = top ? depthOf(top) : 0;
  const walk: Plan = { d: 14, r: 1, w: WIDTH + 30, x: -15, y: deepest + 10 };
  return {
    crane: top?.bar.isOpen === true ? craneOf(roofZ, topDepth, P) : null,
    floors: oldestFirst.map((entry, index) =>
      floorOf(entry, index, frame, calloutX, P)
    ),
    ground: {
      curb: planOutline(insetPlan(site, 5), GROUND, P),
      halo: slabOf(site, 0, GROUND, P).fill,
      plate: slabOf(site, 0, GROUND, P, 6, 1),
      plateSeam: sideSeam(site, GROUND * 0.45, P, 6),
      screws: corners(site, 9).map(([x, y]) => iso([x, y, GROUND], P)),
      walk: slabOf(walk, GROUND, 1, P, 2),
      walkSeams: join(
        Array.from({ length: Math.floor(walk.w / 12) - 1 }, (_, step) => {
          const x = walk.x + (step + 1) * 12;
          return segment(
            [x, walk.y, GROUND + 1],
            [x, walk.y + walk.d, GROUND + 1],
            P
          );
        })
      ),
    },
    roof:
      top && !top.bar.isOpen
        ? slabOf({ d: topDepth, r: 0, w: WIDTH, x: 0, y: 0 }, roofZ, SLAB, P, 0)
        : null,
    type: frame.type,
    viewBox: `0 0 ${frame.width} ${fit.height}`,
  };
};
