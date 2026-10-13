import type { AgentAction } from "@/lib/agents/roles";

export const sceneColors = {
  graphite: "#5f5e5a",
  ink: "#1b1b1b",
  paper: "#f8f7f3",
  paperDeep: "#dddbd5",
  rule: "#c3c1ba",
  vermilion: "#e0472c",
} as const;

export type Shade = keyof typeof sceneColors;

export type Vec3 = readonly [number, number, number];

export interface Piece {
  at: Vec3;
  radius?: number;
  shade: Shade;
  size: Vec3;
  tilt?: Vec3;
}

export interface Rig {
  at: Vec3;
  pieces: readonly Piece[];
  tilt?: Vec3;
  tint?: Shade;
}

export interface RigPose {
  rx: number;
  ry: number;
  rz: number;
  sx: number;
  sy: number;
  sz: number;
  tint: number;
  x: number;
  y: number;
  z: number;
}

export interface Shadow {
  at: Vec3;
  scale: readonly [number, number];
}

export interface StageSpec {
  actor: { at: Vec3; height: number; yaw: number };
  camera: { fitHeight: number; fitWidth: number; target: Vec3 };
  keyTime: number;
  loopSeconds: number;
  play: (time: number, poses: readonly RigPose[]) => AgentAction;
  rigs: readonly Rig[];
  shadows: readonly Shadow[];
  still: readonly Piece[];
}

export const box = (shade: Shade, at: Vec3, size: Vec3, tilt?: Vec3): Piece =>
  tilt ? { at, shade, size, tilt } : { at, shade, size };

export const slab = (
  shade: Shade,
  at: Vec3,
  size: Vec3,
  radius = 0.035
): Piece => ({ at, radius, shade, size });

export interface Frame {
  at: Vec3;
  turn?: number;
}

export const inFrame = ({ at, turn = 0 }: Frame, local: Vec3): Vec3 => {
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  return [
    at[0] + local[0] * cos + local[2] * sin,
    at[1] + local[1],
    at[2] - local[0] * sin + local[2] * cos,
  ];
};

export const framed = (frame: Frame, pieces: readonly Piece[]): Piece[] =>
  pieces.map((piece) => {
    const turn = frame.turn ?? 0;
    const tilt = piece.tilt ?? [0, 0, 0];
    return {
      ...piece,
      at: inFrame(frame, piece.at),
      tilt: [tilt[0], tilt[1] + turn, tilt[2]],
    };
  });

export const framedRig = (frame: Frame, rig: Rig): Rig => {
  const turn = frame.turn ?? 0;
  const tilt = rig.tilt ?? [0, 0, 0];
  return {
    ...rig,
    at: inFrame(frame, rig.at),
    tilt: [tilt[0], tilt[1] + turn, tilt[2]],
  };
};

export const panelLegs = (
  frame: Frame,
  panelY: number,
  panelHeight: number,
  spread: number
): Piece[] => {
  const legHeight = panelY - panelHeight / 2 + 0.06;
  return framed(
    frame,
    [-spread, spread].map((x) =>
      box("ink", [x, -panelY + legHeight / 2, -0.02], [0.045, legHeight, 0.045])
    )
  );
};

export const checkPieces = (shade: Shade = "ink"): Piece[] => [
  box(shade, [-0.1, -0.05, 0], [0.06, 0.17, 0.06], [0, 0, Math.PI / 4]),
  box(shade, [0.075, 0.05, 0], [0.06, 0.42, 0.06], [0, 0, -0.69]),
];

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const progressBetween = (time: number, from: number, to: number) =>
  clamp01((time - from) / (to - from));

export const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

export const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

export const easeOutBack = (value: number) => {
  const overshoot = 1.7;
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
};

export const popScale = (time: number, appearAt: number, vanishAt: number) =>
  easeOutBack(progressBetween(time, appearAt, appearAt + 0.35)) *
  (1 - easeInOutCubic(progressBetween(time, vanishAt, vanishAt + 0.3)));

export const scaleAll = (pose: RigPose, value: number) => {
  pose.sx = value;
  pose.sy = value;
  pose.sz = value;
};
