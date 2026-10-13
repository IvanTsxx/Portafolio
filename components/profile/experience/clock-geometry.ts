import {
  corners,
  cylinder,
  depthOf,
  insetPlan,
  iso,
  planOutline,
  ring,
  sideSeam,
  slabOf,
} from "@/components/iso/iso-kit";
import type {
  Flat,
  Plan,
  Plane,
  Point3,
  Projection,
} from "@/components/iso/iso-kit";

import type { Career } from "./career";
import {
  BASE_H,
  baseOf,
  BOARD_TOP,
  boardOf,
  CAP,
  CAP_TOP,
  CARD_H,
  CARD_T,
  CARD_W,
  CARD_Y,
  CASE,
  CASE_TOP,
  CHEEK,
  CLOCK_HEIGHT,
  CLOCK_WIDTH,
  CLOCK_X,
  DIAL_DEPTH,
  DIAL_R,
  DIAL_Z,
  DIVIDER_TOP,
  fitOf,
  FOOT_H,
  FRONT_Y,
  HEADER_LOW,
  HEADER_TOP,
  HUB,
  HUB_R,
  LIP_BACK,
  LIP_FRONT,
  LIP_TOP,
  PLINTH,
  PLINTH_TOP,
  POCKET_PITCH,
  pocketOf,
  RACK_BACK,
  RACK_GAP,
  rackLeft,
  rackWidth,
  SHELF_LOW,
  SHELF_TOP,
  SIDE_X,
  SLOT,
  SLOT_CARD_Y,
  THROAT,
  THROAT_TOP,
} from "./clock-layout";
import type { Frame } from "./prism";
import { circleOf, hullOf, linePath, prismOf, rectRing, ringIn } from "./prism";

const tenth = (value: number) => Math.round(value * 10) / 10;

const join = (paths: readonly string[]) => paths.join("");

const facing = (y: number, depth: number): Frame => ({
  origin: [0, y, 0],
  u: [1, 0, 0],
  v: [0, 0, 1],
  w: [0, depth, 0],
});

const siding = (x: number, depth: number): Frame => ({
  origin: [x, 0, 0],
  u: [0, 1, 0],
  v: [0, 0, 1],
  w: [depth, 0, 0],
});

const flat = (points: readonly Point3[], P: Projection): Flat[] =>
  points.map((point) => iso(point, P));

const byDepth = (points: readonly Plane[], P: Projection) =>
  points.toSorted(
    (a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P)
  );

const baseArt = (count: number, P: Projection) => {
  const base = baseOf(count);
  const low = -BASE_H;
  const label: Plan = { d: 9, r: 1.2, w: 34, x: base.x + 24, y: 15 };
  return {
    feet: byDepth(corners(base, 18), P).map(([x, y]) => [
      cylinder(x, y, 7, low - FOOT_H, 1.6, P, 28),
      cylinder(x, y, 5.4, low - FOOT_H + 1.6, FOOT_H - 1.6, P, 28),
    ]),
    groove: planOutline(insetPlan(base, 5), 0, P),
    halo: slabOf(base, low - FOOT_H, BASE_H, P).fill,
    label: slabOf(label, 0, 0.8, P, 4),
    labelLine: planOutline(insetPlan(label, 1.4), 0.8, P),
    labelRules: join(
      [20, 13, 16].map((length, row) =>
        linePath(
          [
            [label.x + 4, label.y + 2.6 + row * 2, 0.8],
            [label.x + 4 + length, label.y + 2.6 + row * 2, 0.8],
          ],
          P
        )
      )
    ),
    labelScrews: flat(
      [
        [label.x + label.w - 3, label.y + 2, 0.8],
        [label.x + label.w - 3, label.y + label.d - 2, 0.8],
      ],
      P
    ),
    screwRings: join(
      corners(base, 9).map(([x, y]) => ring(x, y, 2.2, 0, P, 16))
    ),
    screws: flat(
      corners(base, 9).map(([x, y]): Point3 => [x, y, 0]),
      P
    ),
    seam: sideSeam(base, low + 4, P, 8),
    slab: slabOf(base, low, BASE_H, P, 8, 1.6),
  };
};

