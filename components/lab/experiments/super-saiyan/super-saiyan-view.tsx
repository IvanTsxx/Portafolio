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
import { syncReveal } from "@/components/lab/source/stage-reveal";
import type { StageReveal } from "@/components/lab/source/stage-reveal";
import type { StagePointer } from "@/components/lab/source/use-source";
import { requestSceneFrame } from "@/components/scene/view-registry";

import { colorLinger, ditherShaderIndex, inkFor } from "./settings";
import type { SuperSaiyanSettings } from "./settings";
import { advanceStorm, createStorm } from "./storm";
import type { StormMode } from "./storm";
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
const shakeLength = 0.32;
const shakeCells = 2;
const auraReach = 11;

export interface KiPointer extends StagePointer {
  presses: number;
  strikes: number;
}

export interface SuperSaiyanViewProps {
  reveal: RefObject<StageReveal>;
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

const stormModeFor = (animate: boolean, isPaused: boolean): StormMode => {
  if (!animate) {
    return "still";
  }
  return isPaused ? "paused" : "running";
};

const SuperSaiyanView = ({
  reveal,
  settings,
  animate,
  pointer,
}: SuperSaiyanViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof SuperSaiyanMaterial>>(null);
  const live = useRef(settings);
  useEffect(() => {
    live.current = settings;
  }, [settings]);
  const motion = useRef({
    aura: {
      strength: createSpring(0),
      x: createSpring(0.62),
      y: createSpring(0.6),
    },
    burst: { age: Infinity, x: 0.5, y: 0.5 },
    handledPresses: 0,
    rain: settings.rainAmount,
    shakeX: 0,
    shakeY: 0,
    storm: createStorm(),
  });
  const isBlue = settings.dither === "blue-noise";
  const image = useStageTexture(imagePath, false);
  const blueNoise = useStageTexture(noisePath, true, isBlue);

  useFrame((_, delta) => {
    const state = motion.current;
    const { current } = live;
    const step = frameStep(delta);
    const { current: hover } = pointer;
    const mode = stormModeFor(animate, current.isPaused);
    const isMoving = mode === "running";

    advanceStorm(
      state.storm,
      {
        colorLinger: colorLinger(current.colorHold),
        frequency: current.frequency,
        intensity: current.intensity,
        isLightning: current.isLightning,
      },
      { mode, random: Math.random, requestedStrikes: hover.strikes, step }
    );

    state.rain = isMoving
      ? state.rain +
        (current.rainAmount - state.rain) * (1 - Math.exp(-step * rainRate))
      : current.rainAmount;

    const { aura, burst } = state;
    if (hover.presses !== state.handledPresses) {
      state.handledPresses = hover.presses;
      if (isMoving) {
        burst.age = 0;
        burst.x = hover.x;
        burst.y = hover.y;
        aura.strength.velocity += burstKick;
      }
    }
    if (mode === "still") {
      burst.age = Infinity;
    } else if (isMoving) {
      burst.age += step;
    }

    const shake =
      isMoving && burst.age < shakeLength
        ? (1 - burst.age / shakeLength) ** 2 * shakeCells
        : 0;
    state.shakeX = Math.round((Math.random() * 2 - 1) * shake);
    state.shakeY = Math.round((Math.random() * 2 - 1) * shake);

    const targetX = hover.isHovering ? hover.x : aura.x.value;
    const targetY = hover.isHovering ? hover.y : aura.y.value;
    driveSpring(aura.x, targetX, followSpring, step, animate);
    driveSpring(aura.y, targetY, followSpring, step, animate);
    driveSpring(
      aura.strength,
      hover.isHovering ? 1 : 0,
      auraSpring,
      step,
      isMoving
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
      const { current } = live;
      renderer.getCurrentViewport(viewport);
      const { aura, burst, rain, shakeX, shakeY, storm } = motion.current;
      const cell = current.cell * renderer.getPixelRatio();
      const ink = inkFor(current);
      shader.uOrigin.set(viewport.x, viewport.y);
      shader.uResolution.set(viewport.z, viewport.w);
      syncReveal(
        shader.uReveal,
        reveal.current,
        viewport.z,
        renderer.getPixelRatio()
      );
      shader.uCell = cell;
      shader.uThreshold = current.threshold;
      shader.uContrast = current.contrast;
      shader.uGamma = current.gamma;
      shader.uInvert = current.isInverted ? 1 : 0;
      shader.uInk.set(ink[0] / 255, ink[1] / 255, ink[2] / 255);
      shader.uTime = storm.time;
      shader.uRain = rain;
      shader.uRainSpeed = current.rainSpeed;
      shader.uRainSlant = Math.tan((current.rainAngle * Math.PI) / 180);
      shader.uFlash = storm.flash;
      shader.uColor = current.print === "retro" ? 1 : storm.color;
      shader.uStrikeSeed = storm.seed;
      shader.uShake.set(shakeX * cell, shakeY * cell);
      shader.uAura.set(aura.x.value * viewport.z, aura.y.value * viewport.w);
      shader.uAuraStrength =
        Math.max(aura.strength.value, 0) * current.auraStrength;
      shader.uAuraReach = auraReach / current.auraRadius ** 2;
      shader.uBurst.set(burst.x * viewport.z, burst.y * viewport.w);
      shader.uBurstAge = Number.isFinite(burst.age) ? burst.age : 10;
    };
  }, [reveal]);

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <SuperSaiyanMaterialElement
          key={SuperSaiyanMaterial.key}
          ref={material}
          toneMapped={false}
          uBlueNoise={blueNoise}
          uDither={
            isBlue && !blueNoise
              ? ditherShaderIndex("bayer-8")
              : ditherShaderIndex(settings.dither)
          }
          uHasImage={image ? 1 : 0}
          uImage={image}
        />
      </mesh>
    </>
  );
};

export default SuperSaiyanView;
