import {
  BoxGeometry,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";

import { createRadialFadeTexture } from "@/components/agents/textures";

export const sceneColors = {
  graphite: "#5f5e5a",
  ink: "#1b1b1b",
  paper: "#f8f7f3",
  paperDeep: "#dddbd5",
  rule: "#c3c1ba",
  vermilion: "#e0472c",
} as const;

const matte = (color: string) =>
  new MeshStandardMaterial({ color, roughness: 0.82 });

export const sceneMaterials = {
  graphite: matte(sceneColors.graphite),
  ink: new MeshStandardMaterial({ color: sceneColors.ink, roughness: 0.5 }),
  paper: matte(sceneColors.paper),
  paperDeep: matte(sceneColors.paperDeep),
  rule: matte(sceneColors.rule),
  vermilion: new MeshStandardMaterial({
    color: sceneColors.vermilion,
    roughness: 0.6,
  }),
} as const;

export type SceneMaterialName = keyof typeof sceneMaterials;

export const boxGeometry = new BoxGeometry(1, 1, 1);

export const blobMaterial = new MeshBasicMaterial({
  alphaMap: createRadialFadeTexture(),
  color: "#3b2a1f",
  depthWrite: false,
  opacity: 0.2,
  toneMapped: false,
  transparent: true,
});

export const clamp01 = (value: number) => MathUtils.clamp(value, 0, 1);

export const progressBetween = (time: number, from: number, to: number) =>
  clamp01((time - from) / (to - from));

export const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

export const easeOutBack = (value: number) => {
  const overshoot = 1.7;
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
};

export const popScale = (time: number, appearAt: number, vanishAt: number) =>
  easeOutBack(progressBetween(time, appearAt, appearAt + 0.35)) *
  (1 - easeInOutCubic(progressBetween(time, vanishAt, vanishAt + 0.3)));
