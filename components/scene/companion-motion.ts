import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import { agentProfiles } from "@/lib/agents/roles";

import type { ScreenPoint, TravelState } from "./companion-path";
import { hopOffset, stepTravel, travelHopHeight } from "./companion-path";
import type { Waypoint } from "./view-registry";

export type CompanionStop = Pick<Waypoint, "action" | "role" | "side">;

export interface CompanionLeap {
  duration: number;
  from: ScreenPoint;
  height: number;
  start: number;
}

export interface CompanionMotion {
  isPlaced: boolean;
  leap: CompanionLeap | null;
  lastScrollY: number;
  role: AgentRole;
  scale: number;
  scaleVelocity: number;
  scrollVelocity: number;
  swapRole: AgentRole;
  swapStart: number;
  travel: TravelState;
  yaw: number;
}

export type CompanionCue =
  | { kind: "none" }
  | { kind: "wear"; role: AgentRole }
  | { kind: "swap"; role: AgentRole; tossed: AgentRole };

export interface CompanionPose {
  action: AgentAction;
  cue: CompanionCue;
  lean: number;
  lift: number;
  spin: number;
  squash: number;
}

export interface CompanionInput {
  isHidden: boolean;
  isReduced: boolean;
  scrollY: number;
  step: number;
  stop: CompanionStop;
  target: ScreenPoint;
  time: number;
}

export const swapSeconds = 0.7;
const swapApex = 0.4;
const swapHopPixels = 34;
const travelYaw = 1.1;
const restYaw = 0.32;
const tau = Math.PI * 2;
const noCue: CompanionCue = { kind: "none" };

const damp = (from: number, to: number, rate: number, step: number) =>
  from + (to - from) * (1 - Math.exp(-rate * step));

const clamp = (value: number, limit: number) =>
  Math.min(limit, Math.max(-limit, value));

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

const restingAction = (stop: CompanionStop): AgentAction =>
  stop.action ?? agentProfiles[stop.role].signatureActions[0];

const restingYaw = (stop: CompanionStop) =>
  stop.side === "right" ? -restYaw : restYaw;

export const createCompanionMotion = (role: AgentRole): CompanionMotion => ({
  isPlaced: false,
  lastScrollY: 0,
  leap: null,
  role,
  scale: 0,
  scaleVelocity: 0,
  scrollVelocity: 0,
  swapRole: role,
  swapStart: Number.NEGATIVE_INFINITY,
  travel: { hopPhase: 0, isTraveling: false, x: 0, y: 0 },
  yaw: 0,
});

const wear = (state: CompanionMotion, role: AgentRole): CompanionCue => {
  state.role = role;
  state.swapRole = role;
  return { kind: "wear", role };
};

const stepReduced = (
  state: CompanionMotion,
  input: CompanionInput
): CompanionPose => {
  state.travel.x = input.target.x;
  state.travel.y = input.target.y;
  state.travel.isTraveling = false;
  state.scale = input.isHidden ? 0 : 1;
  state.yaw = restingYaw(input.stop);
  return {
    action: restingAction(input.stop),
    cue: input.stop.role === state.role ? noCue : wear(state, input.stop.role),
    lean: 0,
    lift: 0,
    spin: 0,
    squash: 1,
  };
};

const leapSquash = (progress: number) => {
  if (progress < 0.14) {
    return 1 - Math.sin((progress / 0.14) * Math.PI) * 0.16;
  }
  if (progress > 0.86) {
    return 1 - Math.sin(((progress - 0.86) / 0.14) * Math.PI) * 0.14;
  }
  return 1 + Math.sin(((progress - 0.14) / 0.72) * Math.PI) * 0.08;
};

export const isSwapActive = (state: CompanionMotion, time: number) => {
  const progress = (time - state.swapStart) / swapSeconds;
  return progress >= 0 && progress < 1;
};

export const startLeap = (
  state: CompanionMotion,
  target: ScreenPoint,
  time: number
) => {
  const distance = Math.hypot(
    target.x - state.travel.x,
    target.y - state.travel.y
  );
  state.travel.isTraveling = false;
  state.leap = {
    duration: Math.min(0.85, 0.5 + distance / 1400),
    from: { x: state.travel.x, y: state.travel.y },
    height: Math.min(90, 30 + distance * 0.16),
    start: time,
  };
};

