import type { AgentAction } from "@/lib/agents/roles";

import type { Frame, Rig, Shade, StageSpec } from "./scene-values";
import { box, framed, framedRig, panelLegs, slab } from "./scene-values";

const plateY = 1.3;
const plateSize = [2.3, 1.7, 0.08] as const;
const plate: Frame = { at: [0.35, plateY, 0], turn: -0.12 };
const swatch: Frame = { at: [2.05, 0.95, 0.25], turn: -0.4 };
const swatchSize = [0.5, 0.9, 0.05] as const;
const columns = 15;
const rows = 9;
const pitch = 0.13;
const dotSize = 0.085;
const gridTop = 0.48;
const levels = 3;

const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;

const dots = Array.from({ length: columns * rows }, (_, index) => {
  const column = index % columns;
  const row = Math.floor(index / columns);
  return {
    threshold: (bayer[(column % 4) + (row % 4) * 4] ?? 0) / 16,
    x: (column - (columns - 1) / 2) * pitch,
    y: gridTop - row * pitch,
  };
});

const dotRigs: Rig[] = dots.map((dot) =>
  framedRig(plate, {
    at: [dot.x, dot.y - 0.1, 0.05],
    pieces: [box("ink", [0, 0, 0], [dotSize, dotSize, 0.02])],
  })
);

const ramp: readonly Shade[] = [
  "paper",
  "paperDeep",
  "rule",
  "graphite",
  "ink",
];

const actionAt = (time: number): AgentAction => {
  if (time >= 2 && time < 3) {
    return "point";
  }
  if (time >= 3 && time < 5.2) {
    return "measure";
  }
  if (time >= 5.2 && time < 6.4) {
    return "celebrate";
  }
  return "inspect";
};

export const exploreStage: StageSpec = {
  actor: { at: [-1.75, 0, 0.6], height: 1.4, yaw: 0.5 },
  camera: { fitHeight: 2.8, fitWidth: 5.9, target: [0.1, 0.92, 0] },
  keyTime: 4,
  loopSeconds: 8,
  play: (time, poses) => {
    const phase = (time / 8) * Math.PI * 2;
    const centerX = Math.cos(phase) * 0.6;
    const centerY = 0.1 + Math.sin(phase * 2) * 0.25;
    for (const [index, dot] of dots.entries()) {
      const pose = poses[index];
      if (!pose) {
        continue;
      }
      const distance = Math.hypot(dot.x - centerX, dot.y - centerY);
      const value = 0.5 + 0.5 * Math.cos(distance * 9 - time * 3);
      const level = Math.min(
        levels,
        Math.floor(value * levels + dot.threshold)
      );
      const size = 0.15 + (level / levels) * 0.85;
      pose.sx = size;
      pose.sy = size;
    }
    return actionAt(time);
  },
  rigs: dotRigs,
  shadows: [
    { at: [0.35, 0.003, 0], scale: [1.6, 0.45] },
    { at: [2.05, 0.003, 0.25], scale: [0.4, 0.2] },
  ],
  still: [
    ...framed(plate, [
      slab("paper", [0, 0, 0], plateSize),
      slab(
        "paperDeep",
        [0, plateSize[1] / 2 - 0.1, plateSize[2] / 2 + 0.005],
        [plateSize[0] - 0.08, 0.12, 0.02]
      ),
      ...[-0.95, -0.85, -0.75].map((x) =>
        box("ink", [x, plateSize[1] / 2 - 0.1, 0.06], [0.05, 0.05, 0.02])
      ),
    ]),
    ...panelLegs(plate, plateY, plateSize[1], 0.8),
    ...framed(swatch, [
      slab("paper", [0, 0, 0], swatchSize),
      ...ramp.map((shade, index) =>
        box(
          shade,
          [0, 0.32 - index * 0.16, 0.03],
          [swatchSize[0] - 0.1, 0.14, 0.01]
        )
      ),
    ]),
    ...panelLegs(swatch, swatch.at[1], swatchSize[1], 0.16),
  ],
};
