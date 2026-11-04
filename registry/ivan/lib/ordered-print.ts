export const orderedDithers = [
  "bayer-2",
  "bayer-4",
  "bayer-8",
  "blue-noise",
] as const;

export type OrderedDither = (typeof orderedDithers)[number];

export const orderedDitherIndex = (mode: OrderedDither) =>
  orderedDithers.indexOf(mode);

export const orderedChunk = `
  uniform sampler2D uBlueNoise;
  uniform float uNoiseSize;
  uniform float uDither;

  float orderedLevel(vec2 cell) {
    if (uDither < 0.5) {
      return bayer2(cell) + 0.125;
    }
    if (uDither < 1.5) {
      return bayer4(cell) + 0.5 / 16.0;
    }
    if (uDither < 2.5) {
      return bayer8(cell);
    }
    return texture(uBlueNoise, (cell + 0.5) / uNoiseSize).r;
  }

  vec3 toLinear(vec3 color) {
    return mix(
      color / 12.92,
      pow((color + 0.055) / 1.055, vec3(2.4)),
      step(vec3(0.04045), color)
    );
  }
`;

export const nearestInkChunk = (size: number) => `
  uniform vec3 uPalette[${size}];

  vec3 nearestInk(vec3 color) {
    vec3 best = uPalette[0];
    float bestGap = 1e9;
    for (int index = 0; index < ${size}; index++) {
      vec3 difference = (color - uPalette[index]) * vec3(0.9, 1.2, 0.7);
      float gap = dot(difference, difference);
      if (gap < bestGap) {
        bestGap = gap;
        best = uPalette[index];
      }
    }
    return best;
  }
`;