const stepLeap = (
  state: CompanionMotion,
  input: CompanionInput,
  leap: CompanionLeap,
  progress: number
): CompanionPose => {
  const { target, step } = input;
  const glide = easeInOutCubic(
    Math.min(1, Math.max(0, (progress - 0.1) / 0.8))
  );
  const heading = target.x - leap.from.x;
  state.travel.x = leap.from.x + (target.x - leap.from.x) * glide;
  state.travel.y = leap.from.y + (target.y - leap.from.y) * glide;
  if (Math.abs(heading) > 1) {
    state.yaw = damp(state.yaw, Math.sign(heading) * travelYaw, 12, step);
  }
  const air = Math.min(1, Math.max(0, (progress - 0.1) / 0.8));
  return {
    action: restingAction(input.stop),
    cue: noCue,
    lean: -Math.sign(heading) * Math.sin(air * Math.PI) * 0.12,
    lift: Math.sin(air * Math.PI) * leap.height,
    spin: 0,
    squash: leapSquash(progress),
  };
};

const stepSwap = (
  state: CompanionMotion,
  input: CompanionInput,
  progress: number
): CompanionPose => {
  let cue: CompanionCue = noCue;
  if (progress >= swapApex && state.role !== state.swapRole) {
    cue = { kind: "swap", role: state.swapRole, tossed: state.role };
    state.role = state.swapRole;
  }
  return {
    action: restingAction(input.stop),
    cue,
    lean: 0,
    lift: Math.sin(progress * Math.PI) * swapHopPixels,
    spin: easeInOutCubic(progress) * tau,
    squash: 1,
  };
};

const stepRoam = (
  state: CompanionMotion,
  input: CompanionInput
): CompanionPose => {
  const { step, stop, target } = input;
  const { travel } = state;
  const boost = 1 + Math.min(Math.abs(state.scrollVelocity) / 1800, 1.2);
  const startX = travel.x;
  stepTravel(travel, target, step, boost);
  const heading = travel.x - startX;
  let lean = 0;
  if (travel.isTraveling && Math.abs(heading) > 0.2) {
    state.yaw = damp(state.yaw, Math.sign(heading) * travelYaw, 10, step);
    lean = -Math.sign(heading) * 0.06;
  } else if (!travel.isTraveling) {
    state.yaw = damp(state.yaw, restingYaw(stop), 6, step);
  }
  return {
    action: travel.isTraveling ? "walk" : restingAction(stop),
    cue: noCue,
    lean,
    lift: hopOffset(travel) * travelHopHeight,
    spin: 0,
    squash: 1,
  };
};

const stepScale = (state: CompanionMotion, isHidden: boolean, step: number) => {
  const goal = isHidden ? 0 : 1;
  state.scaleVelocity +=
    ((goal - state.scale) * 220 - state.scaleVelocity * 18) * step;
  state.scale = Math.max(0, state.scale + state.scaleVelocity * step);
};

const trackScroll = (state: CompanionMotion, input: CompanionInput) => {
  const speed = (input.scrollY - state.lastScrollY) / input.step;
  state.lastScrollY = input.scrollY;
  state.scrollVelocity = damp(
    state.scrollVelocity,
    Number.isFinite(speed) ? speed : 0,
    6,
    input.step
  );
};

export const stepCompanion = (
  state: CompanionMotion,
  input: CompanionInput
): CompanionPose => {
  if (!state.isPlaced) {
    state.travel.x = input.target.x;
    state.travel.y = input.target.y;
    state.lastScrollY = input.scrollY;
    state.isPlaced = true;
  }
  if (input.isReduced) {
    state.leap = null;
    return stepReduced(state, input);
  }
  trackScroll(state, input);
  stepScale(state, input.isHidden, input.step);

  const progress = (input.time - state.swapStart) / swapSeconds;
  const isSwapping = progress >= 0 && progress < 1;
  if (!isSwapping && input.stop.role !== state.swapRole) {
    if (state.scale < 0.1) {
      const cue = wear(state, input.stop.role);
      return { ...stepRoam(state, input), cue };
    }
    state.swapRole = input.stop.role;
    state.swapStart = input.time;
    return stepSwap(state, input, 0);
  }
  const { leap } = state;
  const leapProgress = leap ? (input.time - leap.start) / leap.duration : 1;
  if (leap && leapProgress >= 1) {
    state.leap = null;
    state.travel.x = input.target.x;
    state.travel.y = input.target.y;
  }
  let pose: CompanionPose;
  if (isSwapping) {
    pose = stepSwap(state, input, progress);
  } else if (leap && leapProgress < 1) {
    pose = stepLeap(state, input, leap, Math.max(0, leapProgress));
  } else {
    pose = stepRoam(state, input);
  }
  return {
    ...pose,
    lean: pose.lean + clamp(-state.scrollVelocity / 7000, 0.16),
  };
};
