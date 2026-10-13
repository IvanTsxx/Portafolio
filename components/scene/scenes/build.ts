import type { AgentAction } from "@/lib/agents/roles";

import type { Frame, Shade, StageSpec } from "./scene-values";
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

interface CardModule {
  at: number;
  height: number;
  shade: Shade;
  width: number;
  x: number;
  y: number;
}

const card: Frame = { at: [0.35, 1.3, 0], turn: -0.05 };
const cardSize = [1.55, 1.85, 0.08] as const;
const collapseStart = 7.3;

const modules = [
  { at: 0.5, height: 0.13, shade: "ink", width: 1.2, x: 0, y: 0.7 },
  { at: 1.25, height: 0.62, shade: "paperDeep", width: 1.2, x: 0, y: 0.22 },
  { at: 2, height: 0.06, shade: "graphite", width: 1.05, x: -0.075, y: -0.24 },
  {
    at: 2.6,
    height: 0.06,
    shade: "graphite",
    width: 0.75,
    x: -0.225,
    y: -0.36,
  },
  { at: 3.3, height: 0.16, shade: "ink", width: 0.46, x: -0.37, y: -0.66 },
  { at: 3.8, height: 0.16, shade: "rule", width: 0.46, x: 0.15, y: -0.66 },
] as const satisfies readonly CardModule[];

const moduleRigs = modules.map((module) =>
  framedRig(card, {
    at: [module.x, module.y, 0.06],
    pieces: [box(module.shade, [0, 0, 0], [1, 1, 1])],
  })
);

const tick = framedRig(card, { at: [0.62, 1.15, 0.1], pieces: checkPieces() });
const tickRig = modules.length;

const actionAt = (time: number): AgentAction =>
  time > 4.9 && time < 6.3 ? "celebrate" : "build";

export const buildStage: StageSpec = {
  actor: { at: [-1.5, 0, 0.55], height: 1.4, yaw: 0.4 },
  camera: { fitHeight: 2.8, fitWidth: 5.2, target: [-0.1, 0.92, 0] },
  keyTime: 5.6,
  loopSeconds: 8,
  play: (time, poses) => {
    for (const [index, module] of modules.entries()) {
      const pose = poses[index];
      if (!pose) {
        continue;
      }
      const arrive = progressBetween(time, module.at, module.at + 0.45);
      const stagger = (modules.length - index) * 0.06;
      const collapse = easeInOutCubic(
        progressBetween(
          time,
          collapseStart + stagger,
          collapseStart + 0.35 + stagger
        )
      );
      const scale = easeOutBack(arrive) * (1 - collapse);
      pose.y = (1 - easeOutBack(arrive)) * 0.6;
      pose.z = (1 - arrive) * 0.5;
      pose.sx = module.width * scale;
      pose.sy = module.height * scale;
      pose.sz = 0.03;
    }
    const tickPose = poses[tickRig];
    if (tickPose) {
      scaleAll(tickPose, popScale(time, 4.5, collapseStart) * 1.5);
    }
    return actionAt(time);
  },
  rigs: [...moduleRigs, tick],
  shadows: [{ at: [0.35, 0.003, 0], scale: [1.1, 0.35] }],
  still: [
    ...framed(card, [slab("paper", [0, 0, 0], cardSize)]),
    ...panelLegs(card, card.at[1], cardSize[1], 0.5),
  ],
};