const boardArt = (count: number, P: Projection) => {
  const board = boardOf(count);
  const front = board.y + board.d;
  const right = board.x + board.w;
  const brackets = [board.x + 14, right - 20].map((x) =>
    slabOf({ d: 6, r: 1, w: 6, x, y: front - 0.5 }, 0, 4, P, 3, 0.4)
  );
  const batten = rackLeft(1, count) - RACK_GAP / 2 - 2;
  return {
    batten: slabOf(
      { d: 1.4, r: 0.4, w: 4, x: batten, y: front },
      0,
      BOARD_TOP,
      P,
      2,
      0.4
    ),
    battenScrews: flat(
      [20, 46, 70].map((z): Point3 => [batten + 2, front + 1.4, z]),
      P
    ),
    brackets,
    cap: slabOf(insetPlan(board, -1.2), BOARD_TOP, 3, P, 3, 0.8),
    halo: slabOf(insetPlan(board, -2), 0, 0.1, P).fill,
    screws: flat(
      [
        [board.x + 4, front, BOARD_TOP - 4],
        [right - 4, front, BOARD_TOP - 4],
        [board.x + 4, front, 3],
        [right - 4, front, 3],
      ],
      P
    ),
    slab: slabOf(board, 0, BOARD_TOP, P, 4, 1),
  };
};

const holderArt = (cx: number, isFilled: boolean, P: Projection) => {
  const frame = facing(LIP_FRONT, 0.5);
  const outer = rectRing(cx - 6.5, 20, cx + 6.5, 27, 0.8);
  const face = facing(LIP_FRONT + 0.5, 0);
  return {
    holder: prismOf(outer, frame, P),
    rule: isFilled
      ? linePath(
          [
            [cx - 4.2, LIP_FRONT + 0.5, 23.6],
            [cx + 2.4, LIP_FRONT + 0.5, 23.6],
          ],
          P
        )
      : "",
    window: ringIn(face, rectRing(cx - 5.2, 21.2, cx + 5.2, 25.8, 0.5), P),
  };
};

