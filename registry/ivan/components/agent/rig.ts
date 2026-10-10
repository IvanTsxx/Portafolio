export const bodySize = { depth: 1, height: 1, radius: 0.13, width: 1.25 };

export const legSize = {
  depth: 0.2,
  height: 0.34,
  radius: 0.04,
  width: 0.16,
  z: 0.16,
};

export const legOffsets = [-0.5, -0.2, 0.2, 0.5] as const;

export const bodyBase = legSize.height - 0.03;

export const armSize = { depth: 0.38, height: 0.3, length: 0.34, radius: 0.07 };

export const shoulder = { x: bodySize.width / 2 - 0.05, y: 0.56, z: 0.04 };

export const handReach = armSize.length - 0.06;

export const eyeSize = { depth: 0.04, size: 0.13, spacing: 0.4, y: 0.75 };

export const anchorPositions = {
  face: [0, eyeSize.y, bodySize.depth / 2],
  head: [0, bodySize.height, 0],
  torso: [0, 0.32, bodySize.depth / 2],
} as const satisfies Record<string, readonly [number, number, number]>;

export const poseKeys = [
  "armLeftForward",
  "armLeftRaise",
  "armRightForward",
  "armRightRaise",
  "bodySquash",
  "bodyTiltX",
  "bodyTiltZ",
  "bodyYaw",
  "eyeOpen",
  "gazeX",
  "gazeY",
  "leg0",
  "leg1",
  "leg2",
  "leg3",
  "rootY",
] as const;

export type PoseKey = (typeof poseKeys)[number];

export type Pose = Record<PoseKey, number>;

export const restArmRaise = 0.16;

export const createPose = (): Pose => ({
  armLeftForward: 0,
  armLeftRaise: restArmRaise,
  armRightForward: 0,
  armRightRaise: restArmRaise,
  bodySquash: 1,
  bodyTiltX: 0,
  bodyTiltZ: 0,
  bodyYaw: 0,
  eyeOpen: 1,
  gazeX: 0,
  gazeY: 0,
  leg0: 0,
  leg1: 0,
  leg2: 0,
  leg3: 0,
  rootY: 0,
});

const neutralPose = createPose();

export const resetPose = (pose: Pose) => {
  for (const key of poseKeys) {
    pose[key] = neutralPose[key];
  }
};

export const blendPoses = (from: Pose, to: Pose, weight: number, out: Pose) => {
  for (const key of poseKeys) {
    out[key] = from[key] + (to[key] - from[key]) * weight;
  }
};
