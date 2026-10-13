export interface Viewport {
  height: number;
  width: number;
}

export interface ScreenRect {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface ColumnBounds {
  left: number;
  right: number;
}

export interface RailTrack {
  bottom: number;
  left: number;
  top: number;
}

export interface CompanionFrame {
  agentHeight: number;
  agentWidth: number;
}

export interface BubbleSlot {
  left: number;
  maxWidth: number;
  tail: number;
}

export type CompanionDock =
  | {
      bubble: BubbleSlot | null;
      frame: CompanionFrame;
      kind: "gutter";
      restY: number;
      x: number;
      yieldY: number;
    }
  | {
      bubble: BubbleSlot | null;
      frame: CompanionFrame;
      kind: "rail";
      track: RailTrack;
      x: number;
      yieldY: number;
    }
  | {
      frame: CompanionFrame;
      kind: "corner";
      restY: number;
      tuckY: number;
      x: number;
    };

export interface DockGoal {
  scale: number;
  x: number;
  y: number;
  yaw: number;
}

const gutterFrames: readonly CompanionFrame[] = [
  { agentHeight: 96, agentWidth: 84 },
  { agentHeight: 80, agentWidth: 70 },
  { agentHeight: 64, agentWidth: 56 },
];
const cornerFrame: CompanionFrame = { agentHeight: 56, agentWidth: 48 };
const stationFrameHeight = 64;
const laneInset = 8;
const columnGap = 24;
const edgeInset = 12;
const restShare = 0.72;
export const headerClearance = 56;
const bubbleRoom = 96;
const bubbleGap = 8;
const bubbleMinWidth = 132;
const bubbleMaxWidth = 256;
const cornerHiddenShare = 0.3;
const yieldScale = 0.6;
const restYaw = -0.32;
export const watchYaw = -0.75;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const bubbleSlotFor = (
  viewport: Viewport,
  column: ColumnBounds,
  x: number
): BubbleSlot | null => {
  const left = column.right + bubbleGap;
  const maxWidth = Math.min(bubbleMaxWidth, viewport.width - edgeInset - left);
  return maxWidth >= bubbleMinWidth ? { left, maxWidth, tail: x - left } : null;
};

const railDock = (
  viewport: Viewport,
  column: ColumnBounds,
  track: RailTrack
): CompanionDock | null => {
  const lane = track.left - column.right;
  const frame = gutterFrames.find(
    (candidate) => candidate.agentWidth + laneInset * 2 <= lane
  );
  if (!frame || track.bottom <= track.top) {
    return null;
  }
  const x = column.right + lane / 2;
  return {
    bubble: bubbleSlotFor(viewport, column, x),
    frame,
    kind: "rail",
    track,
    x,
    yieldY: viewport.height - edgeInset,
  };
};

export const companionDock = (
  viewport: Viewport,
  column: ColumnBounds,
  track: RailTrack | null = null
): CompanionDock => {
  const rail = track ? railDock(viewport, column, track) : null;
  if (rail) {
    return rail;
  }
  const gutter = viewport.width - column.right;
  const frame = gutterFrames.find(
    (candidate) => columnGap + candidate.agentWidth + edgeInset <= gutter
  );
  if (!frame) {
    return {
      frame: cornerFrame,
      kind: "corner",
      restY: viewport.height + cornerFrame.agentHeight * cornerHiddenShare,
      tuckY: viewport.height + cornerFrame.agentHeight,
      x: viewport.width - edgeInset - cornerFrame.agentWidth / 2,
    };
  }
  const x = column.right + columnGap + frame.agentWidth / 2;
  const floor = viewport.height - edgeInset;
  return {
    bubble: bubbleSlotFor(viewport, column, x),
    frame,
    kind: "gutter",
    restY: clamp(
      viewport.height * restShare,
      Math.min(floor, headerClearance + bubbleRoom + frame.agentHeight),
      floor
    ),
    x,
    yieldY: floor,
  };
};

export const railY = (dock: CompanionDock & { kind: "rail" }, share: number) =>
  dock.track.top +
  (dock.track.bottom - dock.track.top) * Math.min(1, Math.max(0, share)) +
  dock.frame.agentHeight / 2;

export type BubbleSide = "above" | "below";

export const bubbleSide = (headY: number): BubbleSide =>
  headY - bubbleRoom >= headerClearance ? "above" : "below";

export const stationScale = (dock: CompanionDock) =>
  Math.min(1, stationFrameHeight / dock.frame.agentHeight);

export const dockGoal = (
  dock: CompanionDock,
  {
    isTucked,
    isYielding,
    railShare = 0,
  }: { isTucked: boolean; isYielding: boolean; railShare?: number }
): DockGoal => {
  if (dock.kind === "corner") {
    const isAway = isTucked || isYielding;
    return {
      scale: isAway ? 0 : 1,
      x: dock.x,
      y: isAway ? dock.tuckY : dock.restY,
      yaw: restYaw,
    };
  }
  if (isYielding) {
    return { scale: yieldScale, x: dock.x, y: dock.yieldY, yaw: watchYaw };
  }
  return {
    scale: 1,
    x: dock.x,
    y: dock.kind === "rail" ? railY(dock, railShare) : dock.restY,
    yaw: restYaw,
  };
};

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

const yieldEnterPresence = 0.6;
const yieldLeavePresence = 0.4;

export const castPresence = (rect: ScreenRect, viewport: Viewport) => {
  const height = rect.bottom - rect.top;
  if (height <= 0 || rect.right <= 0 || rect.left >= viewport.width) {
    return 0;
  }
  const visibleHeight = Math.max(
    0,
    Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0)
  );
  return visibleHeight / Math.min(height, viewport.height);
};

export const shouldYield = (
  casts: Iterable<ScreenRect>,
  viewport: Viewport,
  isYielding: boolean
) => {
  const threshold = isYielding ? yieldLeavePresence : yieldEnterPresence;
  for (const rect of casts) {
    if (castPresence(rect, viewport) >= threshold) {
      return true;
    }
  }
  return false;
};
