import { orderedDither } from "@/components/lab/source/ordered-dither";

export const toneCurve = {
  black: 0.04,
  contrast: 1.35,
  detail: 1.4,
  gamma: 1,
  white: 0.9,
} as const;

export interface ToneControls {
  contrast: number;
  gamma: number;
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export const curveTone = (
  luma: number,
  blurred: number,
  { contrast, gamma }: ToneControls = toneCurve
) => {
  const { black, detail, white } = toneCurve;
  const sharpened = luma + (luma - blurred) * detail;
  const level = clamp01((sharpened - black) / (white - black)) ** gamma;
  return clamp01((level - 0.5) * contrast + 0.5);
};

const glslFloat = (value: number) => value.toFixed(4);

export const toneChunk = `
  float curveTone(float luma, float blurred, float contrast, float gamma) {
    float sharpened = luma + (luma - blurred) * ${glslFloat(toneCurve.detail)};
    float level = pow(clamp((sharpened - ${glslFloat(toneCurve.black)}) / ${glslFloat(toneCurve.white - toneCurve.black)}, 0.0, 1.0), gamma);
    return clamp((level - 0.5) * contrast + 0.5, 0.0, 1.0);
  }

  vec3 curveColor(vec3 color, vec3 blurred, float contrast, float gamma) {
    return vec3(
      curveTone(color.r, blurred.r, contrast, gamma),
      curveTone(color.g, blurred.g, contrast, gamma),
      curveTone(color.b, blurred.b, contrast, gamma)
    );
  }
`;

export const rgbLuma = (rgb: Uint8Array) => {
  const luma = new Float32Array(Math.floor(rgb.length / 3));
  for (let index = 0; index < luma.length; index += 1) {
    luma[index] =
      (0.2126 * (rgb[index * 3] ?? 0) +
        0.7152 * (rgb[index * 3 + 1] ?? 0) +
        0.0722 * (rgb[index * 3 + 2] ?? 0)) /
      255;
  }
  return luma;
};

const boxBlur = (
  values: Float32Array,
  width: number,
  height: number,
  radius: number
) => {
  const blurred = new Float32Array(values.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let total = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const sampleX = Math.min(Math.max(x + dx, 0), width - 1);
          const sampleY = Math.min(Math.max(y + dy, 0), height - 1);
          total += values[sampleY * width + sampleX] ?? 0;
          count += 1;
        }
      }
      blurred[y * width + x] = total / count;
    }
  }
  return blurred;
};

export const ditherPrint = (
  luma: Float32Array,
  width: number,
  height: number
) => {
  const blurred = boxBlur(luma, width, height, 2);
  const values = luma.map(
    (value, index) => curveTone(value, blurred[index] ?? value) * 255
  );
  return orderedDither({ height, values, width });
};
