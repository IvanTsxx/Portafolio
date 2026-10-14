import {
  corners,
  cylinder,
  insetPlan,
  iso,
  planeMatrix,
  planOutline,
  segment,
  slabOf,
} from "@/components/iso/iso-kit";
import type {
  Flat,
  Plan,
  Point3,
  Projection,
  SolidPaths,
} from "@/components/iso/iso-kit";

import type { RepositorySpecimen, SwatchTone } from "./repositories";
import { PLATE_TOP, plotOf } from "./repository-plot";
import type { PlotFrame } from "./repository-plot";

export const cityFrames = {
  tall: {
    azimuth: 80,
    cols: 1,
    elevation: 42,
    pitchX: 0,
    pitchY: 118,
    width: 380,
  },
  wide: {
    azimuth: 56,
    cols: 3,
    elevation: 34,
    pitchX: 216,
    pitchY: 124,
    width: 1040,
  },
} as const satisfies Record<string, PlotFrame>;

const SLOT_W = 196;
const SLOT_D = 96;
const TOWER = 58;
const TOWER_X = 6;
const TOWER_Y = 8;
const LOBBY = 16;
const STOREY = 12;
const PARAPET = 3;
const POST_H = 30;
const SIGN_H = 27;
const SIGN_Y = 62;
const CHAR_W = 4.3;

const ACROSS: Point3 = [1, 0, 0];
const TOWARD: Point3 = [0, 1, 0];
const DOWN: Point3 = [0, 0, -1];

export interface CityWindow {
  d: string;
  storey: number;
}

export interface CityTower {
  antenna: SolidPaths;
  door: string;
  floors: readonly SolidPaths[];
  index: number;
  language: string;
  languageAt: string;
  lobby: SolidPaths;
  name: string;
  nameAt: string;
  owner: string;
  ownerAt: string;
  parapet: SolidPaths;
  post: SolidPaths;
  roofDeck: string;
  shadow: string;
  sign: SolidPaths;
  stars: string;
  starsAt: string;
  swatch: string;
  swatchTone: SwatchTone;
  tank: SolidPaths;
  windows: readonly CityWindow[];
}

export interface CityScene {
  plate: {
    blocks: readonly SolidPaths[];
    dashes: string;
    feet: readonly SolidPaths[];
    groove: string;
    halo: string;
    screws: readonly Flat[];
    slab: SolidPaths;
  };
  towers: readonly CityTower[];
  viewBox: string;
}

const join = (paths: readonly string[]) => paths.join("");