const rackArt = (rack: 0 | 1, filled: readonly boolean[], P: Projection) => {
  const count = filled.length;
  const left = rackLeft(rack, count);
  const width = rackWidth(count);
  const cheek = (x: number) =>
    slabOf(
      {
        d: LIP_FRONT - RACK_BACK - 1.2,
        r: 0.6,
        w: CHEEK,
        x,
        y: RACK_BACK + 1.2,
      },
      SHELF_TOP,
      DIVIDER_TOP + 4 - SHELF_TOP,
      P,
      3,
      0.5
    );
  const dividers = Array.from({ length: count - 1 }, (_, index) =>
    slabOf(
      {
        d: LIP_BACK - RACK_BACK - 1.2,
        r: 0.4,
        w: 2,
        x: left + CHEEK + (index + 1) * POCKET_PITCH - 1,
        y: RACK_BACK + 1.2,
      },
      SHELF_TOP,
      DIVIDER_TOP - SHELF_TOP,
      P,
      2,
      0.4
    )
  );
  const centers = Array.from(
    { length: count },
    (_, index) => left + CHEEK + index * POCKET_PITCH + POCKET_PITCH / 2
  );
  const lip: Plan = {
    d: LIP_FRONT - LIP_BACK,
    r: 0.3,
    w: width - CHEEK * 2,
    x: left + CHEEK,
    y: LIP_BACK,
  };
  const feet = [left + 2, left + width - 8].map((x) =>
    slabOf(
      { d: 8, r: 0.8, w: 6, x, y: RACK_BACK + 1.5 },
      0,
      SHELF_LOW,
      P,
      2,
      0.4
    )
  );
  return {
    back: slabOf(
      { d: 1.2, r: 0.3, w: width, x: left, y: RACK_BACK },
      SHELF_TOP,
      HEADER_LOW - SHELF_TOP,
      P,
      2
    ),
    cheekLeft: cheek(left),
    cheekRight: cheek(left + width - CHEEK),
    dividers,
    feet,
    header: slabOf(
      { d: 2.4, r: 0.6, w: width, x: left, y: RACK_BACK },
      HEADER_LOW,
      HEADER_TOP - HEADER_LOW,
      P,
      3,
      0.5
    ),
    headerScrews: flat(
      [
        [left + 4, RACK_BACK + 2.4, (HEADER_LOW + HEADER_TOP) / 2],
        [left + width - 4, RACK_BACK + 2.4, (HEADER_LOW + HEADER_TOP) / 2],
      ],
      P
    ),
    holders: centers.map((cx, index) =>
      holderArt(cx, filled[index] ?? false, P)
    ),
    lip: slabOf(lip, SHELF_TOP, LIP_TOP - SHELF_TOP, P, 2, 0.3),
    lipSeam: sideSeam(lip, SHELF_TOP + 4, P, 2),
    rivets: flat(
      centers.flatMap((cx): Point3[] => [
        [cx - 9, LIP_FRONT, SHELF_TOP + 2],
        [cx + 9, LIP_FRONT, SHELF_TOP + 2],
      ]),
      P
    ),
    shelf: slabOf(
      { d: LIP_FRONT - RACK_BACK, r: 0.8, w: width, x: left, y: RACK_BACK },
      SHELF_LOW,
      SHELF_TOP - SHELF_LOW,
      P,
      3,
      0.5
    ),
  };
};

const cardArt = (id: string, x: number, isOpen: boolean, P: Projection) => {
  const face = CARD_Y + CARD_T;
  const top = SHELF_TOP + CARD_H;
  const header = top - 5;
  const rule = (z: number) =>
    linePath(
      [
        [x, face, z],
        [x + CARD_W, face, z],
      ],
      P
    );
  const rows = Array.from({ length: 7 }, (_, row) => header - 4 - row * 4);
  const stamp = (from: number) =>
    linePath(
      [
        [x + from, face, header - 2],
        [x + from + 5, face, header - 2],
      ],
      P
    );
  return {
    grid: join([
      rule(header),
      ...rows.map(rule),
      linePath(
        [
          [x + CARD_W / 2, face, header],
          [x + CARD_W / 2, face, SHELF_TOP],
        ],
        P
      ),
    ]),
    id,
    slab: prismOf(
      rectRing(x, SHELF_TOP, x + CARD_W, top, 0.8),
      facing(CARD_Y, CARD_T),
      P
    ),
    stamps: isOpen ? stamp(2) : join([stamp(2), stamp(11)]),
    title: linePath(
      [
        [x + 2.2, face, top - 2.4],
        [x + 11.5, face, top - 2.4],
      ],
      P
    ),
  };
};

const clockFront = (P: Projection) => {
  const face = facing(FRONT_Y, 0);
  const plate = facing(FRONT_Y, 0.6);
  const plateFace = FRONT_Y + 0.6;
  const hinge = (z: number) =>
    prismOf(rectRing(13.4, z, 15.2, z + 5, 0.4), facing(FRONT_Y, 0.8), P);
  return {
    door: ringIn(face, rectRing(14.4, 10, CASE.x + CASE.w - 6.4, 38, 1.6), P),
    hinges: [hinge(13), hinge(31)],
    keyhole: ringIn(
      facing(FRONT_Y, 0),
      circleOf(1.5, 20).map(([a, b]): Plane => [a + 51, b + 24]),
      P
    ),
    keyholeDot: iso([51, FRONT_Y, 24], P),
    plate: prismOf(rectRing(22, 13, 42, 19.5, 0.6), plate, P),
    plateRules: join(
      [
        [24.4, 34, 17.4],
        [24.4, 31, 15.2],
      ].map(([from, to, z]) =>
        linePath(
          [
            [from ?? 0, plateFace, z ?? 0],
            [to ?? 0, plateFace, z ?? 0],
          ],
          P
        )
      )
    ),
    plateScrews: flat(
      [
        [40, plateFace, 17.6],
        [40, plateFace, 15],
      ],
      P
    ),
    ribbon: linePath(
      [
        [21, FRONT_Y, 28.6],
        [43, FRONT_Y, 28.6],
      ],
      P
    ),
    window: ringIn(face, rectRing(21, 25, 43, 32, 1), P),
    windowInner: ringIn(face, rectRing(22.2, 26.2, 41.8, 30.8, 0.6), P),
  };
};

