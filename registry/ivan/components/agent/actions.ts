import type { Pose } from "./rig";
import { resetPose, restArmRaise } from "./rig";
import type { AgentAction, AgentReaction } from "./types";

interface ActionClip {
  keyTime: number;
  pose: (time: number, out: Pose) => void;
}

const tau = Math.PI * 2;

const breathe = (time: number, out: Pose, rate = 0.32) => {
  const cycle = Math.sin(time * tau * rate);
  out.bodySquash = 1 + cycle * 0.014;
  out.armLeftRaise += cycle * 0.03;
  out.armRightRaise += cycle * 0.03;
};

const stride = (time: number, out: Pose, speed: number, swing: number) => {
  const phase = time * speed;
  const step = Math.sin(phase);
  out.leg0 = step * swing;
  out.leg1 = -step * swing;
  out.leg2 = step * swing;
  out.leg3 = -step * swing;
  out.rootY = Math.abs(Math.cos(phase)) * 0.035;
  out.bodyTiltZ = step * 0.03;
};

const measureCycle = 2.6;

export const measureExtension = (time: number) => {
  const phase = (time % measureCycle) / measureCycle;
  if (phase < 0.45) {
    const local = phase / 0.45;
    return 1 - (1 - local) ** 3;
  }
  if (phase < 0.7) {
    return 1;
  }
  const local = (phase - 0.7) / 0.3;
  return 1 - local * local;
};

const checkCycle = 1.8;

export const checkStroke = (time: number) => {
  const phase = (time % checkCycle) / checkCycle;
  return phase > 0.55 && phase < 0.8
    ? Math.sin(((phase - 0.55) / 0.25) * Math.PI)
    : 0;
};

const buildCycle = 0.9;

export const buildStrike = (time: number) => {
  const phase = (time % buildCycle) / buildCycle;
  if (phase < 0.6) {
    const local = phase / 0.6;
    return 1 - (1 - local) ** 2;
  }
  const local = (phase - 0.6) / 0.4;
  return 1 - local ** 3;
};

