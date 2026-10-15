"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  LinearMipmapLinearFilter,
  NearestFilter,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader,
  Vector4,
} from "three";
import type { Mesh, Texture, WebGLRenderer } from "three";

import {
  createSpring,
  driveSpring,
  frameStep,
} from "@/components/lab/source/spring";
import type { StagePointer } from "@/components/lab/source/use-source";
import { requestSceneFrame } from "@/components/scene/view-registry";

import { flashEnvelope, firstStrikeAt, nextStrikeGap } from "./storm";
import { SuperSaiyanMaterial } from "./super-saiyan-material";

const SuperSaiyanMaterialElement = extend(SuperSaiyanMaterial);

const quad = new PlaneGeometry(1, 1);
const viewport = new Vector4();
const imagePath = "/experiments/super-saiyan.jpg";
const noisePath = "/experiments/blue-noise-64.png";

const followSpring = { damping: 16, stiffness: 120 } as const;
const auraSpring = { damping: 10, stiffness: 85 } as const;
const burstKick = 7;
const rainRate = 4;

export type DitherKind = "bayer" | "blue-noise";

export interface SuperSaiyanSettings {
  cell: number;
  threshold: number;
  dither: DitherKind;
  rain: boolean;
  lightning: boolean;
}

export interface KiPointer extends StagePointer {
  presses: number;
}

export interface SuperSaiyanViewProps {
  settings: SuperSaiyanSettings;
  animate: boolean;
  pointer: RefObject<KiPointer>;
}

const requestTexture = async (path: string, isTile: boolean) => {
  const texture = await new TextureLoader().loadAsync(path);
  if (isTile) {
    texture.generateMipmaps = false;
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  } else {
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipmapLinearFilter;
  }
  return texture;
};

const textureRequests = new Map<string, Promise<Texture>>();

const loadTexture = async (path: string, isTile: boolean) => {
  const pending = textureRequests.get(path) ?? requestTexture(path, isTile);
  textureRequests.set(path, pending);
  try {
    return await pending;
  } catch {
    textureRequests.delete(path);
    return null;
  }
};

const useStageTexture = (path: string, isTile: boolean, isWanted = true) => {
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect(() => {
    if (!isWanted || texture) {
      return;
    }
    let isCurrent = true;
    const resolve = async () => {
      const loaded = await loadTexture(path, isTile);
      if (isCurrent && loaded) {
        setTexture(loaded);
        requestSceneFrame();
      }
    };
    void resolve();
    return () => {
      isCurrent = false;
    };
  }, [isTile, isWanted, path, texture]);
  return texture;
};

const SuperSaiyanView = ({
  settings,
  animate,
  pointer,
}: SuperSaiyanViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof SuperSaiyanMaterial>>(null);
  const motion = useRef({
    aura: {
      strength: createSpring(0),
      x: createSpring(0.62),
      y: createSpring(0.6),
    },
    burst: { age: Infinity, x: 0.5, y: 0.5 },
    flash: 0,
    handledPresses: 0,
    nextStrike: firstStrikeAt,
    rain: 1,
    strikeAt: -Infinity,
    time: 0,
  });
  const isBlue = settings.dither === "blue-noise";
  const image = useStageTexture(imagePath, false);
  const blueNoise = useStageTexture(noisePath, true, isBlue);

  useFrame((_, delta) => {
    const state = motion.current;
    const step = frameStep(delta);
    const { current: hover } = pointer;
    if (animate) {
      state.time += step;
    }

    const rainTarget = settings.rain ? 1 : 0;
    state.rain = animate
      ? state.rain +
        (rainTarget - state.rain) * (1 - Math.exp(-step * rainRate))
      : rainTarget;

    if (animate && settings.lightning && state.time >= state.nextStrike) {
      state.strikeAt = state.time;
      state.nextStrike = state.time + nextStrikeGap(Math.random());
    }
    state.flash =
      animate && settings.lightning
        ? flashEnvelope(state.time - state.strikeAt)
        : 0;

    const { aura, burst } = state;
    if (hover.presses !== state.handledPresses) {
      state.handledPresses = hover.presses;
      if (animate) {
        burst.age = 0;
        burst.x = hover.x;
        burst.y = hover.y;
        aura.strength.velocity += burstKick;
      }
    }
    burst.age = animate ? burst.age + step : Infinity;

    const targetX = hover.isHovering ? hover.x : aura.x.value;
    const targetY = hover.isHovering ? hover.y : aura.y.value;
    driveSpring(aura.x, targetX, followSpring, step, animate);
    driveSpring(aura.y, targetY, followSpring, step, animate);
    driveSpring(
      aura.strength,
      hover.isHovering ? 1 : 0,
      auraSpring,
      step,
      animate
    );
  });

  useEffect(() => {
    const plane = mesh.current;
    if (!plane) {
      return;
    }
    plane.onBeforeRender = (renderer: WebGLRenderer) => {
      const shader = material.current;
      if (!shader) {
        return;
      }
      renderer.getCurrentViewport(viewport);
      const { aura, burst, flash, rain, time } = motion.current;
      shader.uOrigin.set(viewport.x, viewport.y);
      shader.uResolution.set(viewport.z, viewport.w);
      shader.uCell = settings.cell * renderer.getPixelRatio();
      shader.uThreshold = settings.threshold;
      shader.uTime = time;
      shader.uRain = rain;
      shader.uFlash = flash;
      shader.uAura.set(aura.x.value * viewport.z, aura.y.value * viewport.w);
      shader.uAuraStrength = Math.max(aura.strength.value, 0);
      shader.uBurst.set(burst.x * viewport.z, burst.y * viewport.w);
      shader.uBurstAge = Number.isFinite(burst.age) ? burst.age : 10;
    };
  }, [settings.cell, settings.threshold]);

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <SuperSaiyanMaterialElement
          key={SuperSaiyanMaterial.key}
          ref={material}
          toneMapped={false}
          uBlue={isBlue && blueNoise ? 1 : 0}
          uBlueNoise={blueNoise}
          uHasImage={image ? 1 : 0}
          uImage={image}
        />
      </mesh>
    </>
  );
};

export default SuperSaiyanView;
