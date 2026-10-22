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

const wideColumnCounts = [1, 2, 3, 4] as const;

export const envelopeColumns = (count: number) =>
  wideColumnCounts[Math.min(Math.max(count, 1), WIDE_COLUMNS) - 1] ?? 4;

export const letterOrigin = (
  index: number,
  wideColumns: number = WIDE_COLUMNS
): CSSProperties & { "--from-narrow": string; "--from-wide": string } => ({
  "--from-narrow": columnCenter(index, NARROW_COLUMNS),
  "--from-wide": columnCenter(index, wideColumns),
});

export const deskOrigin: CSSProperties & {
  "--from-narrow": string;
  "--from-wide": string;
} = { "--from-narrow": "50%", "--from-wide": "50%" };
