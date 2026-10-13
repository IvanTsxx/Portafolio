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
const columnGap = 16;
const edgeInset = 12;
const restShare = 0.72;
const headerClearance = 56;
const bubbleRoom = 96;
const bubbleGap = 8;
const bubbleMinWidth = 132;
const bubbleMaxWidth = 256;
const cornerHiddenShare = 0.3;
const yieldScale = 0.6;
const restYaw = -0.32;
const watchYaw = -0.75;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const companionDock = (
  viewport: Viewport,
  column: ColumnBounds
): CompanionDock => {
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
  const bubbleLeft = column.right + bubbleGap;
  const bubbleWidth = Math.min(
    bubbleMaxWidth,
    viewport.width - edgeInset - bubbleLeft
  );
  const floor = viewport.height - edgeInset;
  return {
    bubble:
      bubbleWidth >= bubbleMinWidth
        ? { left: bubbleLeft, maxWidth: bubbleWidth, tail: x - bubbleLeft }
        : null,
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

export const dockGoal = (
  dock: CompanionDock,
  { isTucked, isYielding }: { isTucked: boolean; isYielding: boolean }
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
  return isYielding
    ? { scale: yieldScale, x: dock.x, y: dock.yieldY, yaw: watchYaw }
    : { scale: 1, x: dock.x, y: dock.restY, yaw: restYaw };
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
