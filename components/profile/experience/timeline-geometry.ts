import {
  corners,
  cylinder,
  fitWidth,
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

export interface TimelineFrame {
  azimuth: number;
  block: number;
  elevation: number;
  lane: number;
  month: number;
  run: "across" | "down";
  width: number;
}

export const timelineFrames = {
  tall: {
    azimuth: 78,
    block: 100,
    elevation: 40,
    lane: 0,
    month: 9,
    run: "down",
    width: 380,
  },
  wide: {
    azimuth: 70,
    block: 24,
    elevation: 38,
    lane: 58,
    month: 19,
    run: "across",
    width: 1040,
  },
} as const satisfies Record<string, TimelineFrame>;

const RUNWAY = 4;
const LEAD = 2;
const PLATE_H = 9;
const FOOT_H = 5;
const TOP = PLATE_H + FOOT_H;
const BLOCK_H = 20;
const BLOCK_GAP = 2.4;
const RULER_D = 26;
const SIDE_PAD = 14;
const PRINT_W = 136;
const WAFERS = 3;
const POST_H = 62;

interface Span {
  across: number;
  along: number;
  d: number;
  w: number;
}

export interface TimelineBlock {
  company: string;
  companyAt: string;
  ends: string;
  endsAt: string;
  index: number;
  length: string;
  lengthAt: string;
  lift: SolidPaths;
  role: string;
  roleAt: string;
  screws: readonly Flat[];
  seam: string;
  seams: string;
  shadow: string;
  topGroove: string;
  tie: string;
}

export interface TimelineScene {
  base: {
    feet: readonly SolidPaths[];
    groove: string;
    halo: string;
    laneMarks: readonly { at: string; label: string }[];
    lanes: string;
    plate: SolidPaths;
    plateSeam: string;
    screwRings: string;
    screws: readonly Flat[];
    yearLines: string;
  };
  blocks: readonly TimelineBlock[];
  growth: readonly SolidPaths[];
  now: {
    flag: SolidPaths;
    labelAt: string;
    post: SolidPaths;
    socket: SolidPaths;
  };
  ruler: {
    majors: string;
    minors: string;
    strip: SolidPaths;
    years: readonly { at: string; label: string }[];
  };
  viewBox: string;
}

const join = (paths: readonly string[]) => paths.join("");

const ACROSS: Point3 = [1, 0, 0];
const TOWARD: Point3 = [0, 1, 0];

const planOf = (frame: TimelineFrame, span: Span): Plan =>
  frame.run === "across"
    ? { d: span.d, r: 1.5, w: span.w, x: span.along, y: span.across }
    : { d: span.w, r: 1.5, w: span.d, x: span.across, y: span.along };

const pointOf = (
  frame: TimelineFrame,
  along: number,
  across: number,
  z: number
): Point3 => (frame.run === "across" ? [along, across, z] : [across, along, z]);

const monthAt = (frame: TimelineFrame, month: number) =>
  (month + LEAD) * frame.month;

const laneAt = (frame: TimelineFrame, lane: number) =>
  frame.run === "across" ? SIDE_PAD + lane * frame.lane : SIDE_PAD + 22;

const rulerAt = (frame: TimelineFrame, lanes: number) =>
  frame.run === "across" ? laneAt(frame, lanes) + 2 : 4;

const extentOf = (frame: TimelineFrame, ledger: Ledger, lanes: number) => {
  const along = monthAt(frame, ledger.scaleMonths + RUNWAY);
  const across =
    frame.run === "across"
      ? rulerAt(frame, lanes) + RULER_D
      : laneAt(frame, 0) + frame.block + PRINT_W;
  return planOf(frame, { across: 0, along: 0, d: across, w: along });
};

const compactDates = (dates: string) => {
  const [from = "", to = ""] = dates.split(" → ");
  const [fromMonth, fromYear] = from.split(" ");
  const [toMonth, toYear] = to.split(" ");
  return fromYear && fromYear === toYear
    ? `${fromMonth} → ${toMonth} ${toYear}`
    : dates;
};

const blockOf = (
  frame: TimelineFrame,
  entry: LedgerEntry,
  lane: number,
  P: Projection
): TimelineBlock => {
  const along = monthAt(frame, entry.startMonth) + BLOCK_GAP / 2;
  const length = entry.months * frame.month - BLOCK_GAP;
  const across = laneAt(frame, lane) + 4;
  const plan = planOf(frame, { across, along, d: frame.block, w: length });
  const top = TOP + BLOCK_H;
  const seams = Array.from({ length: entry.months - 1 }, (_, month) => {
    const at = monthAt(frame, entry.startMonth + month + 1);
    return frame.run === "across"
      ? segment(
          [at, plan.y + plan.d, TOP + 3],
          [at, plan.y + plan.d, top - 3],
          P
        )
      : segment(
          [plan.x + plan.w, at, TOP + 3],
          [plan.x + plan.w, at, top - 3],
          P
        );
  });
  const printFrom =
    frame.run === "across"
      ? ([plan.x + 4, plan.y + plan.d + 13, TOP] as const)
      : ([plan.x + plan.w + 12, plan.y + 9, TOP] as const);
  const [px, py, pz] = printFrom;
  return {
    company: entry.company,
    companyAt: planeMatrix([plan.x + 5, plan.y + 14, top], ACROSS, TOWARD, P),
    ends: compactDates(entry.dates),
    endsAt: planeMatrix([px, py + 9, pz], ACROSS, TOWARD, P),
    index: lane,
    length: entry.length,
    lengthAt: planeMatrix(
      [plan.x + plan.w - 4.5, plan.y + plan.d - 4.5, top],
      ACROSS,
      TOWARD,
      P
    ),
    lift: slabOf(plan, TOP, BLOCK_H, P, 4, 0.8),
    role: entry.role,
    roleAt: planeMatrix([px, py, pz], ACROSS, TOWARD, P),
    screws: corners(plan, 2.6).map(([x, y]) => iso([x, y, top], P)),
    seam: sideSeam(plan, TOP + 4, P, 4),
    seams: join(seams),
    shadow: planOutline(insetPlan(plan, -1.5), TOP, P, 4),
    tie:
      frame.run === "across"
        ? segment(
            [plan.x, plan.y + plan.d + 1.5, TOP],
            [plan.x, py + 12, TOP],
            P
          )
        : segment(
            [plan.x + plan.w + 1.5, plan.y, TOP],
            [px - 3, plan.y, TOP],
            P
          ),
    topGroove: planOutline(insetPlan(plan, 2.4), top, P, 4),
  };
};

const rulerOf = (
  frame: TimelineFrame,
  ledger: Ledger,
  lanes: number,
  extent: Plan,
  P: Projection
) => {
  const across = rulerAt(frame, lanes);
  const length = (frame.run === "across" ? extent.w : extent.d) - 2 * 6;
  const strip = planOf(frame, {
    across,
    along: 6,
    d: RULER_D - 8,
    w: length,
  });
  const z = TOP + 1.2;
  const minors: string[] = [];
  const majors: string[] = [];
  const years: { at: string; label: string }[] = [];
  const tickFrom = frame.run === "across" ? across : across + RULER_D - 8;
  const tickDir = frame.run === "across" ? 1 : -1;
  for (let month = 0; month <= ledger.scaleMonths; month += 1) {
    const at = monthAt(frame, month);
    const isYear = month % 12 === 0;
    const reach = isYear ? 8 : 4;
    (isYear ? majors : minors).push(
      segment(
        pointOf(frame, at, tickFrom, z),
        pointOf(frame, at, tickFrom + tickDir * reach, z),
        P
      )
    );
    if (isYear) {
      years.push({
        at: planeMatrix(
          frame.run === "across"
            ? [at + 2.5, across + 15.5, z]
            : [across + 1.5, at - 2, z],
          ACROSS,
          TOWARD,
          P
        ),
        label: String(ledger.firstYear + month / 12),
      });
    }
  }
  return {
    majors: join(majors),
    minors: join(minors),
    strip: slabOf(strip, TOP, 1.2, P, 4),
    years,
  };
};

export const timelineSceneOf = (
  ledger: Ledger,
  frame: TimelineFrame
): TimelineScene => {
  const oldestFirst = ledger.entries.toReversed();
  const lanes = oldestFirst.length;
  const plate = { ...extentOf(frame, ledger, lanes), r: 3 };
  const box: Point3[] = [
    [plate.x, plate.y, 0],
    [plate.x + plate.w, plate.y, 0],
    [plate.x, plate.y + plate.d, 0],
    [plate.x + plate.w, plate.y + plate.d, 0],
    [plate.x, plate.y, TOP + POST_H],
    [plate.x + plate.w, plate.y, TOP + POST_H],
  ];
  const { height, projection: P } = fitWidth(box, frame.width, {
    azimuth: frame.azimuth,
    elevation: frame.elevation,
    pad: 16,
  });
  const nowAt = monthAt(frame, ledger.scaleMonths);
  const rulerEdge = rulerAt(frame, lanes);
  const end = frame.run === "across" ? plate.w : plate.d;
  const yearLines = Array.from(
    { length: Math.floor(ledger.scaleMonths / 12) + 1 },
    (_, year) => {
      const at = monthAt(frame, year * 12);
      return frame.run === "across"
        ? segment([at, 6, TOP], [at, rulerEdge - 2, TOP], P)
        : segment([RULER_D + 2, at, TOP], [plate.w - 6, at, TOP], P);
    }
  );
  const laneLines =
    frame.run === "across"
      ? Array.from({ length: lanes - 1 }, (_, lane) =>
          segment(
            [6, laneAt(frame, lane + 1), TOP],
            [end - 6, laneAt(frame, lane + 1), TOP],
            P
          )
        )
      : [];
  const laneMarks =
    frame.run === "across"
      ? oldestFirst.map((entry, lane) => ({
          at: planeMatrix(
            [9, laneAt(frame, lane) + 15, TOP],
            ACROSS,
            TOWARD,
            P
          ),
          label: entry.ordinal,
        }))
      : [];
  const current = oldestFirst.at(-1);
  const currentAcross = laneAt(frame, lanes - 1) + 4;
  const growth =
    current?.bar.isOpen === true
      ? Array.from({ length: WAFERS }, (_, step) =>
          slabOf(
            planOf(frame, {
              across: currentAcross,
              along: nowAt + frame.month * (0.2 + step * 0.8),
              d: frame.block,
              w: frame.month * 0.45,
            }),
            TOP,
            BLOCK_H,
            P,
            3
          )
        )
      : [];
  const postAcross =
    frame.run === "across" ? rulerEdge - 3 : currentAcross + frame.block + 5;
  const [postX, postY] = pointOf(frame, nowAt, postAcross, 0);
  return {
    base: {
      feet: corners(plate, 16)
        .toSorted(([ax, ay], [bx, by]) => ax + ay - bx - by)
        .map(([x, y]) => cylinder(x, y, 5.5, 0, FOOT_H, P, 24)),
      groove: planOutline(insetPlan(plate, 3.5), TOP, P),
      halo: slabOf(plate, 0, TOP, P).fill,
      laneMarks,
      lanes: join(laneLines),
      plate: slabOf(plate, FOOT_H, PLATE_H, P, 6, 1.2),
      plateSeam: sideSeam(plate, FOOT_H + PLATE_H * 0.45, P, 6),
      screwRings: join(
        corners(plate, 8).map(([x, y]) =>
          planOutline(
            { d: 3.2, r: 1.6, w: 3.2, x: x - 1.6, y: y - 1.6 },
            TOP,
            P
          )
        )
      ),
      screws: corners(plate, 8).map(([x, y]) => iso([x, y, TOP], P)),
      yearLines: join(yearLines),
    },
    blocks: oldestFirst.map((entry, lane) => blockOf(frame, entry, lane, P)),
    growth,
    now: {
      flag: slabOf(
        { d: 1, r: 0, w: 24, x: postX + 1, y: postY - 0.5 },
        TOP + POST_H - 14,
        12,
        P,
        0
      ),
      labelAt: planeMatrix(
        [postX + 5, postY + 0.6, TOP + POST_H - 5.2],
        ACROSS,
        [0, 0, -1],
        P
      ),
      post: cylinder(postX, postY, 1, TOP + 1.6, POST_H - 1.6, P, 16),
      socket: cylinder(postX, postY, 3, TOP, 1.6, P, 20),
    },
    ruler: rulerOf(frame, ledger, lanes, plate, P),
    viewBox: `0 0 ${frame.width} ${height}`,
  };
};