const dialArt = (P: Projection) => {
  const drum: Frame = {
    origin: [CLOCK_X, FRONT_Y, DIAL_Z],
    u: [1, 0, 0],
    v: [0, 0, 1],
    w: [0, DIAL_DEPTH, 0],
  };
  const faceY = FRONT_Y + DIAL_DEPTH;
  const root = DIAL_R - 2;
  const tickPaths = (pick: (index: number) => boolean, length: number) =>
    join(
      Array.from({ length: 60 }, (_, index) => {
        if (!pick(index)) {
          return "";
        }
        const angle = (index / 60) * Math.PI * 2;
        const at = (radius: number): Point3 => [
          CLOCK_X + Math.sin(angle) * radius,
          faceY,
          DIAL_Z + Math.cos(angle) * radius,
        ];
        return linePath([at(root), at(root - length)], P);
      })
    );
  const hub: Frame = {
    origin: [CLOCK_X, faceY, DIAL_Z],
    u: [1, 0, 0],
    v: [0, 0, 1],
    w: [0, 0.6, 0],
  };
  return {
    bezel: join([
      ringIn(
        { ...drum, origin: [CLOCK_X, faceY, DIAL_Z] },
        circleOf(root, 64),
        P
      ),
      ringIn(
        { ...drum, origin: [CLOCK_X, faceY, DIAL_Z] },
        circleOf(DIAL_R - 0.8, 64),
        P
      ),
    ]),
    drum: prismOf(circleOf(DIAL_R, 56), drum, P),
    hub: prismOf(circleOf(1.5, 16), hub, P),
    maker: join(
      [
        [3.6, 6.4],
        [2.2, 8.2],
      ].map(([half = 0, drop = 0]) =>
        linePath(
          [
            [CLOCK_X - half, faceY, DIAL_Z - drop],
            [CLOCK_X + half, faceY, DIAL_Z - drop],
          ],
          P
        )
      )
    ),
    ticksMajor: tickPaths((index) => index % 5 === 0 && index !== 0, 2.6),
    ticksMinor: tickPaths((index) => index % 5 !== 0, 1.2),
    zero: tickPaths((index) => index === 0, 3.2),
  };
};

const clockSide = (P: Projection) => {
  const side = siding(SIDE_X, 0);
  const vents = join(
    Array.from({ length: 6 }, (_, index) => {
      const y = CASE.y + 7 + index * 4;
      return ringIn(side, rectRing(y, 16, y + 1.6, 34, 0.8), P);
    })
  );
  const [face] = HUB;
  const housingFrame = siding(SIDE_X, face - SIDE_X);
  return {
    housing: prismOf(
      rectRing(HUB[1] - 7, HUB[2] - 10, HUB[1] + 7, HUB[2] + 10, 1.2),
      housingFrame,
      P
    ),
    housingScrews: flat(
      [
        [face, HUB[1] - 5, HUB[2] - 8],
        [face, HUB[1] + 5, HUB[2] - 8],
        [face, HUB[1] - 5, HUB[2] + 8],
        [face, HUB[1] + 5, HUB[2] + 8],
      ],
      P
    ),
    hub: prismOf(
      circleOf(HUB_R, 32),
      { origin: HUB, u: [0, 1, 0], v: [0, 0, 1], w: [3, 0, 0] },
      P
    ),
    vents,
  };
};

