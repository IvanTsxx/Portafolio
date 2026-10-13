import {
  circleRing,
  extrude,
  iso,
  pathOf,
  ring,
  sideArc,
} from "@/components/iso/iso-kit";
import type { Flat } from "@/components/iso/iso-kit";

import type { Frame, LineKit, Part } from "./line-kit";
import {
  directionOf,
  dots,
  frameAt,
  kitFor,
  line,
  placeIn,
  solid,
} from "./line-kit";
import { STATION_COUNT } from "./line-model";
import {
  BASE_R,
  BASE_Z,
  BEARING_R,
  BOSS_TOP,
  CONSOLE_AT,
  directionDepth,
  FLOOR_Z,
  NEST_R,
  NEST_SIZE,
  NEST_TOP,
  P,
  PUCK_R,
  PUCK_TOP,
  REACH,
  RIM_RULE,
  STATION_R,
  stationDegrees,
  TABLE_R,
  TABLE_TOP,
  TABLE_Z,
  DIAL_FACE,
  NEEDLE_REST,
  needleAt,
  tableMarks,
  TOOL_DROPS,
} from "./line-view";

const REST_MARKS = tableMarks(0);

const K: LineKit = kitFor(P);
const join = (paths: readonly string[]) => paths.join("");
const CENTER: Frame = frameAt(P, 0, 0);

const extrudeRound = (
  x: number,
  y: number,
  radius: number,
  z: number,
  height: number
) => extrude(circleRing(x, y, radius, 28), z, height, P);

const baseSlots = () =>
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) =>
    K.outline(
      frameAt(P, index * 30, 0),
      { a0: 86, a1: 122, b0: -1.6, b1: 1.6, r: 1.6 },
      0,
      4
    )
  );

const labelPlate = (): Part[] => {
  const frame = frameAt(P, 0, 0);
  const plate = { a0: 106, a1: 121, b0: -24, b1: 24, r: 1.6 };
  const inset = { a0: 107.6, a1: 119.4, b0: -22.4, b1: 22.4, r: 0.8 };
  const rules = [109.6, 113.2, 116.8].map((a, row) =>
    pathOf([K.at(frame, a, -16, 0.8), K.at(frame, a, row === 1 ? 4 : 12, 0.8)])
  );
  return [
    solid(K.box(frame, plate, 0, 0.8, 0, 3), "lo", "none"),
    line(K.outline(frame, inset, 0.8, 3), "faint"),
    line(join(rules), "lo", true),
    dots([K.at(frame, 113.5, -20, 0.8), K.at(frame, 113.5, 20, 0.8)], 0.42),
  ];
};

const base = (): Part[] => {
  const feet = [0, 1, 2, 3, 4, 5]
    .map((index) => directionOf(P, 30 + index * 60))
    .toSorted((a, b) => directionDepth(a) - directionDepth(b));
  const screws = [0, 1, 2, 3, 4, 5].map((index): Flat => {
    const [x, y] = directionOf(P, index * 60);
    return [x * 124, y * 124];
  });
  return [
    {
      d: extrude(circleRing(0, 0, BASE_R, 96), FLOOR_Z, 5, P).fill,
      kind: "halo",
    },
    ...feet.flatMap(([x, y]): Part[] => [
      solid(extrudeRound(x * 125, y * 125, 7.4, FLOOR_Z, 1.6), "lo"),
      solid(
        extrudeRound(
          x * 125,
          y * 125,
          5.6,
          FLOOR_Z + 1.6,
          BASE_Z - FLOOR_Z - 1.6
        ),
        "mid"
      ),
    ]),
    solid(
      extrude(circleRing(0, 0, BASE_R, 120), BASE_Z, -BASE_Z, P, 1.4),
      "mid",
      "faint",
      sideArc(0, 0, BASE_R, -5, P, 64)
    ),
    line(ring(0, 0, BASE_R - 5, 0, P, 120), "faint"),
    line(join(baseSlots()), "faint"),
    line(join(screws.map(([x, y]) => ring(x, y, 2.2, 0, P, 16))), "lo"),
    dots(
      screws.map(([x, y]) => iso([x, y, 0], P)),
      0.5
    ),
    ...labelPlate(),
  ];
};

