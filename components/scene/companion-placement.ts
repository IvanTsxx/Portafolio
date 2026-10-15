import { bodyBase, bodySize } from "@/components/agents/rig";

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
    }
  | {
      bubble: BubbleSlot | null;
      frame: CompanionFrame;
      kind: "rail";
      track: RailTrack;
      x: number;
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
  { agentHeight: 56, agentWidth: 48 },
  { agentHeight: 48, agentWidth: 42 },
];
const cornerFrame: CompanionFrame = { agentHeight: 56, agentWidth: 48 };
export const sheetShadow = 12;
const laneInset = 8;
const columnGap = 24;
const edgeInset = 12;
const restShare = 0.72;
export const headerClearance = 56;
const bubbleRoom = 80;
const bubbleGap = 8;
const bubbleMinWidth = 132;
export const bubbleMaxWidth = 224;
export const companionModelHeight = 2.2;
export const companionBodyShare =
  (bodyBase + bodySize.height) / companionModelHeight;
const cornerHiddenBodyShare = 0.35;
const restYaw = -0.32;
export const watchYaw = -0.75;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const bubbleSlotFor = (
  viewport: Viewport,
  column: ColumnBounds,
  x: number
): BubbleSlot | null => {
  const left = column.right + sheetShadow + bubbleGap;
  const maxWidth = Math.min(bubbleMaxWidth, viewport.width - edgeInset - left);
  return maxWidth >= bubbleMinWidth ? { left, maxWidth, tail: x - left } : null;
};

export const headBubbleSlot = (
  viewport: Viewport,
  x: number
): BubbleSlot | null => {
  const maxWidth = Math.min(bubbleMaxWidth, viewport.width - edgeInset * 2);
  if (maxWidth < bubbleMinWidth) {
    return null;
  }
  const left = clamp(
    x - bubbleGap * 3,
    edgeInset,
    viewport.width - edgeInset - maxWidth
  );
  return { left, maxWidth, tail: x - left };
};

const railDock = (
  viewport: Viewport,
  column: ColumnBounds,
  track: RailTrack
): CompanionDock | null => {
  const lane = track.left - column.right - sheetShadow;
  const frame = gutterFrames.find(
    (candidate) => candidate.agentWidth + laneInset * 2 <= lane
  );
  if (!frame || track.bottom <= track.top) {
    return null;
  }
  const x = column.right + sheetShadow + lane / 2;
  return {
    bubble: bubbleSlotFor(viewport, column, x),
    frame,
    kind: "rail",
    track,
    x,
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
      restY:
        viewport.height +
        cornerFrame.agentHeight * companionBodyShare * cornerHiddenBodyShare,
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
  };
};

export const railY = (dock: CompanionDock & { kind: "rail" }, share: number) =>
  dock.track.top +
  (dock.track.bottom - dock.track.top) * Math.min(1, Math.max(0, share)) +
  dock.frame.agentHeight / 2;

export type BubbleSide = "above" | "below";

export const bubbleSide = (headY: number): BubbleSide =>
  headY - bubbleRoom >= headerClearance ? "above" : "below";

export const dockGoal = (
  dock: CompanionDock,
  { isTucked, railShare = 0 }: { isTucked: boolean; railShare?: number }
): DockGoal => {
  if (dock.kind === "corner") {
    return {
      scale: isTucked ? 0 : 1,
      x: dock.x,
      y: isTucked ? dock.tuckY : dock.restY,
      yaw: restYaw,
    };
  }
  return {
    scale: 1,
    x: dock.x,
    y: dock.kind === "rail" ? railY(dock, railShare) : dock.restY,
    yaw: restYaw,
  };
};

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