export const actionClips = {
  build: {
    keyTime: 0.5,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out, 0.3);
      const raise = buildStrike(time);
      const impact = 1 - Math.min(1, raise * 4);
      out.armRightRaise = 0.1 + raise * 1.15;
      out.armRightForward = 0.95 - raise * 0.35;
      out.armLeftForward = 1.1;
      out.armLeftRaise = 0.04;
      out.bodyTiltX = 0.1 + impact * 0.04;
      out.bodyYaw = -0.08;
      out.bodySquash += impact * 0.02;
      out.rootY = -impact * 0.015;
      out.gazeX = -0.015;
      out.gazeY = -0.035;
    },
  },
  carry: {
    keyTime: 0.4,
    pose: (time, out) => {
      resetPose(out);
      stride(time, out, 7.5, 0.38);
      out.armLeftForward = 1.25;
      out.armRightForward = 1.25;
      out.armLeftRaise = 0.32;
      out.armRightRaise = 0.32;
      out.bodyTiltX = -0.06;
      out.gazeY = 0.01;
    },
  },
  celebrate: {
    keyTime: 0,
    pose: (time, out) => {
      resetPose(out);
      const bounce = Math.sin(time * 6.4);
      const airborne = Math.max(0, bounce);
      out.rootY = airborne * 0.24;
      out.bodySquash = 1 + (bounce < 0 ? bounce * 0.07 : airborne * 0.04);
      out.armLeftRaise = 1.1 + Math.sin(time * 12.8) * 0.2;
      out.armRightRaise = 1.1 + Math.sin(time * 12.8 + Math.PI) * 0.2;
      out.armLeftForward = 0.35;
      out.armRightForward = 0.35;
      out.leg0 = airborne * 0.25;
      out.leg3 = -airborne * 0.25;
      out.gazeY = 0.02;
    },
  },
  check: {
    keyTime: 1.25,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out, 0.26);
      const stroke = checkStroke(time);
      const glance = Math.sin(time * 0.9);
      out.armLeftForward = 1.18;
      out.armLeftRaise = 0.3;
      out.armRightForward = 1.05 + stroke * 0.12;
      out.armRightRaise = 0.12 - stroke * 0.18;
      out.bodyTiltX = 0.08 + stroke * 0.03;
      out.bodyYaw = -0.12;
      out.gazeX = -0.02 + glance * 0.012;
      out.gazeY = -0.03 + Math.max(0, glance) * 0.02;
    },
  },
  direct: {
    keyTime: 0.5,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out);
      const sweep = Math.sin(time * 2.4);
      out.armRightRaise = 0.65 + Math.sin(time * 4.8) * 0.18;
      out.armRightForward = 0.55 + sweep * 0.45;
      out.armLeftForward = 0.55;
      out.armLeftRaise = 0.22;
      out.bodyYaw = sweep * 0.16;
      out.bodyTiltZ = -0.03 + sweep * 0.025;
      out.gazeX = sweep * 0.03;
    },
  },
  idle: {
    keyTime: 0,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out);
      out.bodyTiltZ = Math.sin(time * 0.7) * 0.012;
      out.gazeX = Math.sin(time * 0.45) * 0.02;
    },
  },
  inspect: {
    keyTime: 1.2,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out, 0.24);
      const scan = Math.sin(time * 1.1);
      out.bodyTiltX = 0.1;
      out.bodyYaw = scan * 0.22;
      out.armRightForward = 0.85;
      out.armRightRaise = -0.12 + Math.sin(time * 2.2) * 0.05;
      out.armLeftRaise = restArmRaise - 0.08;
      out.gazeX = scan * 0.03;
      out.gazeY = -0.025;
    },
  },
  measure: {
    keyTime: 1.2,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out, 0.3);
      const extension = measureExtension(time);
      out.armRightForward = 1.05;
      out.armRightRaise = 0.05;
      out.armLeftForward = 1.2 - extension * 0.75;
      out.armLeftRaise = 0.05 + extension * 0.12;
      out.bodyYaw = -0.1 + extension * 0.18;
      out.bodyTiltX = 0.06;
      out.bodyTiltZ = extension * 0.04;
      out.gazeX = -0.02 - extension * 0.02;
      out.gazeY = -0.02;
    },
  },
  point: {
    keyTime: 0.7,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out);
      const jab = Math.max(0, Math.sin(time * 3.2)) ** 3;
      out.armRightRaise = 0.42 + jab * 0.08;
      out.armRightForward = 0.62 - jab * 0.08;
      out.bodyYaw = 0.2;
      out.bodyTiltZ = -0.04;
      out.bodyTiltX = 0.03 + jab * 0.02;
      out.gazeX = 0.035;
      out.gazeY = 0.01;
    },
  },
  read: {
    keyTime: 0.9,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out, 0.22);
      out.armLeftForward = 1.2;
      out.armRightForward = 1.2;
      out.armLeftRaise = 0.02;
      out.armRightRaise = 0.02;
      out.bodyTiltX = 0.09 + Math.sin(time * 0.9) * 0.015;
      out.gazeX = ((time * 0.55) % 1) * 0.06 - 0.03;
      out.gazeY = -0.03;
    },
  },
  type: {
    keyTime: 0.15,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out, 0.28);
      out.armLeftForward = 1.12;
      out.armRightForward = 1.12;
      out.armLeftRaise = -0.08 + Math.max(0, Math.sin(time * 19)) * 0.1;
      out.armRightRaise = -0.08 + Math.max(0, Math.sin(time * 19 + 2.1)) * 0.1;
      out.bodyTiltX = 0.07;
      out.bodySquash += Math.sin(time * 9.5) * 0.004;
      out.gazeY = -0.03;
      out.gazeX = Math.sin(time * 1.3) * 0.015;
    },
  },
  walk: {
    keyTime: 0.2,
    pose: (time, out) => {
      resetPose(out);
      stride(time, out, 9, 0.5);
      const swing = Math.sin(time * 9);
      out.armLeftForward = swing * 0.35;
      out.armRightForward = -swing * 0.35;
      out.bodyTiltX = 0.05;
    },
  },
  wave: {
    keyTime: 0.3,
    pose: (time, out) => {
      resetPose(out);
      breathe(time, out);
      out.armRightRaise = 1.05 + Math.sin(time * 9) * 0.3;
      out.armRightForward = 0.4;
      out.bodyTiltZ = 0.05 + Math.sin(time * 9) * 0.01;
      out.bodyYaw = 0.05;
      out.gazeY = 0.015;
    },
  },
} as const satisfies Record<AgentAction, ActionClip>;

