import type { CSSProperties } from "react";

export type PullPose = "pulled" | "resting";

export const pullPose = (index: number, pulled: number | null): PullPose =>
  index === pulled ? "pulled" : "resting";

export const pulledAfter = (pulled: number | null, index: number) =>
  pulled === index ? null : index;

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
