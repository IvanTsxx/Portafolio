import type { AgentAction, AgentRole } from "@/lib/agents/roles";

import type { OperatorPose } from "./companion-operator";
import type { DockGoal } from "./companion-placement";

export interface CompanionMotion {
  isPlaced: boolean;
  lastScrollY: number;
  role: AgentRole;
  scale: number;
  scaleVelocity: number;
  scrollVelocity: number;
  stride: number;
  swapRole: AgentRole;
  swapStart: number;
  x: number;
  y: number;
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
  goal: DockGoal;
  isReduced: boolean;
  pinned: OperatorPose | null;
  restAction: AgentAction;
  role: AgentRole;
  scrollY: number;
  step: number;
  time: number;
}

export const swapSeconds = 0.7;
export const tuckSpeed = 160;
const swapApex = 0.4;
const swapHopPixels = 34;
const followRate = 5;
const yawRate = 4;
const dragPerSpeed = 0.025;
const dragLimit = 36;
const walkSpeed = 520;
const strideLength = 240;
const strideHop = 6;
const leanPerSpeed = 1 / 7000;
const leanLimit = 0.16;
const tau = Math.PI * 2;
const noCue: CompanionCue = { kind: "none" };

const damp = (from: number, to: number, rate: number, step: number) =>
  from + (to - from) * (1 - Math.exp(-rate * step));

const clamp = (value: number, limit: number) =>
  Math.min(limit, Math.max(-limit, value));

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

export const createCompanionMotion = (role: AgentRole): CompanionMotion => ({
  isPlaced: false,
  lastScrollY: 0,
  role,
  scale: 0,
  scaleVelocity: 0,
  scrollVelocity: 0,
  stride: 0,
  swapRole: role,
  swapStart: Number.NEGATIVE_INFINITY,
  x: 0,
  y: 0,
  yaw: 0,
});

const wear = (state: CompanionMotion, role: AgentRole): CompanionCue => {
  state.role = role;
  state.swapRole = role;
  return { kind: "wear", role };
};

const restingPose = (action: AgentAction, cue: CompanionCue) => ({
  action,
  cue,
  lean: 0,
  lift: 0,
  spin: 0,
  squash: 1,
});

const stepReduced = (
  state: CompanionMotion,
  input: CompanionInput
): CompanionPose => {
  state.x = input.goal.x;
  state.y = input.goal.y;
  state.scale = input.goal.scale;
  state.scaleVelocity = 0;
  state.scrollVelocity = 0;
  state.yaw = input.goal.yaw;
  return restingPose(
    input.restAction,
    input.role === state.role ? noCue : wear(state, input.role)
  );
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

const stepScale = (state: CompanionMotion, goal: number, step: number) => {
  state.scaleVelocity +=
    ((goal - state.scale) * 220 - state.scaleVelocity * 18) * step;
  state.scale = Math.max(0, state.scale + state.scaleVelocity * step);
};

const stepFollow = (
  state: CompanionMotion,
  input: CompanionInput
): CompanionPose => {
  const { goal, step } = input;
  const drag = clamp(-state.scrollVelocity * dragPerSpeed, dragLimit);
  state.x = damp(state.x, goal.x, followRate, step);
  state.y = damp(state.y, goal.y + drag, followRate, step);
  state.yaw = damp(state.yaw, goal.yaw, yawRate, step);
  const speed = Math.abs(state.scrollVelocity);
  const isWalking = speed > walkSpeed;
  state.stride = isWalking ? state.stride + (speed * step) / strideLength : 0;
  return {
    action: isWalking ? "walk" : input.restAction,
    cue: noCue,
    lean: 0,
    lift: Math.abs(Math.sin(state.stride * Math.PI)) * strideHop,
    spin: 0,
    squash: 1,
  };
};

const stepPinned = (
  state: CompanionMotion,
  input: CompanionInput,
  pinned: OperatorPose
): CompanionPose => {
  state.x = input.goal.x;
  state.y = input.goal.y;
  state.yaw = damp(state.yaw, pinned.yaw, yawRate * 2, input.step);
  state.stride = 0;
  return {
    action: pinned.action,
    cue: noCue,
    lean: pinned.lean,
    lift: pinned.lift,
    spin: 0,
    squash: pinned.squash,
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
    action: input.restAction,
    cue,
    lean: 0,
    lift: Math.sin(progress * Math.PI) * swapHopPixels,
    spin: easeInOutCubic(progress) * tau,
    squash: 1,
  };
};

export const stepCompanion = (
  state: CompanionMotion,
  input: CompanionInput
): CompanionPose => {
  if (!state.isPlaced) {
    state.x = input.goal.x;
    state.y = input.goal.y;
    state.yaw = input.goal.yaw;
    state.lastScrollY = input.scrollY;
    state.isPlaced = true;
  }
  if (input.isReduced) {
    return stepReduced(state, input);
  }
  trackScroll(state, input);
  stepScale(state, input.goal.scale, input.step);
  const follow = input.pinned
    ? stepPinned(state, input, input.pinned)
    : stepFollow(state, input);
  const lean = input.pinned
    ? input.pinned.lean
    : clamp(-state.scrollVelocity * leanPerSpeed, leanLimit);

  const progress = (input.time - state.swapStart) / swapSeconds;
  const isSwapping = progress >= 0 && progress < 1;
  if (!isSwapping && input.role !== state.swapRole) {
    if (state.scale < 0.1) {
      return { ...follow, cue: wear(state, input.role), lean };
    }
    state.swapRole = input.role;
    state.swapStart = input.time;
    return stepSwap(state, input, 0);
  }
  if (isSwapping) {
    return stepSwap(state, input, progress);
  }
  return { ...follow, lean };
};
