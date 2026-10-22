export const printChunk = `
  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  float bayer2(vec2 cell) {
    cell = floor(cell);
    return fract(cell.x / 2.0 + cell.y * cell.y * 0.75);
  }

  float bayer4(vec2 cell) {
    return bayer2(0.5 * cell) * 0.25 + bayer2(cell);
  }

  float bayer8(vec2 cell) {
    return bayer4(0.5 * cell) * 0.25 + bayer2(cell);
  }
`;
