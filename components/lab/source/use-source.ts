"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";
import {
  LinearMipmapLinearFilter,
  NearestFilter,
  RepeatWrapping,
  TextureLoader,
  Vector4,
} from "three";
import type { Texture, Vector2, WebGLRenderer } from "three";

import { sourceImages } from "@/components/lab/source/tone-chunk";
import type { SourceImage } from "@/components/lab/source/tone-chunk";
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

const textureRequests = new Map<SourceImage, Promise<PortraitTexture>>();

const requestTexture = async (image: SourceImage) => {
  const texture = await new TextureLoader().loadAsync(sourceImages[image].path);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  return texture;
};

const loadTexture = async (image: SourceImage) => {
  const pending = textureRequests.get(image) ?? requestTexture(image);
  textureRequests.set(image, pending);
  try {
    return await pending;
  } catch {
    textureRequests.delete(image);
    return null;
  }
};

export const useSourceTexture = (source: SourceImage) => {
  const [loaded, setLoaded] = useState<{
    image: SourceImage;
    texture: PortraitTexture;
  } | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const resolve = async () => {
      const texture = await loadTexture(source);
      if (isCurrent && texture) {
        setLoaded({ image: source, texture });
        requestSceneFrame();
      }
    };
    void resolve();
    return () => {
      isCurrent = false;
    };
  }, [source]);

  return loaded && loaded.image === source ? loaded.texture : null;
};

let noiseRequest: Promise<Texture> | null = null;

const requestNoise = async () => {
  const texture = await new TextureLoader().loadAsync(
    "/experiments/blue-noise-64.png"
  );
  texture.generateMipmaps = false;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
};

const loadNoise = async () => {
  noiseRequest ??= requestNoise();
  try {
    return await noiseRequest;
  } catch {
    noiseRequest = null;
    return null;
  }
};

export const useBlueNoiseTexture = () => {
  const [noise, setNoise] = useState<Texture | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const resolve = async () => {
      const texture = await loadNoise();
      if (isCurrent && texture) {
        setNoise(texture);
        requestSceneFrame();
      }
    };
    void resolve();
    return () => {
      isCurrent = false;
    };
  }, []);

  return noise;
};

export const usePointerSpeed = (
  light: RefObject<{ x: number; y: number }>,
  animate: boolean
) => {
  const speed = useRef({ kick: 0, x: 0, y: 0 });

  useFrame((_, delta) => {
    const state = speed.current;
    const step = Math.max(Math.min(delta, 0.05), 0.001);
    const { x, y } = light.current;
    const velocity = Math.hypot(x - state.x, y - state.y) / step;
    state.x = x;
    state.y = y;
    const target = animate ? Math.min(velocity / 2.5, 1) : 0;
    const rate = target > state.kick ? 14 : 3;
    state.kick += (target - state.kick) * (1 - Math.exp(-rate * step));
  });

  return speed;
};

export interface SourceUniformTarget {
  uAspect: number;
  uHasPortrait: number;
  uLight: Vector2;
  uOrigin: Vector2;
  uPortrait: Texture | null;
  uPortraitAspect: number;
  uPortraitFocus: Vector2;
  uPortraitSize: number;
  uResolution: Vector2;
}

const viewport = new Vector4();

export const syncSourceUniforms = (
  shader: SourceUniformTarget,
  renderer: WebGLRenderer,
  light: { x: number; y: number },
  portrait: PortraitTexture | null,
  source: SourceImage
) => {
  renderer.getCurrentViewport(viewport);
  const aspect = viewport.z / Math.max(viewport.w, 1);
  shader.uOrigin.set(viewport.x, viewport.y);
  shader.uResolution.set(viewport.z, viewport.w);
  shader.uAspect = aspect;
  shader.uLight.set((light.x - 0.5) * aspect, light.y - 0.5);
  shader.uHasPortrait = portrait ? 1 : 0;
  shader.uPortrait = portrait;
  shader.uPortraitSize = portrait?.image.naturalHeight ?? 1;
  const { focus } = sourceImages[source];
  shader.uPortraitFocus.set(focus.x, 1 - focus.y);
  shader.uPortraitAspect = portrait
    ? portrait.image.naturalWidth / Math.max(portrait.image.naturalHeight, 1)
    : 1;
};