const table = (): Part[] => {
  const bearingDots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((index) => {
    const [x, y] = directionOf(P, index * 30 + 15);
    return iso([x * 78, y * 78, 5], P);
  });
  return [
    solid(extrude(circleRing(0, 0, BEARING_R, 96), 0, TABLE_Z, P, 0.6), "lo"),
    dots(bearingDots, 0.42),
    solid(
      extrude(
        circleRing(0, 0, TABLE_R, 96),
        TABLE_Z,
        TABLE_TOP - TABLE_Z,
        P,
        1
      ),
      "mid",
      "faint",
      sideArc(0, 0, TABLE_R, TABLE_Z + 3.5, P, 64)
    ),
    line(ring(0, 0, RIM_RULE, TABLE_TOP, P, 96), "lo"),
    line(ring(0, 0, NEST_R, TABLE_TOP, P, 96), "faint"),
    line(ring(0, 0, 24, TABLE_TOP, P, 64), "faint"),
    { d: REST_MARKS.minor, kind: "line", name: "ticks-minor", tone: "lo" },
    { d: REST_MARKS.major, kind: "line", name: "ticks-major", tone: "mid" },
    { d: REST_MARKS.notches, kind: "line", name: "notches", tone: "lo" },
    solid(
      K.roundBevel(CENTER, 0, 0, 16, TABLE_TOP, 6, 0.6),
      "mid",
      "faint",
      sideArc(0, 0, 16, TABLE_TOP + 3, P, 32)
    ),
    dots(
      [0, 1, 2, 3, 4, 5].map((index) => {
        const [x, y] = directionOf(P, index * 60 + 30);
        return iso([x * 13, y * 13, TABLE_TOP + 6], P);
      }),
      0.42
    ),
    solid(K.round(CENTER, 0, 0, 9, TABLE_TOP + 6, 3, 40), "mid"),
    line(K.ribs(CENTER, 0, 0, 9, [TABLE_TOP + 6, TABLE_TOP + 9], 40), "lo"),
    line(ring(0, 0, 4, TABLE_TOP + 9, P, 24), "faint"),
  ];
};

const puckFeatures = (frame: Frame): Part[][] => [
  [solid(K.round(frame, 0, 0, PUCK_R, NEST_TOP, 4, 40), "hi")],
  [line(K.hoop(frame, 0, 0, 6.2, PUCK_TOP, 36), "lo")],
  [line(K.hoop(frame, 0, 0, 4.6, PUCK_TOP, 32), "mid")],
  [solid(K.round(frame, 0, 0, 3, PUCK_TOP, 2, 28), "hi")],
  [
    line(K.hoop(frame, 0, 0, 1.6, BOSS_TOP, 20), "lo"),
    dots([K.at(frame, 0, 0, BOSS_TOP)], 0.5, "hi"),
  ],
  [line(K.band(frame, 0, 0, PUCK_R, NEST_TOP + 2, 32), "mid")],
];

const nest = (index: number): Part[] => {
  const degrees = stationDegrees(index);
  const frame = frameAt(P, degrees, NEST_R);
  return [
    solid(K.roundBevel(frame, 0, 0, NEST_SIZE, TABLE_TOP, 2.5, 0.5), "mid"),
    line(K.hoop(frame, 0, 0, 9.6, NEST_TOP, 40), "faint"),
    {
      kind: "group",
      name: "puck",
      parts: puckFeatures(frame).map((parts, feature) => ({
        kind: "group",
        name: "feature",
        parts,
        value: String(feature),
      })),
    },
  ];
};

export interface StationArt {
  body: readonly Part[];
  crown: readonly Part[];
  degrees: number;
  depth: number;
  drop: number;
  head: readonly Part[];
  isFront: boolean;
  tool: readonly Part[];
}

const footPlate = (frame: Frame, a0 = -14, a1 = 14): Part[] => {
  const plan = { a0, a1, b0: -15, b1: 15, r: 3 };
  return [
    solid(K.box(frame, plan, 0, 3, 0.6), "mid"),
    dots(
      [
        K.at(frame, a0 + 3.4, -11.6, 3),
        K.at(frame, a0 + 3.4, 11.6, 3),
        K.at(frame, a1 - 3.4, -11.6, 3),
        K.at(frame, a1 - 3.4, 11.6, 3),
      ],
      0.45
    ),
  ];
};

