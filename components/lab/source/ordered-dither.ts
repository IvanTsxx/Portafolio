interface Raster {
  width: number;
  height: number;
  values: Float32Array;
}

const white = 255;
const bayerSide = 8;

const buildBayer = (size: number) => {
  let matrix = [0];
  let side = 1;
  while (side < size) {
    const doubled = side * 2;
    const next = Array.from<number>({ length: doubled * doubled }).fill(0);
    for (let y = 0; y < side; y += 1) {
      for (let x = 0; x < side; x += 1) {
        const value = (matrix[y * side + x] ?? 0) * 4;
        next[y * doubled + x] = value;
        next[y * doubled + x + side] = value + 2;
        next[(y + side) * doubled + x] = value + 3;
        next[(y + side) * doubled + x + side] = value + 1;
      }
    }
    matrix = next;
    side = doubled;
  }
  return matrix.map((value) => (value + 0.5) / matrix.length);
};

const bayer8 = buildBayer(bayerSide);

export const orderedDither = ({
  width,
  height,
  values,
}: Raster): Uint8Array => {
  const ink = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const level =
        bayer8[(y % bayerSide) * bayerSide + (x % bayerSide)] ?? 0.5;
      ink[index] = (values[index] ?? 0) / white < level ? 1 : 0;
    }
  }
  return ink;
};