export interface ReactionLook {
  x: number;
  y: number;
}

interface ReactionClip {
  duration: number;
  keyTime: number;
  pose: (time: number, out: Pose, look: ReactionLook) => void;
}

const window01 = (time: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (time - from) / (to - from)));

const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

const wrapAngle = (angle: number) =>
  ((((angle + Math.PI) % tau) + tau) % tau) - Math.PI;

const blinkAt = (time: number, at: number) => {
  const local = (time - at) / 0.12;
  return local > 0 && local < 1 ? 1 - Math.sin(local * Math.PI) * 0.92 : 1;
};

export const reactionClips = {
  jump: {
    duration: 1.05,
    keyTime: 0.45,
    pose: (time, out) => {
      resetPose(out);
      const crouch = Math.sin(window01(time, 0, 0.22) * Math.PI);
      const air = window01(time, 0.2, 0.72);
      const land = Math.sin(window01(time, 0.72, 1) * Math.PI);
      const lift = Math.sin(air * Math.PI);
      out.rootY = lift * 0.6;
      out.bodySquash = 1 - crouch * 0.12 - land * 0.1 + lift * 0.05;
      out.armLeftRaise = restArmRaise + (lift + crouch * 0.2) * 1.25;
      out.armRightRaise = restArmRaise + (lift + crouch * 0.2) * 1.25;
      out.armLeftForward = lift * 0.3;
      out.armRightForward = lift * 0.3;
      out.leg0 = lift * 0.35;
      out.leg1 = -lift * 0.35;
      out.leg2 = lift * 0.35;
      out.leg3 = -lift * 0.35;
      out.gazeY = 0.02 * lift;
    },
  },
  look: {
    duration: 1.7,
    keyTime: 0.4,
    pose: (time, out, look) => {
      resetPose(out);
      breathe(time, out);
      const turn = easeInOut(window01(time, 0, 0.3));
      out.bodyYaw = look.x * 0.55 * turn;
      out.bodyTiltX = -look.y * 0.12 * turn;
      out.bodyTiltZ = -look.x * 0.04 * turn;
      out.gazeX = look.x * 0.045 * turn;
      out.gazeY = look.y * 0.035 * turn;
      out.eyeOpen = blinkAt(time, 0.55) * blinkAt(time, 0.8);
    },
  },
  peek: {
    duration: 1.7,
    keyTime: 0.7,
    pose: (time, out, look) => {
      resetPose(out);
      breathe(time, out);
      const side = look.x < 0 ? -1 : 1;
      const lean =
        easeInOut(window01(time, 0, 0.35)) *
        (1 - easeInOut(window01(time, 1.25, 1.7)));
      out.bodyTiltZ = -side * 0.42 * lean;
      out.rootY = lean * 0.04;
      out.gazeX = side * 0.05 * lean;
      out.gazeY = 0.01 * lean;
      if (side > 0) {
        out.armRightRaise = restArmRaise + lean * 0.5;
      } else {
        out.armLeftRaise = restArmRaise + lean * 0.5;
      }
      out.eyeOpen = blinkAt(time, 0.9);
    },
  },
  salute: {
    duration: 1.5,
    keyTime: 0.6,
    pose: (time, out) => {
      resetPose(out);
      const raise =
        easeInOut(window01(time, 0, 0.25)) *
        (1 - easeInOut(window01(time, 1.15, 1.4)));
      out.armRightRaise = restArmRaise + raise * 1.45;
      out.armRightForward = raise * 1.05;
      out.bodyTiltX = -0.06 * raise;
      out.bodySquash = 1 + raise * 0.035;
      out.gazeY = 0.015 * raise;
    },
  },
  shuffle: {
    duration: 1.9,
    keyTime: 0.2,
    pose: (time, out) => {
      resetPose(out);
      const beat = time * tau * 2.2;
      const step = Math.sin(beat);
      out.leg0 = step * 0.4;
      out.leg1 = step * 0.4;
      out.leg2 = -step * 0.4;
      out.leg3 = -step * 0.4;
      out.rootY = Math.abs(step) * 0.07;
      out.bodyTiltZ = step * 0.12;
      out.bodyYaw = Math.sin(beat / 2) * 0.32;
      out.armLeftRaise = restArmRaise + 0.5 + step * 0.45;
      out.armRightRaise = restArmRaise + 0.5 - step * 0.45;
      out.armLeftForward = 0.3;
      out.armRightForward = 0.3;
      out.bodySquash = 1 - Math.abs(Math.cos(beat)) * 0.04;
    },
  },
  spin: {
    duration: 1.15,
    keyTime: 0.3,
    pose: (time, out) => {
      resetPose(out);
      const turn = window01(time, 0.05, 1.05);
      const lift = Math.sin(turn * Math.PI);
      out.bodyYaw = wrapAngle(easeInOut(turn) * tau);
      out.rootY = lift * 0.18;
      out.armLeftRaise = restArmRaise + lift * 0.85;
      out.armRightRaise = restArmRaise + lift * 0.85;
      out.bodySquash = 1 + lift * 0.03;
    },
  },
  surprised: {
    duration: 1,
    keyTime: 0.3,
    pose: (time, out) => {
      resetPose(out);
      const hop = Math.sin(window01(time, 0, 0.36) * Math.PI);
      const startle = Math.min(1, time / 0.08) * (1 - window01(time, 0.7, 1));
      out.rootY = hop * 0.34;
      out.armLeftRaise = restArmRaise + startle * 1.2;
      out.armRightRaise = restArmRaise + startle * 1.2;
      out.armLeftForward = startle * 0.2;
      out.armRightForward = startle * 0.2;
      out.bodyTiltX = -0.14 * startle;
      out.bodySquash = 1 + hop * 0.06 - startle * 0.02;
      out.eyeOpen = 1 + startle * 0.4;
      out.gazeY = 0.02 * startle;
    },
  },
  wave: {
    duration: 1.6,
    keyTime: 0.3,
    pose: (time, out) => {
      actionClips.wave.pose(time, out);
      out.gazeY = 0.02;
    },
  },
} as const satisfies Record<AgentReaction, ReactionClip>;

