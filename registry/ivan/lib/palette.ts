export type Rgb = readonly [number, number, number];

export const paletteSize = 12;

interface Box {
  pixels: Rgb[];
  channel: 0 | 1 | 2;
  range: number;
}

const channels = [0, 1, 2] as const;

const measure = (pixels: Rgb[]): Box => {
  let channel: 0 | 1 | 2 = 0;
  let range = -1;
  for (const index of channels) {
    let low = 255;
    let high = 0;
    for (const pixel of pixels) {
      low = Math.min(low, pixel[index]);
      high = Math.max(high, pixel[index]);
    }
    if (high - low > range) {
      range = high - low;
      channel = index;
    }
  }
  return { channel, pixels, range };
};

const splitPriority = (box: Box) => box.range * Math.sqrt(box.pixels.length);

const average = (pixels: Rgb[]): Rgb => {
  let red = 0;
  let green = 0;
  let blue = 0;
  for (const pixel of pixels) {
    red += pixel[0];
    green += pixel[1];
    blue += pixel[2];
  }
  return [
    Math.round(red / pixels.length),
    Math.round(green / pixels.length),
    Math.round(blue / pixels.length),
  ];
};

const chromaWeight = 6;

const chromaOf = (pixel: Rgb) => Math.max(...pixel) - Math.min(...pixel);

const lumaOf = ([red, green, blue]: Rgb) =>
  0.2126 * red + 0.7152 * green + 0.0722 * blue;

const inkSaturation = 1.55;
const inkContrast = 1.18;

const clampChannel = (value: number) =>
  Math.round(Math.min(Math.max(value, 0), 255));

const printInk = (color: Rgb): Rgb => {
  const luma = lumaOf(color);
  const printed = (luma - 128) * inkContrast + 128;
  return [
    clampChannel(printed + (color[0] - luma) * inkSaturation),
    clampChannel(printed + (color[1] - luma) * inkSaturation),
    clampChannel(printed + (color[2] - luma) * inkSaturation),
  ];
};

export const extractPalette = (rgb: Uint8Array, size = paletteSize) => {
  const pixels: Rgb[] = [];
  for (let offset = 0; offset + 2 < rgb.length; offset += 3) {
    const pixel: Rgb = [
      rgb[offset] ?? 0,
      rgb[offset + 1] ?? 0,
      rgb[offset + 2] ?? 0,
    ];
    const copies = 1 + Math.round((chromaOf(pixel) / 255) * chromaWeight);
    for (let copy = 0; copy < copies; copy += 1) {
      pixels.push(pixel);
    }
  }
  const boxes = [measure(pixels)];
  while (boxes.length < size) {
    let widest = 0;
    for (const [index, box] of boxes.entries()) {
      const current = boxes[widest];
      if (current && splitPriority(box) > splitPriority(current)) {
        widest = index;
      }
    }
    const box = boxes[widest];
    if (!box || box.pixels.length < 2 || box.range === 0) {
      break;
    }
    const sorted = box.pixels.toSorted(
      (first, second) =>
        first[box.channel] - second[box.channel] ||
        lumaOf(first) - lumaOf(second)
    );
    const middle = Math.floor(sorted.length / 2);
    boxes.splice(
      widest,
      1,
      measure(sorted.slice(0, middle)),
      measure(sorted.slice(middle))
    );
  }
  return boxes
    .map((box) => printInk(average(box.pixels)))
    .toSorted((first, second) => lumaOf(first) - lumaOf(second));
};

const sampleColumns = 120;

const greyRamp = Array.from({ length: paletteSize }, (_, step): Rgb => {
  const level = Math.round((step / (paletteSize - 1)) * 255);
  return [level, level, level];
});

const padPalette = (palette: readonly Rgb[]) => {
  const last = palette.at(-1);
  if (!last) {
    return greyRamp;
  }
  return Array.from(
    { length: paletteSize },
    (_, index) => palette[index] ?? last
  );
};

export const samplePalette = (image: HTMLImageElement): readonly Rgb[] => {
  if (image.naturalWidth === 0) {
    return greyRamp;
  }
  const rows = Math.max(
    Math.round((sampleColumns * image.naturalHeight) / image.naturalWidth),
    1
  );
  try {
    const canvas = document.createElement("canvas");
    canvas.width = sampleColumns;
    canvas.height = rows;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return greyRamp;
    }
    context.drawImage(image, 0, 0, sampleColumns, rows);
    const { data } = context.getImageData(0, 0, sampleColumns, rows);
    const rgb = new Uint8Array((data.length / 4) * 3);
    for (let index = 0; index < data.length / 4; index += 1) {
      rgb[index * 3] = data[index * 4] ?? 0;
      rgb[index * 3 + 1] = data[index * 4 + 1] ?? 0;
      rgb[index * 3 + 2] = data[index * 4 + 2] ?? 0;
    }
    return padPalette(extractPalette(rgb));
  } catch {
    return greyRamp;
  }
};
