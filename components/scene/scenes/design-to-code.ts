import type { AgentAction } from "@/lib/agents/roles";

import type { Frame, Piece, Shade, StageSpec, Vec3 } from "./scene-values";
import {
  box,
  easeInOutCubic,
  framed,
  framedRig,
  inFrame,
  panelLegs,
  popScale,
  progressBetween,
  scaleAll,
  slab,
} from "./scene-values";

interface LayoutBlock {
  height: number;
  shade: Shade;
  width: number;
  x: number;
  y: number;
}

const panelY = 1.3;
const panelSize = [1.7, 1.7, 0.08] as const;
const design: Frame = { at: [-1.75, panelY, 0], turn: 0.3 };
const browser: Frame = { at: [1.75, panelY, 0], turn: -0.3 };
const layoutScale = 0.95;
const layoutOrigin = [0.2, -0.05, 0.045] as const;
const browserOrigin = [0, -0.12, 0.045] as const;
const flightSeconds = 1.5;
const flightGap = 2.2;
const flightArc = 1.1;
const textAt = 6.6;
const resetAt = 7.55;

const carried = [
  { height: 0.14, shade: "ink", width: 1.1, x: 0, y: 0.5 },
  { height: 0.46, shade: "paperDeep", width: 1.1, x: 0, y: 0.12 },
  { height: 0.14, shade: "ink", width: 0.42, x: -0.34, y: -0.5 },
] as const satisfies readonly LayoutBlock[];

const textLines = [
  { width: 0.92, y: -0.2 },
  { width: 0.62, y: -0.31 },
] as const;

const inLayout = (origin: Vec3, scale: number, piece: Piece): Piece => ({
  ...piece,
  at: [
    origin[0] + piece.at[0] * scale,
    origin[1] + piece.at[1] * scale,
    origin[2] + piece.at[2] * scale,
  ],
  size: [piece.size[0] * scale, piece.size[1] * scale, piece.size[2]],
});

const layoutFrame = (): Piece[] => [
  ...[0.66, -0.66].map((y) => box("rule", [0, y, 0], [1.28, 0.012, 0.01])),
  ...[0.64, -0.64].map((x) => box("rule", [x, 0, 0], [0.012, 1.32, 0.01])),
];

const textPieces = (): Piece[] =>
  textLines.map(({ width, y }) =>
    box("graphite", [-0.55 + width / 2, y, 0.01], [width, 0.05, 0.015])
  );

const sources = carried.map((block) =>
  inFrame(design, [
    layoutOrigin[0] + block.x * layoutScale,
    layoutOrigin[1] + block.y * layoutScale,
    layoutOrigin[2] + 0.045,
  ])
);

const targets = carried.map((block) =>
  inFrame(browser, [
    browserOrigin[0] + block.x,
    browserOrigin[1] + block.y,
    browserOrigin[2] + 0.03,
  ])
);

const flyingRigs = carried.map((block) => ({
  at: [0, 0, 0] as const,
  pieces: [box(block.shade, [0, 0, 0], [1, 1, 1])],
}));

const browserText = framedRig(browser, {
  at: browserOrigin,
  pieces: textPieces(),
});

const textRig = carried.length;

const flightOf = (index: number, time: number) =>
  progressBetween(
    time,
    index * flightGap + 0.2,
    index * flightGap + 0.2 + flightSeconds
  );

const actionAt = (time: number): AgentAction => {
  if (time > textAt + 0.1 && time < resetAt) {
    return "celebrate";
  }
  const isFlying = carried.some((_, index) => {
    const flight = flightOf(index, time);
    return flight > 0 && flight < 1;
  });
  return isFlying ? "point" : "inspect";
};

export const designToCodeStage: StageSpec = {
  actor: { at: [0, 0, 0.95], height: 1.4, yaw: 0.2 },
  camera: { fitHeight: 2.8, fitWidth: 5.9, target: [0, 0.92, 0] },
  keyTime: 6.9,
  loopSeconds: 8,
  play: (time, poses) => {
    const reset = progressBetween(time, resetAt, resetAt + 0.4);
    for (const [index, block] of carried.entries()) {
      const pose = poses[index];
      const from = sources[index];
      const to = targets[index];
      if (!(pose && from && to)) {
        continue;
      }
      const flight = flightOf(index, time);
      const share = easeInOutCubic(flight);
      const grow = flight > 0 ? 1 - reset : 0;
      pose.x = from[0] + (to[0] - from[0]) * share;
      pose.y =
        from[1] +
        (to[1] - from[1]) * share +
        Math.sin(share * Math.PI) * flightArc;
      pose.z = from[2] + (to[2] - from[2]) * share;
      pose.ry = 0.3 - 0.6 * share;
      pose.sx = block.width * (layoutScale + (1 - layoutScale) * share) * grow;
      pose.sy = block.height * (layoutScale + (1 - layoutScale) * share) * grow;
      pose.sz = 0.03 * grow;
    }
    const text = poses[textRig];
    if (text) {
      scaleAll(text, popScale(time, textAt, resetAt));
    }
    return actionAt(time);
  },
  rigs: [...flyingRigs, browserText],
  shadows: [
    { at: [-1.75, 0.003, 0], scale: [1.2, 0.4] },
    { at: [1.75, 0.003, 0], scale: [1.2, 0.4] },
  ],
  still: [
    ...framed(design, [
      slab("paper", [0, 0, 0], panelSize),
      ...[0.55, 0.42, 0.29, 0.16].map((y, index) =>
        box(
          index === 0 ? "ink" : "rule",
          [-0.72, y, 0.045],
          [0.26, 0.06, 0.015]
        )
      ),
      ...[
        ...layoutFrame(),
        ...textPieces(),
        ...carried.map((block) =>
          box(
            block.shade,
            [block.x, block.y, 0.015],
            [block.width, block.height, 0.03]
          )
        ),
      ].map((piece) => inLayout(layoutOrigin, layoutScale, piece)),
    ]),
    ...panelLegs(design, panelY, panelSize[1], 0.6),
    ...framed(browser, [
      slab("paper", [0, 0, 0], panelSize),
      slab(
        "paperDeep",
        [0, panelSize[1] / 2 - 0.1, 0.045],
        [panelSize[0] - 0.08, 0.14, 0.02]
      ),
      ...[-0.7, -0.6, -0.5].map((x) =>
        box("ink", [x, panelSize[1] / 2 - 0.1, 0.06], [0.05, 0.05, 0.02])
      ),
      ...layoutFrame().map((piece) => inLayout(browserOrigin, 1, piece)),
    ]),
    ...panelLegs(browser, panelY, panelSize[1], 0.6),
  ],
};
