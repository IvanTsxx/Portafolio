import type { AgentAction } from "@/lib/agents/roles";

import type { Frame, StageSpec } from "./scene-values";
import {
  box,
  checkPieces,
  framed,
  framedRig,
  panelLegs,
  popScale,
  progressBetween,
  scaleAll,
  slab,
} from "./scene-values";

const codeLines = [
  { indent: 0, width: 1.4 },
  { indent: 0.18, width: 1.05 },
  { indent: 0.18, width: 1.6 },
  { indent: 0.36, width: 0.85 },
  { indent: 0.36, width: 1.25 },
  { indent: 0.18, width: 1.15 },
  { indent: 0, width: 0.7 },
] as const;

const bugLine = 4;
const lineGap = 0.22;
const panelSize = [2.5, 1.95, 0.08] as const;
const panel: Frame = { at: [0.75, 1.25, 0], turn: -0.16 };
const lineTop = 0.6;
const lineLeft = -0.95;
const bugY = lineTop - bugLine * lineGap;
const bugCode = codeLines[bugLine];
const bugStartX = lineLeft + bugCode.indent + 0.05;
const bugTravel = bugCode.width - 0.12;
const actorAt = [-1.4, 0, 0.7] as const;
const actorHeight = 1.4;

const lineY = (index: number) => lineTop - index * lineGap;

const brokenLine = framedRig(panel, {
  at: [lineLeft + bugCode.indent + bugCode.width / 2, bugY, 0.05],
  pieces: [box("vermilion", [0, 0, 0], [bugCode.width, 0.075, 0.02])],
  tint: "ink",
});

const bug = framedRig(panel, {
  at: [0, 0, 0.08],
  pieces: [
    box("ink", [0, 0, 0], [0.12, 0.08, 0.06]),
    ...[-0.035, 0, 0.035].map((x) =>
      box("ink", [x, 0, 0], [0.012, 0.16, 0.012])
    ),
    box("ink", [0.075, 0.04, 0], [0.08, 0.012, 0.012], [0, 0, -0.6]),
  ],
});

const tick = framedRig(panel, {
  at: [lineLeft + bugCode.indent + bugCode.width + 0.3, bugY, 0.08],
  pieces: checkPieces(),
});

const alert = {
  at: [actorAt[0] + 0.1, actorHeight + 0.45, actorAt[2]] as const,
  pieces: [
    box("ink", [0, 0, 0], [0.09, 0.32, 0.09]),
    box("ink", [0, -0.27, 0], [0.09, 0.09, 0.09]),
  ],
};

const [lineRig, bugRig, tickRig, alertRig] = [0, 1, 2, 3] as const;

const actionAt = (time: number): AgentAction => {
  if (time > 3.4 && time < 4.6) {
    return "point";
  }
  if (time >= 4.6 && time < 6.4) {
    return "celebrate";
  }
  return "inspect";
};

export const debugStage: StageSpec = {
  actor: { at: actorAt, height: actorHeight, yaw: 0.55 },
  camera: { fitHeight: 2.7, fitWidth: 5.2, target: [-0.1, 0.92, 0] },
  keyTime: 5.4,
  loopSeconds: 8,
  play: (time, poses) => {
    const linePose = poses[lineRig];
    if (linePose) {
      linePose.tint =
        progressBetween(time, 4.4, 5) * (1 - progressBetween(time, 7.4, 7.9));
    }
    const bugPose = poses[bugRig];
    if (bugPose) {
      const caught = progressBetween(time, 4, 4.4);
      const respawn = progressBetween(time, 7.4, 7.9);
      bugPose.x = bugStartX + (Math.sin(time * 1.7) * 0.5 + 0.5) * bugTravel;
      bugPose.y = bugY + 0.07 + Math.sin(caught * Math.PI) * 0.14;
      bugPose.rz = Math.cos(time * 1.7) > 0 ? 0 : Math.PI;
      scaleAll(bugPose, time < 4.4 ? 1 - caught : respawn);
    }
    const tickPose = poses[tickRig];
    if (tickPose) {
      scaleAll(tickPose, popScale(time, 4.8, 7.3));
    }
    const alertPose = poses[alertRig];
    if (alertPose) {
      scaleAll(alertPose, popScale(time, 3.4, 4.5));
    }
    return actionAt(time);
  },
  rigs: [brokenLine, bug, tick, alert],
  shadows: [{ at: [0.75, 0.003, 0], scale: [1.7, 0.45] }],
  still: [
    ...framed(panel, [
      slab("paper", [0, 0, 0], panelSize),
      slab(
        "paperDeep",
        [0, panelSize[1] / 2 - 0.1, 0.045],
        [panelSize[0] - 0.08, 0.12, 0.02]
      ),
      ...codeLines.flatMap(({ indent, width }, index) => [
        box("rule", [lineLeft - 0.16, lineY(index), 0.05], [0.08, 0.06, 0.02]),
        ...(index === bugLine
          ? []
          : [
              box(
                index % 3 === 0 ? "ink" : "graphite",
                [lineLeft + indent + width / 2, lineY(index), 0.05],
                [width, 0.075, 0.02]
              ),
            ]),
      ]),
    ]),
    ...panelLegs(panel, panel.at[1], panelSize[1], 0.8),
  ],
};
