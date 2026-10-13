import type { AgentAction } from "@/lib/agents/roles";

import type { Frame, Piece, StageSpec } from "./scene-values";
import {
  box,
  checkPieces,
  easeInOutCubic,
  easeOutBack,
  framed,
  framedRig,
  panelLegs,
  popScale,
  progressBetween,
  scaleAll,
  slab,
} from "./scene-values";

const resetAt = 7.4;
const clipboardY = 1.3;
const clipboardSize = [1.6, 1.95] as const;
const clipboard: Frame = { at: [-0.05, clipboardY, 0], turn: 0.04 };
const chartY = 1.45;
const chartSize = [0.8, 0.62, 0.06] as const;
const chart: Frame = { at: [1.35, chartY, 0.15], turn: -0.25 };
const chartOrigin = [0.02, -0.2, 0.04] as const;
const chartBars = [0.14, 0.22, 0.18, 0.32] as const;
const chartWidth = 0.56;
const chartGrowAt = 3.6;
const boxX = -0.5;
const mergedAt = 4.8;
const mergedY = -0.74;

const checkRows = [
  { at: 1, width: 0.82, y: 0.5 },
  { at: 1.8, width: 0.62, y: 0.18 },
  { at: 2.6, width: 0.74, y: -0.14 },
  { at: 3.4, width: 0.52, y: -0.46 },
] as const;

const scaled = (pieces: readonly Piece[], scale: number, at: Piece["at"]) =>
  pieces.map((piece) =>
    box(
      piece.shade,
      [
        at[0] + piece.at[0] * scale,
        at[1] + piece.at[1] * scale,
        at[2] + piece.at[2] * scale,
      ],
      [piece.size[0] * scale, piece.size[1] * scale, piece.size[2] * scale],
      piece.tilt
    )
  );

const ticks = checkRows.map((row) =>
  framedRig(clipboard, {
    at: [boxX + 0.02, row.y + 0.03, 0.075],
    pieces: scaled(checkPieces(), 0.55, [0, 0, 0]),
  })
);

const merged = framedRig(clipboard, {
  at: [0.32, mergedY, 0.1],
  pieces: [
    box("vermilion", [0, 0, 0], [0.62, 0.26, 0.04]),
    ...scaled(checkPieces("paper"), 0.4, [-0.19, 0.01, 0.03]),
    box("paper", [0.08, 0.03, 0.025], [0.28, 0.04, 0.01]),
    box("paper", [0.03, -0.05, 0.025], [0.18, 0.04, 0.01]),
  ],
});

const step = chartWidth / chartBars.length;
const tallest = Math.max(...chartBars);

const bars = framedRig(chart, {
  at: chartOrigin,
  pieces: chartBars.map((height, index) =>
    box(
      index === chartBars.length - 1 ? "vermilion" : "graphite",
      [-chartWidth / 2 + step * (index + 0.5), height / 2, 0],
      [step * 0.55, height, 0.015]
    )
  ),
});

const barsRig = checkRows.length;
const mergedRig = barsRig + 1;

const actionAt = (time: number): AgentAction => {
  if (time < 0.8) {
    return "inspect";
  }
  if (time > 5.4 && time < 6.5) {
    return "celebrate";
  }
  return "check";
};

export const reviewStage: StageSpec = {
  actor: { at: [-1.9, 0, 0.6], height: 1.4, yaw: 0.55 },
  camera: { fitHeight: 2.8, fitWidth: 5.8, target: [-0.2, 0.92, 0] },
  keyTime: 6.8,
  loopSeconds: 8,
  play: (time, poses) => {
    for (const [index, row] of checkRows.entries()) {
      const tick = poses[index];
      if (tick) {
        scaleAll(tick, popScale(time, row.at, resetAt));
      }
    }
    const barsPose = poses[barsRig];
    if (barsPose) {
      const grow = easeOutBack(
        progressBetween(time, chartGrowAt, chartGrowAt + 0.6)
      );
      const vanish = easeInOutCubic(
        progressBetween(time, resetAt, resetAt + 0.3)
      );
      barsPose.sy = grow * (1 - vanish);
    }
    const mergedPose = poses[mergedRig];
    if (mergedPose) {
      const rise = easeOutBack(progressBetween(time, mergedAt, mergedAt + 0.4));
      mergedPose.y = -(1 - rise) * 0.2;
      scaleAll(mergedPose, popScale(time, mergedAt, resetAt));
    }
    return actionAt(time);
  },
  rigs: [...ticks, bars, merged],
  shadows: [
    { at: [-0.05, 0.003, 0], scale: [1.1, 0.4] },
    { at: [1.35, 0.003, 0.15], scale: [0.5, 0.25] },
  ],
  still: [
    ...framed(clipboard, [
      slab("paperDeep", [0, 0, 0], [clipboardSize[0], clipboardSize[1], 0.06]),
      slab(
        "paper",
        [0, -0.04, 0.035],
        [clipboardSize[0] - 0.14, clipboardSize[1] - 0.2, 0.01],
        0.004
      ),
      slab(
        "ink",
        [0, clipboardSize[1] / 2 - 0.02, 0.05],
        [clipboardSize[0] * 0.34, 0.14, 0.05],
        0.02
      ),
      ...checkRows.flatMap((row) => [
        box("rule", [boxX, row.y, 0.045], [0.17, 0.17, 0.01]),
        box("paper", [boxX, row.y, 0.049], [0.13, 0.13, 0.01]),
        box(
          "graphite",
          [-0.3 + row.width / 2, row.y, 0.049],
          [row.width, 0.05, 0.01]
        ),
      ]),
    ]),
    ...panelLegs(clipboard, clipboardY, clipboardSize[1], 0.5),
    ...framed(chart, [
      slab("paper", [0, 0, 0], chartSize),
      box("ink", chartOrigin, [chartWidth + 0.08, 0.02, 0.015]),
      box(
        "ink",
        [
          chartOrigin[0] - chartWidth / 2 - 0.04,
          chartOrigin[1] + tallest / 2 + 0.04,
          chartOrigin[2],
        ],
        [0.02, tallest + 0.08, 0.015]
      ),
    ]),
    ...panelLegs(chart, chartY, chartSize[1], 0.26),
  ],
};
