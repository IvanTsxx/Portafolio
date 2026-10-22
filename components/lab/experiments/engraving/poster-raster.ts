import { detailPosterGrid } from "@/components/lab/source/write-poster-bitmap";

const pitch = 5;
const angle = Math.PI / 6;
const crossTurn = Math.PI / 3;
const crossShare = 0.62;
const hairline = 0.05;
const follow = 0.7;
const bulge = 0.14;
const reliefRadius = 6;

const blur = (values: Float32Array, columns: number, rows: number) => {
  const blurred = new Float32Array(values.length);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      let total = 0;
      let count = 0;
      for (let dy = -reliefRadius; dy <= reliefRadius; dy += 1) {
        for (let dx = -reliefRadius; dx <= reliefRadius; dx += 1) {
          const sampleX = Math.min(Math.max(x + dx, 0), columns - 1);
          const sampleY = Math.min(Math.max(y + dy, 0), rows - 1);
          total += values[sampleY * columns + sampleX] ?? 0;
          count += 1;
        }
      }
      blurred[y * columns + x] = total / count;
    }
  }
  return blurred;
};

const lineInk = (
  x: number,
  y: number,
  lineAngle: number,
  shift: number,
  lineWidth: number
) => {
  const across = (-Math.sin(lineAngle) * x + Math.cos(lineAngle) * y) / pitch;
  const shifted = across + shift;
  const distance = Math.abs(shifted - Math.floor(shifted) - 0.5);
  return distance < lineWidth * 0.5;
};

export const engravingPoster = (luma: Float32Array) => {
  const { columns, rows } = detailPosterGrid;
  const relief = blur(luma, columns, rows);
  const ink = new Uint8Array(columns * rows);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      const x = column + 0.5 - columns / 2;
      const y = rows / 2 - row - 0.5;
      const tone = 1 - (luma[index] ?? 1);
      const shift = (follow * (relief[index] ?? 0) * bulge * rows) / pitch;
      const primaryWidth =
        hairline + (crossShare - hairline) * Math.min(tone / crossShare, 1);
      const crossWidth = Math.max(tone - crossShare, 0) / (1 - crossShare);
      const isInked =
        lineInk(x, y, angle, shift, primaryWidth) ||
        (crossWidth > 0.001 &&
          lineInk(x, y, angle + crossTurn, shift, crossWidth));
      ink[index] = isInked ? 1 : 0;
    }
  }
  return ink;
};
