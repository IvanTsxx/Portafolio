import type { AgentAction } from "@/lib/agents/roles";

import type { Pose } from "./rig";
import { resetPose, restArmRaise } from "./rig";

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

export const actionClips = {
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
