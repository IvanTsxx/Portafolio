export interface StageImage {
  focus: { x: number; y: number };
  height: number;
  path: string;
  width: number;
}

export const sourceImages = {
  clouds: {
    focus: { x: 0.5, y: 0.5 },
    height: 650,
    path: "/experiments/sources/clouds.jpg",
    width: 488,
  },
  ippo: {
    focus: { x: 0.5, y: 0.3 },
    height: 736,
    path: "/experiments/sources/ippo.jpg",
    width: 736,
  },
  messi: {
    focus: { x: 0.55, y: 0.35 },
    height: 640,
    path: "/experiments/sources/messi.jpg",
    width: 640,
  },
  rocky: {
    focus: { x: 0.55, y: 0.3 },
    height: 1024,
    path: "/experiments/sources/rocky.jpg",
    width: 576,
  },
  vegeta: {
    focus: { x: 0.45, y: 0.42 },
    height: 1024,
    path: "/experiments/sources/vegeta.jpg",
    width: 991,
  },
} as const satisfies Record<string, StageImage>;

export type SourceImage = keyof typeof sourceImages;

export const imageSourceOptions = [
  { label: "Ippo", value: "ippo" },
  { label: "Vegeta", value: "vegeta" },
  { label: "Messi", value: "messi" },
  { label: "Rocky", value: "rocky" },
  { label: "Clouds", value: "clouds" },
] as const satisfies readonly { label: string; value: SourceImage }[];
