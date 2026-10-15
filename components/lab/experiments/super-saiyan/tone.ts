export const toneCurve = {
  black: 0.04,
  contrast: 1.35,
  detail: 1.4,
  gamma: 1,
  white: 0.9,
} as const;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export const curveTone = (luma: number, blurred: number) => {
  const { black, contrast, detail, gamma, white } = toneCurve;
  const sharpened = luma + (luma - blurred) * detail;
  const level = clamp01((sharpened - black) / (white - black)) ** gamma;
  return clamp01((level - 0.5) * contrast + 0.5);
};

const glslFloat = (value: number) => value.toFixed(4);

export const toneChunk = `
  float curveTone(float luma, float blurred) {
    float sharpened = luma + (luma - blurred) * ${glslFloat(toneCurve.detail)};
    float level = pow(clamp((sharpened - ${glslFloat(toneCurve.black)}) / ${glslFloat(toneCurve.white - toneCurve.black)}, 0.0, 1.0), ${glslFloat(toneCurve.gamma)});
    return clamp((level - 0.5) * ${glslFloat(toneCurve.contrast)} + 0.5, 0.0, 1.0);
  }
`;
