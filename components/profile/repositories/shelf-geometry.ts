import {
  axisVector,
  corners,
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

import type { RepositorySpecimen, SwatchTone } from "./repositories";
import { log2Stars, PLATE_TOP, plotOf } from "./repository-plot";
import type { PlotFrame } from "./repository-plot";

interface ShelfFrame extends PlotFrame {
  lidSlide: number;
}

export const shelfFrames = {
  tall: {
    azimuth: 80,
    cols: 1,
    elevation: 44,
    lidSlide: 34,
    pitchX: 0,
    pitchY: 128,
    width: 380,
  },
  wide: {
    azimuth: 58,
    cols: 3,
    elevation: 36,
    lidSlide: 62,
    pitchX: 196,
    pitchY: 122,
    width: 1040,
  },
} as const satisfies Record<string, ShelfFrame>;

const BOX_W = 164;
const BOX_D = 66;
const BASE_H = 12;
const STAR_H = 17;
const LID_H = 6;
const LID_LIP = 1.2;
const SHEETS = 3;
const TAG_GAP = 3;
const CHAR_W = 3.5;
const LID_RISE = 26;
const SHEET_SINK = 14;

const ACROSS: Point3 = [1, 0, 0];
const TOWARD: Point3 = [0, 1, 0];
const DOWN: Point3 = [0, 0, -1];

export interface ShelfTag {
  at: string;
  outline: string;
  text: string;
}

export interface ShelfSheet {
  rules: string;
  sheet: SolidPaths;
}

export interface ShelfBox {
  body: SolidPaths;
  bodySeam: string;
  corners: readonly SolidPaths[];
  index: number;
  language: string;
  languageAt: string;
  label: string;
  lid: SolidPaths;
  lidGroove: string;
  lidOpen: Flat;
  mouth: string;
  tape: string;
  name: string;
  nameAt: string;
  owner: string;
  ownerAt: string;
  recess: string;
  shadow: string;
  sheets: readonly ShelfSheet[];
  stars: string;
  starsAt: string;
  swatch: string;
  swatchTone: SwatchTone;
  tags: readonly ShelfTag[];
}

export interface ShelfScene {
  boxes: readonly ShelfBox[];
  plate: {
    feet: readonly SolidPaths[];
    groove: string;
    halo: string;
    rules: string;
    screws: readonly Flat[];
    seam: string;
    slab: SolidPaths;
  };
  viewBox: string;
}

const join = (paths: readonly string[]) => paths.join("");

export const boxHeight = (stars: number) => BASE_H + STAR_H * log2Stars(stars);

const quadOn = (
  corner: Point3,
  across: number,
  down: number,
  P: Projection
) => {
  const [x, y, z] = corner;
  const points = [
    iso([x, y, z], P),
    iso([x + across, y, z], P),
    iso([x + across, y, z - down], P),
    iso([x, y, z - down], P),
  ];
  return `M${points.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join("L")}Z`;
};

const mouthOf = ({ d, w, x, y }: Plan, z: number, P: Projection) => {
  const rim = [
    iso([x, y + d, z], P),
    iso([x + w, y + d, z], P),
    iso([x + w, y, z], P),
  ];
  const [left, , right] = rim;
  const sky = -1000;
  const points: Flat[] = [
    ...rim,
    [right?.[0] ?? 0, sky],
    [left?.[0] ?? 0, sky],
  ];
  return `M${points.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join("L")}Z`;
};

const tagsOf = (
  specimen: RepositorySpecimen,
  plan: Plan,
  z: number,
  P: Projection
): ShelfTag[] => {
  const labels = [
    ...specimen.topics,
    ...(specimen.topicsLeft > 0 ? [`+${specimen.topicsLeft}`] : []),
  ];
  const tags: ShelfTag[] = [];
  let x = plan.x + 7;
  const y = plan.y + 39;
  for (const text of labels) {
    const w = text.length * CHAR_W + 7;
    if (x + w > plan.x + plan.w - 30) {
      break;
    }
    tags.push({
      at: planeMatrix([x + 3.5, y + 6.6, z], ACROSS, TOWARD, P),
      outline: planOutline({ d: 9, r: 1.5, w, x, y }, z, P, 3),
      text,
    });
    x += w + TAG_GAP;
  }
  return tags;
};

const boxOf = (
  specimen: RepositorySpecimen,
  plan: Plan,
  index: number,
  P: Projection,
  lidSlide: number
): ShelfBox => {
  const height = boxHeight(specimen.stars);
  const bodyTop = PLATE_TOP + height - LID_H;
  const lidPlan = insetPlan(plan, -LID_LIP);
  const lidTop = bodyTop + LID_H;
  const front = plan.y + plan.d;
  const sheets = Array.from({ length: SHEETS }, (_, step): ShelfSheet => {
    const sheet: Plan = {
      d: 1,
      r: 0,
      w: 64,
      x: plan.x + 30 + step * 22,
      y: plan.y + 30 + step * 10,
    };
    const top = bodyTop + 30 - step * 4;
    return {
      rules: join(
        Array.from({ length: 4 }, (_rule, line) =>
          segment(
            [sheet.x + 6, sheet.y + sheet.d, top - 5 - line * 4],
            [
              sheet.x + (line === 3 ? 30 : 52),
              sheet.y + sheet.d,
              top - 5 - line * 4,
            ],
            P
          )
        )
      ),
      sheet: slabOf(
        sheet,
        bodyTop - SHEET_SINK,
        top - bodyTop + SHEET_SINK,
        P,
        0
      ),
    };
  });
  const cornerPlans = corners(plan, 0).map(([x, y]) => ({
    d: 6,
    r: 0.6,
    w: 6,
    x: x - (x > plan.x ? 6 : 0),
    y: y - (y > plan.y ? 6 : 0),
  }));
  return {
    body: slabOf(plan, PLATE_TOP, height - LID_H, P, 2, 0.6),
    bodySeam: sideSeam(plan, PLATE_TOP + 4, P, 2),
    corners: cornerPlans.flatMap((corner) =>
      corner.x > plan.x || corner.y > plan.y
        ? [slabOf(insetPlan(corner, -0.5), PLATE_TOP, 7, P, 1)]
        : []
    ),
    index,
    label: quadOn(
      [plan.x + 6, front + 0.05, PLATE_TOP + height - LID_H - 3],
      plan.w - 12,
      12,
      P
    ),
    language: specimen.language,
    languageAt: planeMatrix(
      [plan.x + 21, front, PLATE_TOP + height - LID_H - 7.5],
      ACROSS,
      DOWN,
      P
    ),
    lid: slabOf(lidPlan, bodyTop, LID_H, P, 2, 0.6),
    lidGroove: planOutline(insetPlan(lidPlan, 3), lidTop, P, 2),
    lidOpen: axisVector(P, [0, -lidSlide, LID_RISE]),
    mouth: mouthOf(insetPlan(plan, 3), bodyTop, P),
    name: specimen.name,
    nameAt: planeMatrix([plan.x + 7, plan.y + 31, lidTop], ACROSS, TOWARD, P),
    owner: `${specimen.owner} /`,
    ownerAt: planeMatrix([plan.x + 7, plan.y + 16, lidTop], ACROSS, TOWARD, P),
    recess: planOutline(insetPlan(plan, 3), bodyTop, P, 2),
    shadow: planOutline(insetPlan(plan, -2), PLATE_TOP, P, 2),
    sheets,
    stars: `★ ${specimen.stars}`,
    starsAt: planeMatrix(
      [plan.x + plan.w - 8, front, PLATE_TOP + height - LID_H - 7.5],
      ACROSS,
      DOWN,
      P
    ),
    swatch: quadOn(
      [plan.x + 9, front + 0.05, PLATE_TOP + height - LID_H - 5],
      8,
      8,
      P
    ),
    swatchTone: specimen.swatch,
    tags: tagsOf(specimen, plan, lidTop, P),
    tape: join([
      segment(
        [plan.x + plan.w - 26, lidPlan.y, lidTop],
        [plan.x + plan.w - 26, lidPlan.y + lidPlan.d, lidTop],
        P
      ),
      segment(
        [plan.x + plan.w - 16, lidPlan.y, lidTop],
        [plan.x + plan.w - 16, lidPlan.y + lidPlan.d, lidTop],
        P
      ),
      segment(
        [plan.x + plan.w - 26, lidPlan.y + lidPlan.d, lidTop],
        [plan.x + plan.w - 26, lidPlan.y + lidPlan.d, bodyTop],
        P
      ),
      segment(
        [plan.x + plan.w - 16, lidPlan.y + lidPlan.d, lidTop],
        [plan.x + plan.w - 16, lidPlan.y + lidPlan.d, bodyTop],
        P
      ),
    ]),
  };
};

export const shelfSceneOf = (
  specimens: readonly RepositorySpecimen[],
  frame: ShelfFrame
): ShelfScene => {
  const tallest = Math.max(...specimens.map((item) => boxHeight(item.stars)));
  const plot = plotOf(
    specimens.length,
    frame,
    { d: BOX_D, w: BOX_W },
    { margin: 26, rise: tallest + LID_RISE + 40 }
  );
  const P = plot.projection;
  const { plate } = plot;
  const rows = Math.ceil(specimens.length / frame.cols);
  const rules = Array.from({ length: rows + 1 }, (_, row) => {
    const y = row === rows ? plate.d - 10 : 26 + row * frame.pitchY - 10;
    return segment([8, y, PLATE_TOP], [plate.w - 8, y, PLATE_TOP], P);
  });
  return {
    boxes: specimens.flatMap((specimen, index) => {
      const plan = plot.slots[index];
      return plan ? [boxOf(specimen, plan, index, P, frame.lidSlide)] : [];
    }),
    plate: {
      feet: corners(plate, 16)
        .toSorted(([ax, ay], [bx, by]) => ax + ay - bx - by)
        .map(([x, y]) =>
          slabOf({ d: 10, r: 5, w: 10, x: x - 5, y: y - 5 }, 0, 5, P, 6)
        ),
      groove: planOutline(insetPlan(plate, 3.5), PLATE_TOP, P),
      halo: slabOf(plate, 0, PLATE_TOP, P).fill,
      rules: join(rules),
      screws: corners(plate, 8).map(([x, y]) => iso([x, y, PLATE_TOP], P)),
      seam: sideSeam(plate, 5 + 4, P, 6),
      slab: slabOf(plate, 5, PLATE_TOP - 5, P, 6, 1.2),
    },
    viewBox: plot.viewBox,
  };
};
