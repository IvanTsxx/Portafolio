import type { CSSProperties } from "react";

const DEEPEST_PAGE = 3;
const PAGE_EDGE_REM = 0.375;

export const sheetPose = (depth: number, isReduced: boolean): CSSProperties => {
  if (depth < 0) {
    return isReduced
      ? { opacity: 0, zIndex: 30 + depth }
      : { transform: "scaleX(0) skewY(-6deg)", zIndex: 30 + depth };
  }
  const edge = Math.min(depth, DEEPEST_PAGE) * PAGE_EDGE_REM;
  return {
    opacity: depth > DEEPEST_PAGE ? 0 : 1,
    transform: `translate3d(0, ${edge}rem, 0)`,
    zIndex: 20 - depth,
  };
};

export const fanSlot = (
  index: number,
  active: number,
  count: number
): CSSProperties & { "--slot": number } => ({
  "--slot": index - (count - 1) / 2,
  zIndex: index === active ? count + 1 : count - Math.abs(index - active),
});

const HEADROOM_REM = 1.5;
const FOLDER_STEP_REM = 2.5;
const SHEET_TOP_REM = 4.5;
const PARTED_REM = 3.5;
const DRAWER_FRONT_REM = 5;

export type FolderPose = "lifted" | "parted" | "resting";

export const folderPose = (index: number, active: number): FolderPose => {
  if (index === active) {
    return "lifted";
  }
  return index < active ? "parted" : "resting";
};

export const drawerHeightRem = (count: number) =>
  HEADROOM_REM +
  Math.max(0, count - 1) * FOLDER_STEP_REM +
  SHEET_TOP_REM +
  PARTED_REM +
  DRAWER_FRONT_REM;

export const folderSlot = (
  index: number,
  count: number
): CSSProperties & { "--tab-at": number } => ({
  "--tab-at": count > 1 ? (count - 1 - index) / (count - 1) : 0,
  top: `${HEADROOM_REM + (count - 1 - index) * FOLDER_STEP_REM}rem`,
  zIndex: count - index,
});
