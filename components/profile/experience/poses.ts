import type { CSSProperties } from "react";

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

export type PullPose = "pulled" | "resting";

export const pullPose = (index: number, pulled: number | null): PullPose =>
  index === pulled ? "pulled" : "resting";

export const pulledAfter = (pulled: number | null, index: number) =>
  pulled === index ? null : index;

export const tearOff = (torn: readonly number[], index: number) => [
  ...torn.filter((ticket) => ticket !== index),
  index,
];

export const putBack = (torn: readonly number[], index: number) =>
  torn.filter((ticket) => ticket !== index);

const DESK_TILT_DEG = [-2, 1.5, -1, 2.5, -0.5, 1] as const;
const DESK_DRIFT_REM = 0.25;

export const deskSlot = (
  index: number,
  torn: readonly number[]
): CSSProperties => {
  const order = torn.indexOf(index);
  if (order === -1) {
    return { zIndex: 0 };
  }
  const drift = order * DESK_DRIFT_REM;
  return {
    rotate: `${DESK_TILT_DEG[order % DESK_TILT_DEG.length]}deg`,
    translate: `${drift}rem ${drift}rem`,
    zIndex: 10 + order,
  };
};

const NARROW_COLUMNS = 2;
const WIDE_COLUMNS = 4;

const columnCenter = (index: number, columns: number) =>
  `${(((index % columns) + 0.5) / columns) * 100}%`;

export const letterOrigin = (
  index: number
): CSSProperties & { "--from-narrow": string; "--from-wide": string } => ({
  "--from-narrow": columnCenter(index, NARROW_COLUMNS),
  "--from-wide": columnCenter(index, WIDE_COLUMNS),
});
