import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter } from "three";

import { maxImpressions } from "./stamp-pad";

export const rowHeight = 96;
export const atlasWidth = 512;

const fontSize = 50;
const sidePadding = 26;
const frameInset = 9;
const frameWeight = 5;
const ruleGap = 6;

export interface StampAtlas {
  texture: CanvasTexture;
  aspects: Float32Array;
  draw: (slot: number, text: string) => void;
  dispose: () => void;
}

const monoFont = () => {
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-geist-mono")
      .trim() || "monospace";
  return `600 ${fontSize}px ${family}`;
};

export const loadStampFont = () => document.fonts.load(monoFont(), "AZ09");

export const createStampAtlas = (): StampAtlas => {
  const canvas = document.createElement("canvas");
  canvas.width = atlasWidth;
  canvas.height = rowHeight * maxImpressions;
  const context = canvas.getContext("2d");
  const texture = new CanvasTexture(canvas);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  const aspects = new Float32Array(maxImpressions).fill(1);

  const draw = (slot: number, text: string) => {
    if (!context) {
      return;
    }
    const top = slot * rowHeight;
    context.fillStyle = "#000";
    context.fillRect(0, top, atlasWidth, rowHeight);
    context.font = monoFont();
    context.textBaseline = "middle";
    context.textAlign = "left";
    const label = text.trim().toUpperCase() || " ";
    const textWidth = context.measureText(label).width;
    const stampWidth = Math.min(
      Math.ceil(textWidth + sidePadding * 2),
      atlasWidth
    );
    context.fillStyle = "#fff";
    context.fillText(label, sidePadding, top + rowHeight * 0.53, atlasWidth);
    context.strokeStyle = "#fff";
    context.lineWidth = frameWeight;
    context.strokeRect(
      frameInset,
      top + frameInset,
      stampWidth - frameInset * 2,
      rowHeight - frameInset * 2
    );
    context.lineWidth = 1.5;
    context.strokeRect(
      frameInset + ruleGap,
      top + frameInset + ruleGap,
      stampWidth - (frameInset + ruleGap) * 2,
      rowHeight - (frameInset + ruleGap) * 2
    );
    aspects[slot] = stampWidth / rowHeight;
    texture.needsUpdate = true;
  };

  return {
    aspects,
    dispose: () => texture.dispose(),
    draw,
    texture,
  };
};
