import type { WaypointSide } from "./view-registry";

export interface ScreenRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface CompanionFrame {
  agentHeight: number;
  agentWidth: number;
  isCompact: boolean;
}

const compactBelow = 640;
const roomyFrom = 1024;
const edgeInset = 12;
const headerClearance = 56;
const switchMargin = 0.12;

export const companionFrame = (viewport: Viewport): CompanionFrame => {
  if (viewport.width < compactBelow) {
    return { agentHeight: 64, agentWidth: 56, isCompact: true };
  }
  if (viewport.width < roomyFrom) {
    return { agentHeight: 80, agentWidth: 70, isCompact: false };
  }
  return { agentHeight: 96, agentWidth: 84, isCompact: false };
};

export const viewportShare = (rect: ScreenRect, viewport: Viewport) =>
  Math.max(0, Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0)) /
  viewport.height;

export const ownVisibleShare = (rect: ScreenRect, viewport: Viewport) => {
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  if (width <= 0 || height <= 0) {
    return 0;
  }
  const visibleWidth = Math.max(
    0,
    Math.min(rect.right, viewport.width) - Math.max(rect.left, 0)
  );
  const visibleHeight = Math.max(
    0,
    Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0)
  );
  return (visibleWidth * visibleHeight) / (width * height);
};

export interface WaypointCandidate<Key> {
  key: Key;
  rect: ScreenRect;
}

export const pickWaypoint = <Key>(
  candidates: readonly WaypointCandidate<Key>[],
  viewport: Viewport,
  current: Key | null
): Key | null => {
  let best: Key | null = null;
  let bestScore = 0;
  let currentScore = 0;
  for (const { key, rect } of candidates) {
    const score = viewportShare(rect, viewport);
    if (key === current) {
      currentScore = score;
    }
    if (score > bestScore) {
      best = key;
      bestScore = score;
    }
  }
  if (best === null) {
    return current;
  }
  if (currentScore > 0 && bestScore - currentScore < switchMargin) {
    return current;
  }
  return best;
};

export const anchorFor = (
  rect: ScreenRect,
  side: WaypointSide,
  viewport: Viewport,
  frame: CompanionFrame
): ScreenPoint => {
  const halfWidth = frame.agentWidth / 2;
  const minX = edgeInset + halfWidth;
  const maxX = viewport.width - edgeInset - halfWidth;
  if (frame.isCompact) {
    return { x: maxX, y: viewport.height - edgeInset };
  }
  const edgeX =
    side === "right"
      ? Math.min(rect.right, viewport.width) - edgeInset - halfWidth
      : Math.max(rect.left, 0) + edgeInset + halfWidth;
  const minY = headerClearance + frame.agentHeight;
  const maxY = viewport.height - edgeInset;
  return {
    x: Math.min(maxX, Math.max(minX, edgeX)),
    y: Math.min(maxY, Math.max(minY, rect.bottom - edgeInset)),
  };
};

export interface TravelState {
  x: number;
  y: number;
  hopPhase: number;
  isTraveling: boolean;
}

const departDistance = 36;
const arriveDistance = 1.5;
const followRate = 16;
const baseSpeed = 320;
const distanceSpeed = 2.4;
const maxSpeed = 1500;
const hopLength = 84;

export const travelHopHeight = 16;

export const stepTravel = (
  state: TravelState,
  target: ScreenPoint,
  delta: number,
  speedBoost: number
) => {
  const dx = target.x - state.x;
  const dy = target.y - state.y;
  const distance = Math.hypot(dx, dy);
  if (!state.isTraveling && distance > departDistance) {
    state.isTraveling = true;
    state.hopPhase = 0;
  }
  if (!state.isTraveling) {
    const follow = 1 - Math.exp(-followRate * delta);
    state.x += dx * follow;
    state.y += dy * follow;
    return;
  }
  const speed = Math.min(maxSpeed, baseSpeed + distance * distanceSpeed);
  const step = Math.min(distance, speed * speedBoost * delta);
  if (distance > 0) {
    state.x += (dx / distance) * step;
    state.y += (dy / distance) * step;
  }
  state.hopPhase += step / hopLength;
  if (distance - step <= arriveDistance) {
    state.x = target.x;
    state.y = target.y;
    state.isTraveling = false;
    state.hopPhase = 0;
  }
};

export const hopOffset = (state: TravelState) =>
  state.isTraveling ? Math.abs(Math.sin(state.hopPhase * Math.PI)) : 0;
