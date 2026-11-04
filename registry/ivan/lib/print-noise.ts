export const hashChunk = `
  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }
`;

export const valueNoiseChunk = `
  float valueNoise(vec2 point) {
    vec2 whole = floor(point);
    vec2 part = fract(point);
    vec2 blend = part * part * (3.0 - 2.0 * part);
    return mix(
      mix(hash(whole), hash(whole + vec2(1.0, 0.0)), blend.x),
      mix(hash(whole + vec2(0.0, 1.0)), hash(whole + vec2(1.0, 1.0)), blend.x),
      blend.y
    );
  }
`;

export const bayerChunk = `
  float bayer2(vec2 cell) {
    cell = floor(cell);
    return fract(cell.x / 2.0 + cell.y * cell.y * 0.75);
  }

  float bayer4(vec2 cell) {
    return bayer2(0.5 * cell) * 0.25 + bayer2(cell);
  }

  float bayer8(vec2 cell) {
    return bayer4(0.5 * cell) * 0.25 + bayer2(cell) + 0.5 / 64.0;
  }
`;
