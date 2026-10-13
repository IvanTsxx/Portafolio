"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";
import { LinearMipmapLinearFilter, TextureLoader, Vector4 } from "three";
import type { Texture, Vector2, WebGLRenderer } from "three";

import type { SourceKind } from "@/components/lab/source/tone-chunk";
import { requestSceneFrame } from "@/components/scene/view-registry";

export interface StagePointer {
  x: number;
  y: number;
  isHovering: boolean;
}

export const trackStagePointer = (
  pointer: StagePointer,
  event: PointerEvent<HTMLElement>
) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  pointer.x = (event.clientX - bounds.left) / bounds.width;
  pointer.y = 1 - (event.clientY - bounds.top) / bounds.height;
  pointer.isHovering = true;
  requestSceneFrame();
};

export const releaseStagePointer = (pointer: StagePointer) => {
  pointer.isHovering = false;
  requestSceneFrame();
};

export const restingLight = { x: 0.24, y: 0.78 } as const;
const followRate = 9;

export const useDampedPointer = (
  pointer: RefObject<StagePointer>,
  animate: boolean
) => {
  const damped = useRef({ time: 0, x: restingLight.x, y: restingLight.y });

  useFrame((_, delta) => {
    const state = damped.current;
    const step = Math.min(delta, 0.05);
    if (animate) {
      state.time += step;
    }
    const { current: hover } = pointer;
    const target = hover.isHovering
      ? hover
      : {
          x: 0.5 + Math.sin(state.time * 0.4 - 1.3) * 0.32,
          y: 0.62 + Math.cos(state.time * 0.31) * 0.2,
        };
    const blend = animate ? 1 - Math.exp(-step * followRate) : 1;
    const isResting = !(animate || hover.isHovering);
    state.x += ((isResting ? restingLight.x : target.x) - state.x) * blend;
    state.y += ((isResting ? restingLight.y : target.y) - state.y) * blend;
  });

  return damped;
};

type PortraitTexture = Texture<HTMLImageElement>;

let portraitRequest: Promise<PortraitTexture> | null = null;

const requestPortrait = async () => {
  const texture = await new TextureLoader().loadAsync("/avatar");
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  return texture;
};

const loadPortrait = async () => {
  portraitRequest ??= requestPortrait();
  try {
    return await portraitRequest;
  } catch {
    portraitRequest = null;
    return null;
  }
};

export const usePortraitTexture = (isWanted: boolean) => {
  const [portrait, setPortrait] = useState<PortraitTexture | null>(null);

  useEffect(() => {
    if (!isWanted || portrait) {
      return;
    }
    let isCurrent = true;
    const resolve = async () => {
      const texture = await loadPortrait();
      if (isCurrent && texture) {
        setPortrait(texture);
        requestSceneFrame();
      }
    };
    void resolve();
    return () => {
      isCurrent = false;
    };
  }, [isWanted, portrait]);

  return portrait;
};

export interface SourceUniformTarget {
  uAspect: number;
  uHasPortrait: number;
  uLight: Vector2;
  uOrigin: Vector2;
  uPortrait: Texture | null;
  uPortraitSize: number;
  uResolution: Vector2;
  uSource: number;
}

const viewport = new Vector4();

export const syncSourceUniforms = (
  shader: SourceUniformTarget,
  renderer: WebGLRenderer,
  light: { x: number; y: number },
  portrait: PortraitTexture | null,
  source: SourceKind
) => {
  renderer.getCurrentViewport(viewport);
  const aspect = viewport.z / Math.max(viewport.w, 1);
  shader.uOrigin.set(viewport.x, viewport.y);
  shader.uResolution.set(viewport.z, viewport.w);
  shader.uAspect = aspect;
  shader.uLight.set((light.x - 0.5) * aspect, light.y - 0.5);
  shader.uSource = source === "portrait" ? 1 : 0;
  shader.uHasPortrait = portrait ? 1 : 0;
  shader.uPortrait = portrait;
  shader.uPortraitSize = portrait?.image.naturalHeight ?? 1;
};