const column = (frame: Frame, top: number, half = 6): Part => {
  const plan = { a0: -half, a1: half, b0: -half, b1: half, r: 1.2 };
  return solid(
    K.box(frame, plan, 3, top - 3, 0.5),
    "mid",
    "faint",
    join([K.seam(frame, plan, 12), K.seam(frame, plan, top - 8)])
  );
};

const arm = (frame: Frame, a0: number, z: number, height = 6, half = 4.5) => {
  const plan = { a0, a1: 6, b0: -half, b1: half, r: 1.2 };
  return [
    solid(K.box(frame, plan, z, height, 0.5), "mid"),
    dots(
      [K.at(frame, 0, -2.2, z + height), K.at(frame, 0, 2.2, z + height)],
      0.42
    ),
  ];
};

const byDepth = <T>(items: readonly T[], depth: (item: T) => number) =>
  items.toSorted((a, b) => depth(a) - depth(b));

const orchestrate = (
  frame: Frame
): Omit<StationArt, "degrees" | "depth" | "drop" | "isFront"> => {
  const magazine = { a: 18, b: 0 };
  const posts: [number, number][] = [
    [magazine.a + 8.6, 0],
    [magazine.a - 4.3, 7.4],
    [magazine.a - 4.3, -7.4],
  ];
  const postDepth = ([a, b]: [number, number]) => {
    const [x, y] = placeIn(frame, a, b);
    return directionDepth([x, y]);
  };
  const centerDepth = postDepth([magazine.a, magazine.b]);
  const behind: [number, number][] = [];
  const inFront: [number, number][] = [];
  for (const post of byDepth(posts, postDepth)) {
    (postDepth(post) < centerDepth ? behind : inFront).push(post);
  }
  const postPart = ([a, b]: [number, number]) =>
    solid(K.round(frame, a, b, 1.1, 5, 21, 16), "mid", "none");
  const stack = [0, 1, 2, 3, 4].map((level) =>
    solid(
      K.round(frame, magazine.a, magazine.b, 6.4, 5 + level * 3.2, 3.2, 36),
      "hi"
    )
  );
  return {
    body: [
      ...footPlate(frame, -14, 30),
      column(frame, 70),
      solid(K.round(frame, magazine.a, magazine.b, 9, 3, 2, 40), "mid"),
      ...behind.map(postPart),
      ...stack,
      ...inFront.map(postPart),
      solid(
        K.roundBevel(frame, magazine.a, magazine.b, 10, 26, 1.6, 0.4),
        "mid"
      ),
      line(K.hoop(frame, magazine.a, magazine.b, 7.4, 27.6, 36), "faint"),
    ],
    crown: [],
    head: [
      ...arm(frame, -REACH - 6, 70),
      solid(
        K.box(
          frame,
          { a0: -REACH - 5, a1: -REACH + 5, b0: -6, b1: 6, r: 1.4 },
          76,
          8,
          0.5
        ),
        "mid",
        "faint",
        K.seam(
          frame,
          { a0: -REACH - 5, a1: -REACH + 5, b0: -6, b1: 6, r: 1.4 },
          80
        )
      ),
      dots(
        [
          K.at(frame, -REACH - 2.6, -3.6, 84),
          K.at(frame, -REACH + 2.6, 3.6, 84),
        ],
        0.42
      ),
    ],
    tool: [
      solid(K.round(frame, -REACH, 0, 1.6, 52, 18, 16), "mid", "none"),
      solid(
        K.box(
          frame,
          { a0: -REACH - 5, a1: -REACH + 5, b0: -9.6, b1: 9.6, r: 1 },
          46,
          6,
          0.4
        ),
        "mid"
      ),
      {
        kind: "group",
        name: "carried",
        parts: [solid(K.round(frame, -REACH, 0, PUCK_R, 37, 4, 40), "hi")],
      },
      ...[-1, 1].map((side) =>
        solid(
          K.box(
            frame,
            {
              a0: -REACH - 2.4,
              a1: -REACH + 2.4,
              b0: side * 8.4 - 0.8,
              b1: side * 8.4 + 0.8,
              r: 0.4,
            },
            38,
            8,
            0
          ),
          "mid",
          "none"
        )
      ),
    ],
  };
};