const clockArt = (P: Projection) => ({
  cap: slabOf(CAP, CASE_TOP, CAP_TOP - CASE_TOP, P, 6, 1),
  capScrews: flat(
    [
      [CAP.x + 4, CAP.y + 4, CAP_TOP],
      [CAP.x + CAP.w - 4, CAP.y + 4, CAP_TOP],
      [CAP.x + 4, CAP.y + CAP.d - 4, CAP_TOP],
      [CAP.x + CAP.w - 4, CAP.y + CAP.d - 4, CAP_TOP],
    ],
    P
  ),
  case: slabOf(CASE, PLINTH_TOP, CASE_TOP - PLINTH_TOP, P, 6),
  caseSeam: sideSeam(CASE, 44, P, 6),
  dial: dialArt(P),
  front: clockFront(P),
  plinth: slabOf(PLINTH, 0, PLINTH_TOP, P, 4, 0.8),
  plinthScrews: flat(
    corners(PLINTH, 3).map(([x, y]): Point3 => [x, y, PLINTH_TOP]),
    P
  ),
  side: clockSide(P),
  slot: planOutline(SLOT, THROAT_TOP, P, 3),
  throat: slabOf(THROAT, CAP_TOP, THROAT_TOP - CAP_TOP, P, 3, 0.3),
  throatScrews: flat(
    [
      [THROAT.x + 2.4, THROAT.y + THROAT.d / 2, THROAT_TOP],
      [THROAT.x + THROAT.w - 2.4, THROAT.y + THROAT.d / 2, THROAT_TOP],
    ],
    P
  ),
});

const clockCorners = (): Point3[] =>
  corners(CAP).flatMap(([x, y]): Point3[] => [
    [x, y, 0],
    [x, y, THROAT_TOP],
  ]);

const slotMask = (P: Projection, width: number, height: number) => {
  const a = iso([CASE.x - 4, SLOT_CARD_Y, THROAT_TOP], P);
  const b = iso([CASE.x + CASE.w + 4, SLOT_CARD_Y, THROAT_TOP], P);
  const slope = (b[1] - a[1]) / (b[0] - a[0]);
  const left = Math.min(...hullOf(flat(clockCorners(), P)).map(([x]) => x));
  const right = Math.max(...hullOf(flat(clockCorners(), P)).map(([x]) => x));
  const lineAt = (x: number) => a[1] + (x - a[0]) * slope;
  return `M-40 -40H${width + 40}V${height + 40}H-40Z M${tenth(left)} ${tenth(lineAt(left))}L${tenth(right)} ${tenth(lineAt(right))}L${tenth(right)} ${height + 40}L${tenth(left)} ${height + 40}Z`;
};

export const clockOf = (career: Career) => {
  const count = career.tenures.length;
  const P = fitOf(count);
  const pockets = career.tenures.map((tenure, index) =>
    pocketOf(index, tenure.isCurrent, count)
  );
  return {
    art: {
      base: baseArt(count, P),
      board: boardArt(count, P),
      cards: career.tenures.map((tenure, index) =>
        cardArt(tenure.id, pockets[index]?.x ?? 0, tenure.isCurrent, P)
      ),
      clock: clockArt(P),
      racks: [
        rackArt(
          0,
          pockets.map((pocket) => pocket.rack === 0),
          P
        ),
        rackArt(
          1,
          pockets.map((pocket) => pocket.rack === 1),
          P
        ),
      ] as const,
    },
    mask: slotMask(P, CLOCK_WIDTH, CLOCK_HEIGHT),
    pockets,
    projection: P,
  };
};

export type ClockArt = ReturnType<typeof clockOf>["art"];
export type RackArt = ClockArt["racks"][0];
export type CardArt = ClockArt["cards"][number];
