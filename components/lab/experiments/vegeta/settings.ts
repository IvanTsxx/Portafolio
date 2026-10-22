import type { OrderedDither } from "@/components/lab/source/ordered-print";
import { sourceImages } from "@/components/lab/source/tone-chunk";

export const vegetaImage = sourceImages.vegeta;

export const majinMark = {
  center: { x: 0.405, y: 0.285 },
  radius: { x: 0.085, y: 0.065 },
} as const;

export const paletteSample = { columns: 97, rows: 100 } as const;

export interface VegetaSettings {
  dither: OrderedDither;
  cell: number;
  threshold: number;
  auraRadius: number;
}

export const defaultSettings: VegetaSettings = {
  auraRadius: 1,
  cell: 3,
  dither: "blue-noise",
  threshold: 0,
};
