import { BufferAttribute, BufferGeometry } from "three";

export interface DustFocus {
  x: number;
  y: number;
}

export interface DustGrid {
  cols: number;
  rows: number;
}

export interface DustCrop {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface DustField {
  count: number;
  rows: number;
  positions: Float32Array;
  meta: Float32Array;
}

export const dustLimits = {
  maxCount: 160_000,
  minCellCss: 1.6,
  minCount: 8000,
} as const;

const lumaWeights = [0.2126, 0.7152, 0.0722] as const;
const hiddenCoverage = 0.035;

export const resolveDustCount = () => {
  if (typeof window === "undefined") {
    return 90_000;
  }
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  if (isCoarse || cores <= 4) {
    return 45_000;
  }
  return cores >= 10 ? 120_000 : 90_000;
};

export const budgetDustCount = (
  deviceCount: number,
  density: number,
  cssWidth: number,
  cssHeight: number
) => {
  const areaCap =
    (Math.max(cssWidth, 1) * Math.max(cssHeight, 1)) /
    dustLimits.minCellCss ** 2;
  const wanted = Math.min(deviceCount * Math.max(density, 0), areaCap);
  return Math.round(
    Math.min(Math.max(wanted, dustLimits.minCount), dustLimits.maxCount)
  );
};

export const planDustGrid = (count: number, aspect: number): DustGrid => {
  const safeAspect = Math.max(aspect, 0.01);
  const cols = Math.max(2, Math.round(Math.sqrt(count * safeAspect)));
  const rows = Math.max(2, Math.round(cols / safeAspect));
  return { cols, rows };
};

export const coverCrop = (
  imageWidth: number,
  imageHeight: number,
  aspect: number,
  focus: DustFocus
): DustCrop => {
  const imageAspect = imageWidth / imageHeight;
  const sw = aspect > imageAspect ? imageWidth : imageHeight * aspect;
  const sh = aspect > imageAspect ? imageWidth / aspect : imageHeight;
  const sx = Math.min(
    Math.max(focus.x * imageWidth - sw / 2, 0),
    imageWidth - sw
  );
  const sy = Math.min(
    Math.max(focus.y * imageHeight - sh / 2, 0),
    imageHeight - sh
  );
  return { sh, sw, sx, sy };
};

const seedAt = (index: number) => {
  const value = Math.sin(index * 12.9898 + 78.233) * 43_758.5453;
  return value - Math.floor(value);
};

export const buildDustField = (
  pixels: Uint8ClampedArray,
  { cols, rows }: DustGrid,
  isLitMark: boolean
): DustField => {
  const lumas = new Float32Array(cols * rows);
  for (let index = 0; index < cols * rows; index += 1) {
    const offset = index * 4;
    const alpha = (pixels[offset + 3] ?? 255) / 255;
    const luma =
      ((pixels[offset] ?? 0) * lumaWeights[0] +
        (pixels[offset + 1] ?? 0) * lumaWeights[1] +
        (pixels[offset + 2] ?? 0) * lumaWeights[2]) /
      255;
    lumas[index] = isLitMark ? luma * alpha : 1 - (1 - luma) * alpha;
  }
  const lumaAt = (x: number, y: number) =>
    lumas[
      Math.min(Math.max(y, 0), rows - 1) * cols +
        Math.min(Math.max(x, 0), cols - 1)
    ] ?? 0;

  const positions = new Float32Array(cols * rows * 3);
  const meta = new Float32Array(cols * rows * 2);
  let count = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const luma = lumaAt(x, y);
      const coverage = isLitMark ? luma : 1 - luma;
      if (coverage < hiddenCoverage) {
        continue;
      }
      const neighbors =
        (lumaAt(x - 1, y) +
          lumaAt(x + 1, y) +
          lumaAt(x, y - 1) +
          lumaAt(x, y + 1)) /
        4;
      positions[count * 3] = (x + 0.5) / cols;
      positions[count * 3 + 1] = 1 - (y + 0.5) / rows;
      positions[count * 3 + 2] = luma;
      meta[count * 2] = seedAt(y * cols + x);
      meta[count * 2 + 1] = Math.min(Math.abs(luma - neighbors) * 4, 1);
      count += 1;
    }
  }
  return {
    count,
    meta: meta.slice(0, count * 2),
    positions: positions.slice(0, count * 3),
    rows,
  };
};

export interface DustSampleRequest {
  image: HTMLImageElement;
  aspect: number;
  count: number;
  focus: DustFocus;
  isLitMark: boolean;
}

export const sampleDustField = ({
  image,
  aspect,
  count,
  focus,
  isLitMark,
}: DustSampleRequest): DustField | null => {
  const grid = planDustGrid(count, aspect);
  const canvas = document.createElement("canvas");
  canvas.width = grid.cols;
  canvas.height = grid.rows;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }
  const crop = coverCrop(
    image.naturalWidth,
    image.naturalHeight,
    aspect,
    focus
  );
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    0,
    0,
    grid.cols,
    grid.rows
  );
  try {
    const { data } = context.getImageData(0, 0, grid.cols, grid.rows);
    return buildDustField(data, grid, isLitMark);
  } catch {
    return null;
  }
};

export const createDustGeometry = (field: DustField) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(field.positions, 3));
  geometry.setAttribute("aMeta", new BufferAttribute(field.meta, 2));
  return geometry;
};