const quad = (points: readonly Point3[], P: Projection) =>
  `M${points
    .map((point) => iso(point, P))
    .map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`)
    .join("L")}Z`;

export const storeysOf = (stars: number) => Math.max(1, stars);

const windowsOf = (tower: Plan, storeys: number, P: Projection) => {
  const lit: CityWindow[] = [];
  const front = tower.y + tower.d;
  const side = tower.x + tower.w;
  for (let storey = 0; storey < storeys; storey += 1) {
    const low = PLATE_TOP + LOBBY + storey * STOREY + 3;
    const high = low + STOREY - 6;
    for (let bay = 0; bay < 4; bay += 1) {
      const x = tower.x + 5 + bay * 13;
      lit.push({
        d: quad(
          [
            [x, front, high],
            [x + 8, front, high],
            [x + 8, front, low],
            [x, front, low],
          ],
          P
        ),
        storey,
      });
      const y = tower.y + 5 + bay * 13;
      lit.push({
        d: quad(
          [
            [side, y, high],
            [side, y + 8, high],
            [side, y + 8, low],
            [side, y, low],
          ],
          P
        ),
        storey,
      });
    }
  }
  return lit;
};

const towerOf = (
  specimen: RepositorySpecimen,
  slot: Plan,
  index: number,
  P: Projection
): CityTower => {
  const tower: Plan = {
    d: TOWER,
    r: 0,
    w: TOWER,
    x: slot.x + TOWER_X,
    y: slot.y + TOWER_Y,
  };
  const storeys = storeysOf(specimen.stars);
  const roof = PLATE_TOP + LOBBY + storeys * STOREY;
  const longest = Math.max(
    specimen.name.length * CHAR_W,
    (specimen.language.length + 8) * CHAR_W * 0.75
  );
  const signX = slot.x + TOWER_X + TOWER + 10;
  const signW = Math.min(slot.x + slot.w - signX, longest + 14);
  const signY = slot.y + SIGN_Y;
  const signTop = PLATE_TOP + POST_H;
  return {
    antenna: cylinder(tower.x + 12, tower.y + 12, 0.7, roof, 16, P, 10),
    door: quad(
      [
        [tower.x + 22, tower.y + tower.d, PLATE_TOP + 11],
        [tower.x + 36, tower.y + tower.d, PLATE_TOP + 11],
        [tower.x + 36, tower.y + tower.d, PLATE_TOP],
        [tower.x + 22, tower.y + tower.d, PLATE_TOP],
      ],
      P
    ),
    floors: Array.from({ length: storeys }, (_, storey) =>
      slabOf(
        insetPlan(tower, 1),
        PLATE_TOP + LOBBY + storey * STOREY,
        STOREY,
        P,
        0
      )
    ),
    index,
    language: specimen.language,
    languageAt: planeMatrix(
      [signX + 15, signY + 1, signTop - 22],
      ACROSS,
      DOWN,
      P
    ),
    lobby: slabOf(tower, PLATE_TOP, LOBBY, P, 0, 0.5),
    name: specimen.name,
    nameAt: planeMatrix(
      [signX + 5, signY + 1, signTop - 13.5],
      ACROSS,
      DOWN,
      P
    ),
    owner: `${specimen.owner} /`,
    ownerAt: planeMatrix([signX + 5, signY + 1, signTop - 6], ACROSS, DOWN, P),
    parapet: slabOf(tower, roof, PARAPET, P, 0, 0.5),
    post: cylinder(signX + 2, signY - 1, 1, PLATE_TOP, POST_H, P, 12),
    roofDeck: planOutline(insetPlan(tower, 3), roof + PARAPET, P, 0),
    shadow: planOutline(insetPlan(tower, -3), PLATE_TOP, P, 0),
    sign: slabOf(
      { d: 1, r: 0, w: signW, x: signX, y: signY },
      signTop - SIGN_H,
      SIGN_H,
      P,
      0
    ),
    stars: `★ ${specimen.stars}`,
    starsAt: planeMatrix(
      [signX + signW - 5, signY + 1, signTop - 22],
      ACROSS,
      DOWN,
      P
    ),
    swatch: quad(
      [
        [signX + 5, signY + 1.05, signTop - 17],
        [signX + 11, signY + 1.05, signTop - 17],
        [signX + 11, signY + 1.05, signTop - 23],
        [signX + 5, signY + 1.05, signTop - 23],
      ],
      P
    ),
    swatchTone: specimen.swatch,
    tank: cylinder(
      tower.x + tower.w - 16,
      tower.y + tower.d - 18,
      7,
      roof + PARAPET,
      9,
      P,
      24
    ),
    windows: windowsOf(tower, storeys, P),
  };
};

export const citySceneOf = (
  specimens: readonly RepositorySpecimen[],
  frame: PlotFrame
): CityScene => {
  const tallest = Math.max(
    ...specimens.map((item) => LOBBY + storeysOf(item.stars) * STOREY + 30)
  );
  const plot = plotOf(
    specimens.length,
    frame,
    { d: SLOT_D, w: SLOT_W },
    { margin: 18, rise: tallest }
  );
  const P = plot.projection;
  const { plate } = plot;
  const rows = Math.ceil(specimens.length / frame.cols);
  const dashes: string[] = [];
  for (let row = 0; row <= rows; row += 1) {
    const y = 18 + row * frame.pitchY - 12;
    for (let x = 14; x < plate.w - 20; x += 18) {
      dashes.push(segment([x, y, PLATE_TOP], [x + 9, y, PLATE_TOP], P));
    }
  }
  return {
    plate: {
      blocks: plot.slots.map((slot) =>
        slabOf(
          { d: slot.d - 4, r: 2, w: slot.w + 12, x: slot.x - 6, y: slot.y },
          PLATE_TOP,
          1.4,
          P,
          3
        )
      ),
      dashes: join(dashes),
      feet: corners(plate, 16)
        .toSorted(([ax, ay], [bx, by]) => ax + ay - bx - by)
        .map(([x, y]) =>
          slabOf({ d: 10, r: 5, w: 10, x: x - 5, y: y - 5 }, 0, 5, P, 6)
        ),
      groove: planOutline(insetPlan(plate, 3.5), PLATE_TOP, P),
      halo: slabOf(plate, 0, PLATE_TOP, P).fill,
      screws: corners(plate, 8).map(([x, y]) => iso([x, y, PLATE_TOP], P)),
      slab: slabOf(plate, 5, PLATE_TOP - 5, P, 6, 1.2),
    },
    towers: specimens.flatMap((specimen, index) => {
      const slot = plot.slots[index];
      return slot ? [towerOf(specimen, slot, index, P)] : [];
    }),
    viewBox: plot.viewBox,
  };
};
