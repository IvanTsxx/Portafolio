import { seededRandom } from "@/components/lab/experiments/stipple/stipple-field";

import { hashOf, thresholdAt } from "./sleeve-cover";

export const DISC_CELLS = 64;
export const DISC_CENTER = DISC_CELLS / 2;
export const LABEL_RADIUS = 14;

const TAU = Math.PI * 2;
const RIM_RADIUS = 31.5;
const GROOVE_STEP = 1.25;

const ringOf = (radius: number) =>
  `M${DISC_CENTER - radius} ${DISC_CENTER}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 -${radius * 2} 0`;

export const discGrooves = Array.from(
  {
    length: Math.floor((RIM_RADIUS - LABEL_RADIUS - 2) / GROOVE_STEP),
  },
  (_, index) => ringOf(LABEL_RADIUS + 2 + index * GROOVE_STEP)
).join("");

export const discSheenOf = (id: string) => {
  const random = seededRandom(hashOf(`${id}#disc`));
  const angle = random() * Math.PI;
  const ripple = 0.8 + random() * 1.4;
  const phase = random() * TAU;
  let path = "";
  for (let row = 0; row < DISC_CELLS; row += 1) {
    let runStart = -1;
    for (let column = 0; column <= DISC_CELLS; column += 1) {
      const x = column + 0.5 - DISC_CENTER;
      const y = row + 0.5 - DISC_CENTER;
      const radius = Math.hypot(x, y);
      const isInside =
        column < DISC_CELLS && radius > LABEL_RADIUS + 1 && radius < RIM_RADIUS;
      const tone = isInside
        ? (0.5 + 0.5 * Math.cos(2 * (Math.atan2(y, x) - angle))) ** 3 *
          (0.75 + 0.25 * Math.sin(radius * ripple + phase))
        : 0;
      const isLit = isInside && tone > thresholdAt(column, row);
      if (isLit && runStart < 0) {
        runStart = column;
      } else if (!isLit && runStart >= 0) {
        path += `M${runStart} ${row}h${column - runStart}v1h-${column - runStart}z`;
        runStart = -1;
      }
    }
  }
  return path;
};
