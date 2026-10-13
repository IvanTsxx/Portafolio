import {
  corners,
  cylinder,
  depthOf,
  fitProjection,
  insetPlan,
  iso,
  knurl,
  pathOf,
  planOutline,
  ring,
  segment,
  sideArc,
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

import type { Catalog, CatalogCard } from "./catalog";

export const CATALOG_WIDTH = 600;
export const CATALOG_HEIGHT = 360;

const AZIMUTH = 35;
const BASE: Plan = { d: 194, r: 6, w: 132, x: -64, y: -52 };
const BASE_H = 9;
const FOOT_H = 5;
const PITCH = 14;
const FIRST_X = -36.4;
const CARD_T = 1.2;
const CARD_HALF = 32;
const FLOOR_TOP = 6;
const CARD_H = 42;
const CARD_TOP = FLOOR_TOP + CARD_H;
const TAB_W = 16;
const TAB_H = 6;
const WALL_TOP = 22;
const PANEL_TOP = 28;
const CLIP_Y = 4;
const NOTCH_R = 1.1;
const NOTCH_INSET = 2.7;
const NOTCH_FIRST = 6;
const NOTCH_PITCH = 4.4;
const READER: Plan = { d: 80, r: 3, w: 46, x: -14, y: 52 };
const READER_TOP = 30;
const SLOT_X = -2;
const SLOT_Y = 92;
const KEY: Flat = [22, 120];
const LAMP: Flat = [22, 64];

export const HOVER_LIFT = 24;
export const CARRY_LIFT = 44;
export const SEAT_DROP = -2;

export interface Assembly {
  key: string;
  move: Point3;
}

export interface CardRoute {
  carry: number;
  clearsFrom: number;
  drop: number;
  hover: number;
  shift: number;
  slide: number;
}

export interface CatalogRig {
  assemblies: readonly Assembly[];
  axes: { x: Flat; y: Flat; z: Flat };
  clip: string;
  routes: readonly CardRoute[];
}

const fine = (value: number) => Math.round(value * 100) / 100;

const join = (paths: readonly string[]) => paths.join("");

export const translateBy = (axes: CatalogRig["axes"], [x, y, z]: Point3) =>
  `translate(${fine(axes.x[0] * x + axes.y[0] * y + axes.z[0] * z)} ${fine(
    axes.x[1] * x + axes.y[1] * y + axes.z[1] * z
  )})`;

const cardX = (slot: number) => FIRST_X + slot * PITCH;

const tabCenter = (tab: number, tabs: number) => {
  const span = CARD_HALF * 2 - TAB_W - 8;
  const step = tabs > 1 ? Math.min(TAB_W + 3, span / (tabs - 1)) : 0;
  return CARD_HALF - 4 - TAB_W / 2 - tab * step;
};

const fitOf = (catalog: Catalog): Projection => {
  const points: Point3[] = [];
  for (const [x, y] of corners(BASE)) {
    points.push([x, y, -BASE_H - FOOT_H - 2], [x, y, 0]);
  }
  const last = cardX(Math.max(0, catalog.cards.length - 1));
  for (const x of [FIRST_X, last]) {
    for (const y of [-CARD_HALF, CARD_HALF]) {
      points.push([x, y, CARD_TOP + TAB_H + HOVER_LIFT]);
    }
  }
  for (const y of [SLOT_Y - CARD_HALF, SLOT_Y + CARD_HALF]) {
    points.push([SLOT_X, y, CARD_TOP + TAB_H + SEAT_DROP + 6]);
  }
  return fitProjection(points, CATALOG_WIDTH, CATALOG_HEIGHT, {
    azimuth: AZIMUTH,
    pad: 14,
  });
};

const axesOf = (P: Projection): CatalogRig["axes"] => {
  const origin = iso([0, 0, 0], P);
  const step = (point: Point3): Flat => {
    const moved = iso(point, P);
    return [moved[0] - origin[0], moved[1] - origin[1]];
  };
  return { x: step([1, 0, 0]), y: step([0, 1, 0]), z: step([0, 0, 1]) };
};

const onFaceX = (
  x: number,
  points: readonly Plane[],
  P: Projection,
  closed = false
) =>
  pathOf(
    points.map(([y, z]) => iso([x, y, z], P)),
    closed
  );

const onFaceY = (
  y: number,
  points: readonly Plane[],
  P: Projection,
  closed = false
) =>
  pathOf(
    points.map(([x, z]) => iso([x, y, z], P)),
    closed
  );

const roundedFace = (
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  radius: number
): Plane[] => {
  const points: Plane[] = [];
  const arcs: readonly [number, number, number][] = [
    [u1 - radius, v1 - radius, 0],
    [u0 + radius, v1 - radius, 90],
    [u0 + radius, v0 + radius, 180],
    [u1 - radius, v0 + radius, 270],
  ];
  for (const [cu, cv, start] of arcs) {
    for (let step = 0; step <= 6; step += 1) {
      const angle = ((start + step * 15) * Math.PI) / 180;
      points.push([
        cu + radius * Math.cos(angle),
        cv + radius * Math.sin(angle),
      ]);
    }
  }
  return points;
};

const arcPoints = (
  cu: number,
  cv: number,
  radius: number,
  from: number,
  to: number,
  steps = 10
): Plane[] =>
  Array.from({ length: steps + 1 }, (_, step) => {
    const angle = ((from + ((to - from) * step) / steps) * Math.PI) / 180;
    return [cu + radius * Math.cos(angle), cv + radius * Math.sin(angle)];
  });

const byDepth = (points: readonly Plane[], P: Projection) =>
  points.toSorted(
    (a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P)
  );

const baseOf = (P: Projection) => {
  const z = -BASE_H;
  const feet = byDepth(corners(BASE, 16), P).map(([x, y]) => [
    cylinder(x, y, 7, z - FOOT_H, 1.6, P, 28),
    cylinder(x, y, 5.2, z - FOOT_H + 1.6, FOOT_H - 1.6, P, 28),
  ]);
  const screwPoints = corners(BASE, 9);
  const strip: Plan = { d: 7, r: 1, w: 94, x: -47, y: 41.5 };
  const stripTop = 0.6;
  const stripEdge = strip.y + strip.d;
  const minor: string[] = [];
  const major: string[] = [];
  for (let x = strip.x + 2.5; x <= strip.x + strip.w - 2.5; x += PITCH / 4) {
    const slot = Math.round((x - FIRST_X) / PITCH);
    const onSlot = Math.abs(x - cardX(slot)) < 0.2;
    (onSlot ? major : minor).push(
      segment(
        [x, stripEdge, stripTop],
        [x, stripEdge - (onSlot ? 3.8 : 2), stripTop],
        P
      )
    );
  }
  const label: Plan = { d: 30, r: 1, w: 16, x: 44, y: 100 };
  const labelTop = 0.8;
  const rule = (from: number, length: number) =>
    segment(
      [label.x + 4 + from, label.y + label.d - 5, labelTop],
      [label.x + 4 + from, label.y + label.d - 5 - length, labelTop],
      P
    );
  const rails = [-26, 20].map((y) => ({
    rail: slabOf({ d: 6, r: 1, w: 106, x: -46, y }, 0, 3, P, 3),
    stop: slabOf({ d: 9, r: 1, w: 3, x: 58, y: y - 1.5 }, 0, 6, P, 3),
    stopScrews: [iso([59.5, y + 1, 6], P), iso([59.5, y + 5, 6], P)],
  }));
  return {
    feet,
    groove: planOutline(insetPlan(BASE, 5), 0, P),
    halo: slabOf(insetPlan(BASE, -2), z - FOOT_H - 1, 1, P).fill,
    label: slabOf(label, 0, labelTop, P, 4),
    labelLine: planOutline(insetPlan(label, 1.6), labelTop, P),
    labelRule: join([rule(0, 20), rule(3.5, 14), rule(7, 17)]),
    labelScrews: [
      iso([label.x + label.w / 2, label.y + 2.4, labelTop], P),
      iso([label.x + label.w / 2, label.y + label.d - 2.4, labelTop], P),
    ],
    rails,
    screwRings: join(screwPoints.map(([x, y]) => ring(x, y, 2.2, 0, P, 18))),
    screws: screwPoints.map(([x, y]) => iso([x, y, 0], P)),
    seam: sideSeam(BASE, z + 3.5, P),
    slab: slabOf(BASE, z, BASE_H, P, 8, 1.4),
    strip: slabOf(strip, 0, stripTop, P, 3),
    stripStops: [strip.x - 2.2, strip.x + strip.w + 0.2].map((x) =>
      slabOf({ d: 9, r: 0.6, w: 2, x, y: strip.y - 1 }, 0, 1.8, P, 3)
    ),
    ticksMajor: join(major),
    ticksMinor: join(minor),
  };
};

const trayOf = (P: Projection) => {
  const floor: Plan = { d: 78, r: 2, w: 94, x: -47, y: -39 };
  const panel: Plan = { d: 84, r: 1.5, w: 5, x: 47, y: -42 };
  const face = panel.x + panel.w;
  const holder = { u0: -15, u1: 15, v0: 13, v1: 23 };
  const holderPlan: Plan = {
    d: holder.u1 - holder.u0,
    r: 0.3,
    w: 0.7,
    x: face,
    y: holder.u0,
  };
  const holderFace = face + 0.7;
  const follower: Plan = { d: 64, r: 1, w: 7, x: -44, y: -32 };
  const caps = [-47, 41].map((x) => ({ d: 4.6, r: 0.8, w: 6, x, y: 34.9 }));
  return {
    back: slabOf({ d: 78, r: 1, w: 3, x: -47, y: -39 }, FLOOR_TOP, 16, P, 3),
    capScrews: caps.map((cap) =>
      iso([cap.x + cap.w / 2, cap.y + cap.d / 2, WALL_TOP + 1.2], P)
    ),
    caps: caps.map((cap) => slabOf(cap, WALL_TOP, 1.2, P, 3, 0.3)),
    far: slabOf({ d: 3, r: 0.5, w: 91, x: -44, y: -39 }, FLOOR_TOP, 16, P, 3),
    floor: slabOf(floor, 3, 3, P, 4, 0.5),
    follower: slabOf(follower, FLOOR_TOP, 24, P, 3, 0.6),
    followerKnob: cylinder(-40.5, 0, 3.4, 30, 3.6, P, 28),
    followerKnurl: knurl(-40.5, 0, 3.4, [30, 33.6], 26, P),
    followerScrews: [iso([-40.5, -26, 30], P), iso([-40.5, 26, 30], P)],
    holder: slabOf(holderPlan, holder.v0, holder.v1 - holder.v0, P, 2),
    holderCard: onFaceX(
      holderFace,
      roundedFace(
        holder.u0 + 1.6,
        holder.v0 + 1.6,
        holder.u1 - 1.6,
        holder.v1 - 1.6,
        0.4
      ),
      P,
      true
    ),
    holderRivets: [
      iso([holderFace, holder.u0 + 0.9, (holder.v0 + holder.v1) / 2], P),
      iso([holderFace, holder.u1 - 0.9, (holder.v0 + holder.v1) / 2], P),
    ],
    holderRule: join([
      segment([holderFace, 9, 19.4], [holderFace, -9, 19.4], P),
      segment([holderFace, 5, 16.6], [holderFace, -5, 16.6], P),
    ]),
    near: slabOf({ d: 3, r: 0.5, w: 91, x: -44, y: 36 }, FLOOR_TOP, 16, P, 3),
    nearSeam: sideSeam({ d: 3, r: 0.5, w: 91, x: -44, y: 36 }, 14, P, 3),
    panel: slabOf(panel, 3, PANEL_TOP - 3, P, 3, 0.8),
    panelSeam: sideSeam(panel, 8, P, 3),
    pullBar: slabOf(
      { d: 28, r: 1.2, w: 2.6, x: face + 3, y: -14 },
      6.4,
      3,
      P,
      4,
      0.3
    ),
    pullPosts: [-12, 9].map((y) =>
      slabOf({ d: 3, r: 0.6, w: 3.2, x: face, y }, 6.8, 2.2, P, 3)
    ),
  };
};

const cardFace = (
  card: CatalogCard,
  catalog: Catalog,
  x: number,
  P: Projection
) => {
  const fx = x + CARD_T / 2;
  const bx = x - CARD_T / 2;
  const edge = CARD_HALF;
  const aroundEdge = (points: readonly Plane[]) => {
    const [first] = points;
    const last = points.at(-1);
    if (!(first && last)) {
      return "";
    }
    return pathOf([
      iso([bx, first[0], first[1]], P),
      ...points.map(([y, z]) => iso([fx, y, z], P)),
      iso([bx, last[0], last[1]], P),
    ]);
  };
  const holeY = edge - NOTCH_INSET;
  const notched: string[] = [];
  const holes: string[] = [];
  for (let index = 0; index < catalog.notches; index += 1) {
    const z = CARD_TOP - NOTCH_FIRST - index * NOTCH_PITCH;
    if (index < card.stars) {
      notched.push(
        aroundEdge([
          [edge, z + NOTCH_R],
          [holeY, z + NOTCH_R],
          ...arcPoints(holeY, z, NOTCH_R, 90, 270, 8).slice(1, -1),
          [holeY, z - NOTCH_R],
          [edge, z - NOTCH_R],
        ])
      );
    } else {
      holes.push(
        onFaceX(fx, arcPoints(holeY, z, NOTCH_R, 0, 360, 16), P, true)
      );
    }
  }
  const marginY = edge - 6.4;
  const typed = (z: number, share: number) =>
    onFaceX(
      fx,
      [
        [marginY - 2, z],
        [marginY - 2 - share * 46, z],
      ],
      P
    );
  return {
    holes: join(holes),
    margin: onFaceX(
      fx,
      [
        [marginY, CARD_TOP],
        [marginY, FLOOR_TOP],
      ],
      P
    ),
    nameRule: typed(CARD_TOP - 9.6, card.nameRule),
    notched: join(notched),
    rule: pathOf([
      iso([bx, edge, CARD_TOP - 3.6], P),
      iso([fx, edge, CARD_TOP - 3.6], P),
      iso([fx, -edge, CARD_TOP - 3.6], P),
    ]),
    typedRules: join(
      card.descriptionRules.map((share, index) =>
        typed(CARD_TOP - 14.2 - index * 3.8, share)
      )
    ),
  };
};

const cardOf = (
  card: CatalogCard,
  slot: number,
  catalog: Catalog,
  P: Projection
) => {
  const x = cardX(slot);
  const tabY = tabCenter(card.tab, catalog.languages.length);
  return {
    clip: card.isTemplate
      ? slabOf(
          { d: 4, r: 0.5, w: 2.4, x: x - 1.2, y: -CLIP_Y },
          CARD_TOP - 2.6,
          4.2,
          P,
          3
        )
      : null,
    face: cardFace(card, catalog, x, P),
    halo: slabOf(
      { d: CARD_HALF * 2, r: 1, w: 4, x: x - 2, y: -CARD_HALF },
      FLOOR_TOP,
      0.1,
      P
    ).fill,
    sheet: slabOf(
      { d: CARD_HALF * 2, r: 0.2, w: CARD_T, x: x - CARD_T / 2, y: -CARD_HALF },
      FLOOR_TOP,
      CARD_H,
      P,
      1
    ),
    tab: slabOf(
      { d: TAB_W, r: 0.2, w: CARD_T, x: x - CARD_T / 2, y: tabY - TAB_W / 2 },
      CARD_TOP,
      TAB_H,
      P,
      1
    ),
  };
};

const readerOf = (P: Projection) => {
  const plinth: Plan = insetPlan(READER, -2);
  const body = READER;
  const slot: Plan = { d: 72, r: 1.4, w: 3, x: SLOT_X - 1.5, y: SLOT_Y - 36 };
  const lips = [slot.x - 1.8, slot.x + slot.w + 0.2].map((x) =>
    slabOf(
      { d: slot.d + 2, r: 0.6, w: 1.6, x, y: slot.y - 1 },
      READER_TOP,
      1.2,
      P,
      3
    )
  );
  const front = body.x + body.w;
  const window = { u0: SLOT_Y - 8, u1: SLOT_Y + 8, v0: 11, v1: 21 };
  const digitAt = (index: number): Flat => [
    -(window.u1 - 4 - index * 8),
    -(window.v0 + 1.8),
  ];
  const ventFace = body.y + body.d;
  const vents = [8, 13, 18].map((z) =>
    onFaceY(
      ventFace,
      roundedFace(body.x + 8, z - 1, body.x + 30, z + 1, 1),
      P,
      true
    )
  );
  const topScrews = corners(body, 4.4).map(([x, y]) =>
    iso([x, y, READER_TOP], P)
  );
  const keyHousing: Plan = { d: 16, r: 2, w: 14, x: KEY[0] - 7, y: KEY[1] - 8 };
  return {
    body: slabOf(body, 3, READER_TOP - 3, P, 6, 1),
    bodySeam: sideSeam(body, READER_TOP - 6, P, 6),
    counter: {
      bezel: onFaceX(
        front,
        roundedFace(
          window.u0 - 1.6,
          window.v0 - 1.6,
          window.u1 + 1.6,
          window.v1 + 1.6,
          1.6
        ),
        P,
        true
      ),
      bezelScrews: [
        iso([front, window.u0 - 4, (window.v0 + window.v1) / 2], P),
        iso([front, window.u1 + 4, (window.v0 + window.v1) / 2], P),
      ],
      digits: [digitAt(0), digitAt(1)],
      matrix: (() => {
        const origin = iso([front, 0, 0], P);
        const across = iso([front, -1, 0], P);
        const down = iso([front, 0, -1], P);
        return `matrix(${fine(across[0] - origin[0])} ${fine(across[1] - origin[1])} ${fine(down[0] - origin[0])} ${fine(down[1] - origin[1])} 0 0)`;
      })(),
      origin: iso([front, 0, 0], P),
      split: segment([front, SLOT_Y, window.v0], [front, SLOT_Y, window.v1], P),
      well: onFaceX(
        front,
        roundedFace(window.u0, window.v0, window.u1, window.v1, 0.8),
        P,
        true
      ),
    },
    key: {
      cap: cylinder(KEY[0], KEY[1], 4.2, 37, 3.2, P, 32),
      capKnurl: knurl(KEY[0], KEY[1], 4.2, [37, 40.2], 30, P),
      capRing: ring(KEY[0], KEY[1], 2.4, 40.2, P, 24),
      guard: slabOf(keyHousing, READER_TOP, 3, P, 4, 0.5),
      guardScrews: [
        iso([keyHousing.x + 2, keyHousing.y + 2, READER_TOP + 3], P),
        iso(
          [
            keyHousing.x + keyHousing.w - 2,
            keyHousing.y + keyHousing.d - 2,
            READER_TOP + 3,
          ],
          P
        ),
      ],
      stem: cylinder(KEY[0], KEY[1], 2.6, READER_TOP + 3, 4, P, 24),
      stemSeam: sideArc(KEY[0], KEY[1], 2.6, READER_TOP + 5, P, 16),
    },
    lamp: {
      base: cylinder(LAMP[0], LAMP[1], 4.4, READER_TOP, 2.2, P, 32),
      lens: cylinder(LAMP[0], LAMP[1], 3, READER_TOP + 2.2, 3.6, P, 28),
      lensRing: ring(LAMP[0], LAMP[1], 1.6, READER_TOP + 5.8, P, 20),
    },
    lips,
    plinth: slabOf(plinth, 0, 3, P, 6, 0.5),
    slot: planOutline(slot, READER_TOP, P),
    slotWell: slabOf(slot, READER_TOP - 0.01, 0.01, P, 4).top,
    topScrews,
    vents: join(vents),
  };
};

export const catalogFigureOf = (catalog: Catalog) => {
  const P = fitOf(catalog);
  const axes = axesOf(P);
  const a = iso([SLOT_X, -400, READER_TOP], P);
  const b = iso([SLOT_X, 400, READER_TOP], P);
  const clip = pathOf([a, b, [b[0], b[1] - 2000], [a[0], a[1] - 2000]], true);
  const clearOfFrontCards =
    CARD_HALF * 2 - PITCH * Math.tan((AZIMUTH * Math.PI) / 180) + 2;
  const lastSlot = catalog.cards.length - 1;
  const routes = catalog.cards.map((_, slot): CardRoute => ({
    carry: CARRY_LIFT,
    clearsFrom: slot === lastSlot ? 0 : clearOfFrontCards,
    drop: SEAT_DROP,
    hover: HOVER_LIFT,
    shift: SLOT_X - cardX(slot),
    slide: SLOT_Y,
  }));
  const rig: CatalogRig = {
    assemblies: [
      { key: "tray", move: [0, 0, 46] },
      ...catalog.cards.map((_, slot): Assembly => ({
        key: `card-${slot}`,
        move: [0, 0, 74],
      })),
      { key: "reader", move: [0, 70, 0] },
    ],
    axes,
    clip,
    routes,
  };
  return {
    art: {
      base: baseOf(P),
      cards: catalog.cards.map((card, slot) => cardOf(card, slot, catalog, P)),
      reader: readerOf(P),
      tray: trayOf(P),
    },
    rig,
  };
};

export type CatalogArt = ReturnType<typeof catalogFigureOf>["art"];

export type CounterArt = CatalogArt["reader"]["counter"];