export interface HopPlan {
  reachX: number;
  reachZ: number;
  turn: number;
}

export const hopClip = { duration: 1.75, keyTime: 0.9 } as const;

const bump = (time: number, from: number, to: number) =>
  Math.sin(window01(time, from, to) * Math.PI);

export const applyHop = (time: number, plan: HopPlan, out: Pose) => {
  const travel =
    easeInOut(window01(time, 0.1, 0.5)) - easeInOut(window01(time, 1.15, 1.58));
  const lift = bump(time, 0.1, 0.5) * 0.42 + bump(time, 1.15, 1.58) * 0.3;
  const crouch =
    bump(time, 0, 0.12) +
    bump(time, 0.5, 0.64) * 0.8 +
    bump(time, 1.03, 1.17) * 0.6 +
    bump(time, 1.58, 1.75) * 0.8;
  const turn = bump(time, 0.05, 0.62) - bump(time, 1.08, 1.64) * 0.75;
  out.rootX += plan.reachX * travel;
  out.rootZ += plan.reachZ * travel;
  out.rootY += lift;
  out.bodyYaw += plan.turn * turn;
  out.bodySquash += lift * 0.07 - crouch * 0.11;
  out.armLeftRaise += lift * 1.5;
  out.armRightRaise += lift * 1.5;
  out.leg0 += lift * 0.45;
  out.leg1 -= lift * 0.45;
  out.leg2 += lift * 0.45;
  out.leg3 -= lift * 0.45;
  out.gazeY += window01(time, 0.5, 0.7) * (1 - window01(time, 1, 1.15)) * 0.02;
};

export const applyHopReduced = (time: number, plan: HopPlan, out: Pose) => {
  if (time >= 0 && time < hopClip.duration) {
    out.rootX += plan.reachX;
    out.rootZ += plan.reachZ;
  }
};
