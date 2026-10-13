import type { AgentAction } from "@/lib/agents/roles";

import type { Frame, Rig, StageSpec } from "./scene-values";
import {
  box,
  easeInOutCubic,
  easeOutCubic,
  framed,
  framedRig,
  panelLegs,
  popScale,
  progressBetween,
  scaleAll,
  slab,
} from "./scene-values";

const resetAt = 7.4;
const board: Frame = { at: [0.35, 1.3, 0], turn: -0.06 };
const boardSize = [2.3, 1.9, 0.08] as const;
const cardY = 0.55;
const cardHalf = 0.19;
const splitY = 0.26;
const laneBottom = -0.8;
const laneLength = splitY - laneBottom;
const chipTop = splitY - 0.14;
const chipBottom = laneBottom + 0.14;
const chipTravelSeconds = 1.4;
const blueprintAt = 3.4;
const stemLength = cardY - cardHalf - splitY;

const lanes = [
  { growAt: 1.3, startAt: 2, x: -0.6 },
  { growAt: 1.45, startAt: 2.55, x: 0 },
  { growAt: 1.6, startAt: 3.1, x: 0.6 },
] as const;

const card: Rig = {
  at: [0, cardY, 0.06],
  pieces: [
    box("rule", [0, 0, 0], [0.77, 0.41, 0.03]),
    box("paper", [0, 0, 0.012], [0.74, 0.38, 0.03]),
    box("vermilion", [-0.28, 0.09, 0.032], [0.05, 0.05, 0.015]),
    box("ink", [-0.13, 0.09, 0.032], [0.2, 0.045, 0.015]),
    box("graphite", [-0.03, -0.02, 0.032], [0.54, 0.035, 0.015]),
    box("rule", [-0.12, -0.1, 0.032], [0.36, 0.035, 0.015]),
  ],
};

const stem: Rig = {
  at: [0, cardY - cardHalf, 0.05],
  pieces: [
    box("graphite", [0, -stemLength / 2, 0], [0.025, stemLength, 0.015]),
  ],
};

const split: Rig = {
  at: [0, splitY, 0.05],
  pieces: [box("graphite", [0, 0, 0], [1.225, 0.025, 0.015])],
};

const laneLines: Rig[] = lanes.map((lane) => ({
  at: [lane.x, splitY, 0.05],
  pieces: [
    box("graphite", [0, -laneLength / 2, 0], [0.025, laneLength, 0.015]),
  ],
}));

const chips: Rig[] = lanes.map((lane) => ({
  at: [lane.x, chipTop, 0.08],
  pieces: [
    box("ink", [0, 0, 0], [0.24, 0.12, 0.03]),
    box("paper", [-0.04, 0, 0.016], [0.1, 0.025, 0.005]),
  ],
}));

const blueprint: Rig = {
  at: [0.84, 0.6, 0.07],
  pieces: [
    box("paperDeep", [0, 0, 0], [0.42, 0.32, 0.01]),
    ...[0.08, -0.02, -0.12].map((y) =>
      box("rule", [0, y, 0.008], [0.34, 0.012, 0.004])
    ),
    box("ink", [-0.06, -0.02, 0.01], [0.16, 0.16, 0.004]),
    box("paperDeep", [-0.06, -0.02, 0.012], [0.12, 0.12, 0.004]),
    box("vermilion", [0, 0.13, 0.02], [0.045, 0.045, 0.03]),
  ],
  tilt: [0, 0, -0.08],
};

const rigs = [card, stem, split, ...laneLines, ...chips, blueprint].map((rig) =>
  framedRig(board, rig)
);

const cardRig = 0;
const stemRig = 1;
const splitRig = 2;
const firstLaneRig = 3;
const firstChipRig = firstLaneRig + lanes.length;
const blueprintRig = firstChipRig + lanes.length;

const actionAt = (time: number): AgentAction => {
  if (time > 0.8 && time < 2.2) {
    return "point";
  }
  if (time > 4.8 && time < 6.2) {
    return "celebrate";
  }
  return "direct";
};

export const orchestrateStage: StageSpec = {
  actor: { at: [-1.75, 0, 0.6], height: 1.4, yaw: 0.55 },
  camera: { fitHeight: 2.8, fitWidth: 5.6, target: [-0.1, 0.92, 0] },
  keyTime: 6.8,
  loopSeconds: 8,
  play: (time, poses) => {
    const vanish = easeInOutCubic(
      progressBetween(time, resetAt, resetAt + 0.3)
    );
    const cardPose = poses[cardRig];
    if (cardPose) {
      scaleAll(cardPose, popScale(time, 0.2, resetAt));
    }
    const stemPose = poses[stemRig];
    if (stemPose) {
      stemPose.sy = easeOutCubic(progressBetween(time, 0.8, 1)) * (1 - vanish);
    }
    const splitPose = poses[splitRig];
    if (splitPose) {
      splitPose.sx =
        easeOutCubic(progressBetween(time, 0.95, 1.35)) * (1 - vanish);
    }
    for (const [index, lane] of lanes.entries()) {
      const line = poses[firstLaneRig + index];
      if (line) {
        line.sy =
          easeOutCubic(progressBetween(time, lane.growAt, lane.growAt + 0.5)) *
          (1 - vanish);
      }
      const chip = poses[firstChipRig + index];
      if (chip) {
        const travel = easeInOutCubic(
          progressBetween(time, lane.startAt, lane.startAt + chipTravelSeconds)
        );
        chip.y = (chipBottom - chipTop) * travel;
        scaleAll(chip, popScale(time, lane.startAt - 0.3, resetAt));
      }
    }
    const blueprintPose = poses[blueprintRig];
    if (blueprintPose) {
      const drop = easeOutCubic(
        progressBetween(time, blueprintAt, blueprintAt + 0.4)
      );
      blueprintPose.z = (1 - drop) * 0.4;
      scaleAll(blueprintPose, popScale(time, blueprintAt, resetAt));
    }
    return actionAt(time);
  },
  rigs,
  shadows: [{ at: [0.35, 0.003, 0], scale: [1.6, 0.45] }],
  still: [
    ...framed(board, [
      slab("paper", [0, 0, 0], boardSize),
      slab(
        "paperDeep",
        [0, boardSize[1] / 2 - 0.1, boardSize[2] / 2 + 0.005],
        [boardSize[0] - 0.08, 0.12, 0.02]
      ),
      ...lanes.map((lane) =>
        slab(
          "paperDeep",
          [lane.x, laneBottom + 0.02, 0.055],
          [0.34, 0.16, 0.02]
        )
      ),
    ]),
    ...panelLegs(board, board.at[1], boardSize[1], 0.8),
  ],
};