const research = (
  frame: Frame
): Omit<StationArt, "degrees" | "depth" | "drop" | "isFront"> => {
  const head = { a0: -REACH - 6, a1: -REACH + 6, b0: -6, b1: 6, r: 1.6 };
  return {
    body: [...footPlate(frame), column(frame, 80)],
    crown: [],
    head: [
      ...arm(frame, -REACH - 7, 80),
      solid(
        K.box(
          frame,
          { a0: -REACH - 5, a1: -REACH + 5, b0: -4.4, b1: 4.4, r: 1.2 },
          86,
          6,
          0.4
        ),
        "mid"
      ),
      line(K.hoop(frame, -REACH, 0, 2, 92, 20), "lo"),
    ],
    tool: [
      solid(K.round(frame, -REACH, 0, 1.6, 58, 22, 16), "mid", "none"),
      solid(
        K.box(frame, head, 46, 12, 0.5),
        "mid",
        "faint",
        K.seam(frame, head, 50)
      ),
      dots(
        [K.at(frame, -REACH - 3, -3, 58), K.at(frame, -REACH + 3, 3, 58)],
        0.4
      ),
      solid(
        K.round(frame, -REACH, 0, 4.2, 40, 6, 32),
        "mid",
        "faint",
        K.band(frame, -REACH, 0, 4.2, 43, 20)
      ),
      solid(K.roundBevel(frame, -REACH, 0, 6.6, 38, 2, 0.3, 40), "lo"),
    ],
  };
};

const design = (
  frame: Frame
): Omit<StationArt, "degrees" | "depth" | "drop" | "isFront"> => {
  const crown = { a0: -REACH - 10, a1: 7, b0: -7.5, b1: 7.5, r: 1.6 };
  const guide = { a0: -REACH - 8, a1: -REACH + 8, b0: -6.5, b1: 6.5, r: 1.2 };
  const sheet = { a0: -40, a1: -10, b0: -5, b1: 5, r: 0.8 };
  return {
    body: [...footPlate(frame), column(frame, 74, 7)],
    crown: [],
    head: [
      solid(
        K.box(frame, guide, 64, 10, 0.4),
        "mid",
        "faint",
        K.seam(frame, guide, 68)
      ),
      solid(
        K.box(frame, crown, 74, 10, 0.8),
        "mid",
        "faint",
        K.seam(frame, crown, 78)
      ),
      solid(K.box(frame, sheet, 84, 0.8, 0, 3), "lo", "none"),
      line(
        join(
          [-1.8, 0.2, 2.2].map((b, row) =>
            pathOf([
              K.at(frame, -36, b, 84.8),
              K.at(frame, row === 1 ? -22 : -15, b, 84.8),
            ])
          )
        ),
        "lo",
        true
      ),
      dots(
        [
          K.at(frame, 2, -4.4, 84),
          K.at(frame, 2, 4.4, 84),
          K.at(frame, -REACH - 6, -4.4, 84),
          K.at(frame, -REACH - 6, 4.4, 84),
        ],
        0.42
      ),
    ],
    tool: [
      solid(
        K.box(
          frame,
          { a0: -REACH - 4, a1: -REACH + 4, b0: -4, b1: 4, r: 0.8 },
          40,
          24,
          0.3
        ),
        "mid",
        "none"
      ),
      solid(
        K.roundBevel(frame, -REACH, 0, 9, 36, 4, 0.5, 48),
        "mid",
        "faint",
        K.band(frame, -REACH, 0, 9, 38, 28)
      ),
    ],
  };
};

const build = (
  frame: Frame
): Omit<StationArt, "degrees" | "depth" | "drop" | "isFront"> => {
  const housing = { a0: -REACH - 10, a1: -REACH + 10, b0: -8, b1: 8, r: 2 };
  return {
    body: [...footPlate(frame), column(frame, 90)],
    crown: [],
    head: [
      ...arm(frame, -REACH + 6, 78, 8, 5),
      solid(
        K.box(frame, housing, 64, 26, 0.6),
        "mid",
        "faint",
        join([K.seam(frame, housing, 70), K.seam(frame, housing, 84)])
      ),
      solid(
        K.round(frame, -REACH, 0, 7, 90, 10, 40),
        "mid",
        "faint",
        join([92, 94, 96, 98].map((z) => K.band(frame, -REACH, 0, 7, z, 24)))
      ),
      line(K.hoop(frame, -REACH, 0, 4.4, 100, 28), "faint"),
      dots(
        [0, 1, 2, 3].map((index) =>
          K.at(
            frame,
            -REACH + 5.6 * Math.cos(index * 1.5708 + 0.785),
            5.6 * Math.sin(index * 1.5708 + 0.785),
            100
          )
        ),
        0.4
      ),
    ],
    tool: [
      solid(
        K.round(frame, -REACH, 0, 3.4, 48, 16, 28),
        "mid",
        "faint",
        K.band(frame, -REACH, 0, 3.4, 56, 18)
      ),
      solid(K.round(frame, -REACH, 0, 4.8, 41, 7, 32), "mid"),
      line(K.ribs(frame, -REACH, 0, 4.8, [41, 48], 28), "lo"),
      solid(K.round(frame, -REACH, 0, 1.1, 32, 9, 12), "mid", "none"),
    ],
  };
};

