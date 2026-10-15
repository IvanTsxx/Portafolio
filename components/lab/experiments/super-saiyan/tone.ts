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
