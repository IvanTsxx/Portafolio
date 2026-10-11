"use client";

import type { ThreeElements } from "@react-three/fiber";
import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  PlaneGeometry,
  SRGBColorSpace,
} from "three";

interface LabelTexture {
  aspect: number;
  texture: CanvasTexture;
}

const labelTextures = new Map<string, LabelTexture>();
const glyphPixels = 64;
const paddingPixels = 6;
const planeGeometry = new PlaneGeometry(1, 1);
const origin = [0, 0, 0] as const;

const monoFamily = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--font-geist-mono")
    .trim() || "ui-monospace, monospace";

const paint = (canvas: HTMLCanvasElement, text: string, color: string) => {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  const font = `500 ${glyphPixels}px ${monoFamily()}`;
  context.font = font;
  context.letterSpacing = "6px";
  const width = Math.ceil(context.measureText(text).width) + paddingPixels * 2;
  canvas.width = width;
  canvas.height = Math.round(glyphPixels * 1.25);
  context.font = font;
  context.letterSpacing = "6px";
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.fillText(text, paddingPixels, canvas.height / 2);
};

const repaintWhenFontsLoad = async (
  canvas: HTMLCanvasElement,
  text: string,
  color: string,
  label: LabelTexture
) => {
  await document.fonts.ready;
  paint(canvas, text, color);
  label.aspect = canvas.width / canvas.height;
  label.texture.needsUpdate = true;
};

const labelTexture = (text: string, color: string) => {
  const key = `${color}|${text}`;
  const cached = labelTextures.get(key);
  if (cached) {
    return cached;
  }
  const canvas = document.createElement("canvas");
  paint(canvas, text, color);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  const label = { aspect: canvas.width / canvas.height, texture };
  labelTextures.set(key, label);
  void repaintWhenFontsLoad(canvas, text, color, label);
  return label;
};

type MeshProps = Omit<ThreeElements["mesh"], "geometry" | "position" | "scale">;

export interface SceneLabelProps extends MeshProps {
  text: string;
  color: string;
  height: number;
  maxWidth?: number;
  align?: "start" | "center";
  position?: readonly [number, number, number];
}

export const SceneLabel = ({
  text,
  color,
  height,
  maxWidth = Number.POSITIVE_INFINITY,
  align = "start",
  position = origin,
  ...props
}: SceneLabelProps) => {
  const { aspect, texture } = labelTexture(text.toUpperCase(), color);
  const width = Math.min(height * aspect, maxWidth);
  const fittedHeight = width / aspect;
  const [x, y, z] = position;

  return (
    <mesh
      {...props}
      geometry={planeGeometry}
      position={[align === "start" ? x + width / 2 : x, y, z]}
      raycast={() => null}
      scale={[width, fittedHeight, 1]}
    >
      <meshBasicMaterial
        depthWrite={false}
        map={texture}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
};