const debug = (
  frame: Frame
): Omit<StationArt, "degrees" | "depth" | "drop" | "isFront"> => {
  const dial = { a: -REACH, b: 0 };
  const face = DIAL_FACE;
  const ticks = K.ticksOn(frame, dial.a, dial.b, 6.2, face, 40, 5, [0.9, 1.8]);
  const bar = { a0: -REACH - 2, a1: 10, b0: -2.2, b1: 2.2, r: 1 };
  return {
    body: [
      ...footPlate(frame),
      solid(
        K.round(frame, 6, 0, 3.2, 3, 31, 24),
        "mid",
        "faint",
        join([10, 22].map((z) => K.band(frame, 6, 0, 3.2, z, 18)))
      ),
      solid(K.round(frame, 6, 0, 4.6, 16, 4, 28), "mid"),
      line(K.ribs(frame, 6, 0, 4.6, [16, 20], 22), "lo"),
    ],
    crown: [],
    head: [
      solid(
        K.box(frame, bar, 34, 3.6, 0.3),
        "mid",
        "faint",
        K.seam(frame, bar, 35.8)
      ),
      solid(K.round(frame, 6, 0, 3, 37.6, 2.6, 24), "mid"),
      line(K.ribs(frame, 6, 0, 3, [37.6, 40.2], 18), "lo"),
      solid(
        K.roundBevel(frame, dial.a, dial.b, 7.6, 37.6, face - 37.6, 0.5, 56),
        "hi",
        "lo"
      ),
      line(K.hoop(frame, dial.a, dial.b, 6.4, face, 56), "lo"),
      line(ticks.minor, "lo"),
      line(ticks.major, "mid"),
      solid(K.round(frame, dial.a + 7.9, dial.b, 1.2, 39.4, 2.2, 14), "mid"),
      { d: needleAt(NEEDLE_REST), kind: "line", name: "needle", tone: "hi" },
      line(K.hoop(frame, dial.a, dial.b, 0.9, face, 14), "hi"),
    ],
    tool: [
      solid(K.round(frame, dial.a, dial.b, 1, 26, 8, 12), "mid", "none"),
      K.ballAt(frame, dial.a, dial.b, 24.6, 1.6),
    ],
  };
};

const review = (
  frame: Frame
): Omit<StationArt, "degrees" | "depth" | "drop" | "isFront"> => {
  const tray = { a0: -6, a1: 14, b0: -38, b1: -18, r: 2 };
  const done = { a: 4, b: -28 };
  const lever = { a0: -3.2, a1: -0.8, b0: 2, b1: 21, r: 1 };
  return {
    body: [
      ...footPlate(frame),
      solid(K.box(frame, tray, 0, 2.4, 0.4), "lo"),
      line(
        K.outline(
          frame,
          { a0: -4.4, a1: 12.4, b0: -36.4, b1: -19.6, r: 1.2 },
          2.4
        ),
        "faint"
      ),
      ...[0, 1, 2, 3].map((level) =>
        solid(
          K.round(frame, done.a, done.b, 6.4, 2.4 + level * 3, 3, 36),
          "mid",
          "faint",
          K.band(frame, done.a, done.b, 6.4, 3.9 + level * 3, 24)
        )
      ),
      solid(K.round(frame, done.a, done.b, 2.4, 14.4, 1.6, 24), "mid"),
      column(frame, 40, 4.6),
    ],
    crown: [
      solid(K.box(frame, lever, 46, 2.4, 0), "mid", "none"),
      K.ballAt(frame, -2, 23.4, 47.2, 3),
    ],
    head: [
      ...arm(frame, -REACH - 6, 40, 5, 5),
      solid(K.round(frame, -2, 0, 3.4, 45, 4, 24), "mid"),
      line(K.hoop(frame, -2, 0, 1.6, 49, 16), "faint"),
    ],
    tool: [
      solid(K.round(frame, -REACH, 0, 3, 34, 6, 24), "mid", "none"),
      solid(K.roundBevel(frame, -REACH, 0, 6.4, 30, 4, 0.4, 40), "mid"),
    ],
  };
};

