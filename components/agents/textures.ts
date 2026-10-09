import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NearestFilter,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

type Rgb = readonly [number, number, number];

const hexToRgb = (hex: string): Rgb => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

const wrap = (value: number, size: number) => ((value % size) + size) % size;

const createTexture = (
  size: number,
  paint: (x: number, y: number) => readonly [number, number, number, number],
  { color = true, pixelated = false, repeat = 1 } = {}
) => {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const [red, green, blue, alpha] = paint(x, y);
      const offset = (y * size + x) * 4;
      data[offset] = red;
      data[offset + 1] = green;
      data[offset + 2] = blue;
      data[offset + 3] = alpha;
    }
  }
  const texture = new DataTexture(data, size, size);
  texture.colorSpace = color ? SRGBColorSpace : NoColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.magFilter = pixelated ? NearestFilter : LinearFilter;
  texture.minFilter = pixelated ? NearestFilter : LinearMipmapLinearFilter;
  texture.generateMipmaps = !pixelated;
  texture.needsUpdate = true;
  return texture;
};

const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43_758.5453;
  return value - Math.floor(value);
};

const mix = (from: Rgb, to: Rgb, amount: number): Rgb => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
  from[2] + (to[2] - from[2]) * amount,
];

const plaidBase = hexToRgb("#d6c39a");
const plaidBand = hexToRgb("#8d7452");
const plaidLine = hexToRgb("#4b3b2b");
const plaidAccent = hexToRgb("#b5503c");

const plaidStrength = (coordinate: number) => {
  const cell = coordinate % 32;
  if (cell < 6) {
    return { accent: false, band: 0.75, line: false };
  }
  if (cell === 14 || cell === 15) {
    return { accent: false, band: 0, line: true };
  }
  if (cell === 23) {
    return { accent: true, band: 0, line: false };
  }
  return { accent: false, band: 0, line: false };
};

export const createPlaidTexture = (repeat = 2) =>
  createTexture(
    64,
    (x, y) => {
      const column = plaidStrength(x);
      const row = plaidStrength(y);
      let color = plaidBase;
      const band =
        Math.max(column.band, row.band) * 0.55 + column.band * row.band * 0.45;
      color = mix(color, plaidBand, band);
      if (column.line || row.line) {
        color = mix(color, plaidLine, column.line && row.line ? 0.8 : 0.55);
      }
      if (column.accent || row.accent) {
        color = mix(color, plaidAccent, 0.7);
      }
      const weave = (x + y) % 2 === 0 ? 1.04 : 0.96;
      return [color[0] * weave, color[1] * weave, color[2] * weave, 255];
    },
    { repeat }
  );

export const createTweedTexture = () => {
  const light = hexToRgb("#b59d7c");
  const dark = hexToRgb("#6f5a43");
  return createTexture(
    64,
    (x, y) => {
      const herringbone =
        wrap(x + (Math.floor(y / 4) % 2 === 0 ? y : -y), 8) < 4 ? 0.35 : 0.6;
      const color = mix(light, dark, herringbone * 0.6 + hash(x, y) * 0.4);
      return [color[0], color[1], color[2], 255];
    },
    { repeat: 3 }
  );
};

export const createKnitBumpTexture = () =>
  createTexture(
    64,
    (x, y) => {
      const rib = Math.abs(Math.sin(((x % 8) / 8) * Math.PI));
      const stitch = Math.abs(
        Math.sin((((y + (x % 8 < 4 ? 0 : 2)) % 4) / 4) * Math.PI)
      );
      const value = (rib * 0.65 + stitch * 0.35) * 230 + hash(x, y) * 25;
      return [value, value, value, 255];
    },
    { color: false, repeat: 3 }
  );

export const createGlyphTexture = () =>
  createTexture(
    32,
    (x, y) => {
      const row = Math.floor(y / 4);
      const inRow = y % 4 < 2;
      const lineLength = 8 + Math.floor(hash(row, 3) * 22);
      const gap = Math.floor(hash(row, 7) * 6) + 2;
      const lit =
        inRow && x > 2 && x < lineLength && (x - 3) % (gap + 3) < gap + 1;
      const value = lit ? 255 : 0;
      return [value, value, value, 255];
    },
    { pixelated: true }
  );

export const createRadialFadeTexture = () =>
  createTexture(
    128,
    (x, y) => {
      const dx = x / 127 - 0.5;
      const dy = y / 127 - 0.5;
      const distance = Math.min(1, Math.hypot(dx, dy) * 2);
      const falloff = (1 - distance) ** 1.6;
      const value = falloff * 255;
      return [value, value, value, 255];
    },
    { color: false }
  );
