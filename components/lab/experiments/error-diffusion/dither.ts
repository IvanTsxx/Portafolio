export const diffusionNames = [
  "floyd-steinberg",
  "atkinson",
  "jarvis",
  "sierra",
] as const;

export type DiffusionName = (typeof diffusionNames)[number];

type Tap = readonly [dx: number, dy: number, weight: number];

interface DiffusionKernel {
  label: string;
  title: string;
  divisor: number;
  taps: readonly Tap[];
}

export const diffusionKernels = {
  atkinson: {
    divisor: 8,
    label: "Atkinson",
    taps: [
      [1, 0, 1],
      [2, 0, 1],
      [-1, 1, 1],
      [0, 1, 1],
      [1, 1, 1],
      [0, 2, 1],
    ],
    title: "Atkinson",
  },
  "floyd-steinberg": {
    divisor: 16,
    label: "Floyd",
    taps: [
      [1, 0, 7],
      [-1, 1, 3],
      [0, 1, 5],
      [1, 1, 1],
    ],
    title: "Floyd–Steinberg",
  },
  jarvis: {
    divisor: 48,
    label: "Jarvis",
    taps: [
      [1, 0, 7],
      [2, 0, 5],
      [-2, 1, 3],
      [-1, 1, 5],
      [0, 1, 7],
      [1, 1, 5],
      [2, 1, 3],
      [-2, 2, 1],
      [-1, 2, 3],
      [0, 2, 5],
      [1, 2, 3],
      [2, 2, 1],
    ],
    title: "Jarvis–Judice–Ninke",
  },
  sierra: {
    divisor: 32,
    label: "Sierra",
    taps: [
      [1, 0, 5],
      [2, 0, 3],
      [-2, 1, 2],
      [-1, 1, 4],
      [0, 1, 5],
      [1, 1, 4],
      [2, 1, 2],
      [-1, 2, 2],
      [0, 2, 3],
      [1, 2, 2],
    ],
    title: "Sierra",
  },
} as const satisfies Record<DiffusionName, DiffusionKernel>;

export interface Raster {
  width: number;
  height: number;
  values: Float32Array;
}

export interface ToneSettings {
  contrast: number;
  threshold: number;
}

const midGray = 128;
const white = 255;

export const applyTone = (
  raster: Raster,
  { contrast, threshold }: ToneSettings
): Raster => {
  const bias = midGray - threshold;
  const values = new Float32Array(raster.values.length);
  for (let index = 0; index < values.length; index += 1) {
    const shifted =
      ((raster.values[index] ?? 0) - midGray) * contrast + midGray + bias;
    values[index] = Math.min(Math.max(shifted, 0), white);
  }
  return { height: raster.height, values, width: raster.width };
};

const margin = 2;

export const diffuse = (
  { width, height, values }: Raster,
  name: DiffusionName,
  serpentine: boolean
): Uint8Array => {
  const { divisor } = diffusionKernels[name];
  const taps: readonly Tap[] = diffusionKernels[name].taps;
  const stride = width + margin * 2;
  const forward = Int32Array.from(taps, ([dx, dy]) => dy * stride + dx);
  const mirrored = Int32Array.from(taps, ([dx, dy]) => dy * stride - dx);
  const weights = Float32Array.from(taps, (tap) => tap[2] / divisor);
  const error = new Float32Array(stride * (height + margin));
  for (let y = 0; y < height; y += 1) {
    error.set(values.subarray(y * width, (y + 1) * width), y * stride + margin);
  }
  const ink = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const isReversed = serpentine && y % 2 === 1;
    const offsets = isReversed ? mirrored : forward;
    for (let step = 0; step < width; step += 1) {
      const x = isReversed ? width - 1 - step : step;
      const cell = y * stride + x + margin;
      const value = error[cell] ?? 0;
      const isPaper = value >= midGray;
      ink[y * width + x] = isPaper ? 0 : 1;
      const residual = value - (isPaper ? white : 0);
      for (let tap = 0; tap < offsets.length; tap += 1) {
        const target = cell + (offsets[tap] ?? 0);
        error[target] = (error[target] ?? 0) + residual * (weights[tap] ?? 0);
      }
    }
  }
  return ink;
};

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

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

const light = { x: -0.48, y: -0.62, z: 0.62 } as const;
const lightLength = Math.hypot(light.x, light.y, light.z);

export const sphereRaster = (width: number, height: number): Raster => {
  const values = new Float32Array(width * height);
  const unit = Math.min(width, height);
  const center = { x: width * 0.5, y: height * 0.46 };
  const radius = unit * 0.36;
  const floorLine = center.y + radius * 0.92;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = (x + 0.5 - center.x) / radius;
      const ny = (y + 0.5 - center.y) / radius;
      const reach = nx * nx + ny * ny;
      let tone: number;
      if (reach <= 1) {
        const nz = Math.sqrt(1 - reach);
        const lambert = Math.max(
          (nx * light.x + ny * light.y + nz * light.z) / lightLength,
          0
        );
        const rim = (1 - nz) ** 3 * 0.18;
        const highlight = lambert ** 24 * 0.5;
        tone = 0.06 + lambert * 0.78 + rim + highlight;
      } else {
        const depth = (y + 0.5 - floorLine) / (height - floorLine);
        const wall = 0.38 + ((y + 0.5) / height) * 0.16;
        const shadowX = (x + 0.5 - center.x - radius * 0.35) / (radius * 1.25);
        const shadowY = (y + 0.5 - floorLine) / (radius * 0.28);
        const shadow =
          y + 0.5 > floorLine
            ? 1 - smoothstep(0, 1, Math.hypot(shadowX, shadowY))
            : 0;
        const floorTone = 0.78 - Math.min(depth, 1) * 0.16;
        tone = (y + 0.5 > floorLine ? floorTone : wall) - shadow * 0.6;
      }
      values[y * width + x] = Math.min(Math.max(tone, 0), 1) * white;
    }
  }
  return { height, values, width };
};

export const rampRaster = (width: number, height: number): Raster => {
  const values = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const tone = (y + 0.5) / height;
    values.fill(tone * white, y * width, (y + 1) * width);
  }
  return { height, values, width };
};