const STATION_BUILDERS = [
  orchestrate,
  research,
  design,
  build,
  debug,
  review,
] as const;

export const STATIONS: readonly StationArt[] = STATION_BUILDERS.map(
  (builder, index) => {
    const degrees = stationDegrees(index);
    const frame = frameAt(P, degrees, STATION_R);
    const [x, y] = frame.o;
    const depth = directionDepth([x, y]);
    return {
      ...builder(frame),
      degrees,
      depth,
      drop: TOOL_DROPS[index] ?? 0,
      isFront: depth > STATION_R * 0.5,
    };
  }
);

const indexPin = () => {
  const frame = frameAt(P, 0, 0);
  const housing = { a0: 86, a1: 99, b0: -6, b1: 6, r: 1.6 };
  return {
    housing: [
      solid(
        K.box(frame, housing, 0, 12, 0.5),
        "mid",
        "faint",
        K.seam(frame, housing, 4)
      ),
      dots([K.at(frame, 89.4, -3.6, 12), K.at(frame, 95.6, 3.6, 12)], 0.42),
    ],
    pin: [
      solid(
        K.box(
          frame,
          { a0: TABLE_R + 0.4, a1: 86, b0: -1.8, b1: 1.8, r: 0.6 },
          7,
          3.4,
          0
        ),
        "hi",
        "none"
      ),
    ],
  };
};

export const INDEX_PIN = indexPin();

const consoleArt = () => {
  const frame = frameAt(P, CONSOLE_AT.degrees, CONSOLE_AT.radius);
  const box = { a0: -9, a1: 9, b0: -13, b1: 13, r: 2 };
  const cableFrom = K.at(frame, 0, -10, FLOOR_Z + 1.3);
  const [bx, by] = directionOf(P, 50);
  const cableTo = iso([bx * BASE_R, by * BASE_R, -6], P);
  const buttons = [-7, 0, 7];
  return {
    body: [
      solid(
        K.box(
          frame,
          { a0: -10, a1: 10, b0: -10, b1: 10, r: 2.4 },
          FLOOR_Z,
          2.6,
          0.5
        ),
        "lo"
      ),
      line(
        pathOf([
          cableFrom,
          [
            (cableFrom[0] + cableTo[0]) / 2,
            Math.max(cableFrom[1], cableTo[1]) + 3,
          ],
          cableTo,
        ]),
        "lo"
      ),
      dots([cableFrom, cableTo], 0.6, "hi"),
      dots(
        [K.at(frame, -7, -7, FLOOR_Z + 2.6), K.at(frame, 7, 7, FLOOR_Z + 2.6)],
        0.42
      ),
      solid(
        K.round(frame, 0, 0, 2.6, FLOOR_Z + 2.6, 4 - FLOOR_Z - 2.6, 20),
        "mid",
        "faint",
        K.band(frame, 0, 0, 2.6, -6, 16)
      ),
      solid(
        K.box(frame, box, 4, 14, 0.8),
        "mid",
        "faint",
        K.seam(frame, box, 8)
      ),
      line(
        K.outline(
          frame,
          { a0: -7.4, a1: 7.4, b0: -11.4, b1: 11.4, r: 1.2 },
          18
        ),
        "faint"
      ),
      line(
        join(
          buttons.map((b) =>
            pathOf([
              K.at(frame, 4.6, b - 2.4, 18),
              K.at(frame, 4.6, b + 2.4, 18),
            ])
          )
        ),
        "lo",
        true
      ),
    ],
    buttons: buttons.map((b) => ({
      at: b,
      parts: [
        solid(K.round(frame, -1.6, b, 2.4, 18, 1.6, 24), "mid"),
        line(K.hoop(frame, -1.6, b, 1.4, 19.6, 16), "faint"),
      ],
    })),
  };
};

export const CONSOLE = consoleArt();

export const BASE = base();
export const TABLE = table();
export const NESTS = Array.from({ length: STATION_COUNT }, (_, index) =>
  nest(index)
);
