import type { AgentAction } from "@/lib/agents/roles";

import type { Frame, Rig, StageSpec } from "./scene-values";
import {
  box,
  framed,
  framedRig,
  popScale,
  progressBetween,
  scaleAll,
  slab,
} from "./scene-values";

const screenWidth = 1.5;
const screenHeight = 0.92;
const rowGap = 0.11;
const scrollSpeed = 0.16;
const deskTop = 0.78;
const monitorY = deskTop + 0.72;
const resetAt = 7.4;
const matches = [1.7, 3.7, 5.7] as const;
const resultRows = [0.22, 0.02, -0.18] as const;

const indents = [0, 0.12, 0.24, 0.12, 0, 0.12, 0.24, 0.36, 0.12, 0] as const;
const widths = [0.8, 0.62, 0.95, 0.5, 0.72, 0.88, 0.42, 0.66, 0.78, 0.55];
const rows = indents.map((indent, index) => ({
  indent,
  width: widths[index] ?? 0.6,
}));
const span = rows.length * rowGap;

const desk: Frame = { at: [0.05, 0, -0.1] };
const screen: Frame = { at: [0.05, monitorY, -0.218] };
const results: Frame = { at: [1.95, 1.6, 0.1], turn: -0.32 };

const codeRows: Rig[] = rows.map((_, index) =>
  framedRig(screen, {
    at: [0, 0, 0],
    pieces: [
      box(
        index % 4 === 0 ? "ink" : "graphite",
        [0, 0, 0.012],
        [1, 0.045, 0.01]
      ),
    ],
  })
);

const sweep = framedRig(screen, {
  at: [0, 0, 0],
  pieces: [
    box("ink", [-screenWidth / 2 + 0.03, 0, 0.012], [0.03, 0.08, 0.012]),
    box("rule", [0, 0, 0.006], [screenWidth - 0.04, 0.085, 0.004]),
  ],
});

const resultRigs: Rig[] = resultRows.map((y) =>
  framedRig(results, {
    at: [0, y, 0.04],
    pieces: [
      box("ink", [-0.36, 0, 0], [0.1, 0.1, 0.015]),
      box("graphite", [0.08, 0, 0], [0.62, 0.05, 0.015]),
    ],
  })
);

const sweepRig = rows.length;
const firstResultRig = sweepRig + 1;

const actionAt = (time: number): AgentAction =>
  matches.some((at) => time > at && time < at + 0.6) ? "point" : "read";

export const researchStage: StageSpec = {
  actor: { at: [-1.55, 0, 0.5], height: 1.4, yaw: 0.85 },
  camera: { fitHeight: 2.8, fitWidth: 5.6, target: [0, 0.92, 0] },
  keyTime: 6.2,
  loopSeconds: 8,
  play: (time, poses) => {
    const offset = (time * scrollSpeed) % span;
    for (const [index, row] of rows.entries()) {
      const pose = poses[index];
      if (!pose) {
        continue;
      }
      const y = screenHeight / 2 - 0.08 - ((index * rowGap + offset) % span);
      const edge = Math.min(
        progressBetween(y, -screenHeight / 2 + 0.02, -screenHeight / 2 + 0.12),
        progressBetween(y, screenHeight / 2 - 0.02, screenHeight / 2 - 0.12)
      );
      pose.x = -screenWidth / 2 + 0.12 + row.indent + row.width / 2;
      pose.y = y;
      pose.sx = row.width * edge;
    }
    const sweepPose = poses[sweepRig];
    if (sweepPose) {
      sweepPose.y =
        screenHeight / 2 - 0.1 - ((time % 2) / 2) * (screenHeight - 0.2);
    }
    for (const [index, at] of matches.entries()) {
      const pose = poses[firstResultRig + index];
      if (pose) {
        scaleAll(pose, popScale(time, at + 0.15, resetAt));
      }
    }
    return actionAt(time);
  },
  rigs: [...codeRows, sweep, ...resultRigs],
  shadows: [{ at: [0.05, 0.003, -0.1], scale: [1.3, 0.6] }],
  still: [
    ...framed(desk, [
      slab("paperDeep", [0, deskTop, 0], [2.1, 0.08, 1.05]),
      ...[-0.95, 0.95].flatMap((x) =>
        [-0.42, 0.42].map((z) =>
          box("ink", [x, deskTop / 2, z], [0.05, deskTop, 0.05])
        )
      ),
      box("ink", [0, deskTop + 0.18, -0.18], [0.07, 0.32, 0.07]),
      slab("ink", [0, deskTop + 0.05, -0.18], [0.5, 0.03, 0.3]),
      slab(
        "ink",
        [0, monitorY, -0.16],
        [screenWidth + 0.12, screenHeight + 0.12, 0.08],
        0.04
      ),
      slab(
        "paper",
        [0, monitorY, -0.118],
        [screenWidth, screenHeight, 0.01],
        0.004
      ),
      slab("paper", [0.05, deskTop + 0.055, 0.22], [0.8, 0.03, 0.26]),
    ]),
    ...framed(results, [
      slab("paper", [0, 0, 0], [1.05, 1.05, 0.06]),
      box("ink", [-0.2, 0.4, 0.035], [0.5, 0.07, 0.015]),
    ]),
  ],
};
