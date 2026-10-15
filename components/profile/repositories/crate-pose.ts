import type { CSSProperties } from "react";

const STRIP_REM = 1.75;
const LIP_REM = 2.5;
const BAND_REM = 3;
const REVEAL_PERCENT = 60;

export const sleevePose = (index: number, active: number): CSSProperties => {
  const isTipped = index > active;
  return {
    transform: `translate3d(0, calc(${index * STRIP_REM}rem + ${isTipped ? REVEAL_PERCENT : 0}% - ${isTipped ? STRIP_REM : 0}rem), 0)`,
    zIndex: index + 1,
  };
};

export const crateHeight = (count: number): CSSProperties => ({
  height: `calc(${Math.max(0, count - 2) * STRIP_REM + LIP_REM + BAND_REM}rem + ${REVEAL_PERCENT}cqw)`,
});
