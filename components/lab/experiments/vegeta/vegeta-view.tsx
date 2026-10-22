"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { PlaneGeometry, Vector4 } from "three";
import type { Mesh, WebGLRenderer } from "three";

import { orderedDitherIndex } from "@/components/lab/source/ordered-print";
import {
  createSpring,
  driveSpring,
  frameStep,
} from "@/components/lab/source/spring";
import { originalUniform } from "@/components/lab/source/stage-reveal";
import {
  useBlueNoiseTexture,
  useSourceTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";

import { advanceKi, createKi } from "./final-explosion";
import type { StagePoint } from "./final-explosion";
import type { VegetaSettings } from "./settings";
import { VegetaMaterial } from "./vegeta-material";

const VegetaMaterialElement = extend(VegetaMaterial);

const quad = new PlaneGeometry(1, 1);
const viewport = new Vector4();

const followSpring = { damping: 16, stiffness: 120 } as const;
const auraSpring = { damping: 11, stiffness: 90 } as const;
const auraBase = 0.24;

export interface BlastPointer extends StagePointer {
  detonations: number;
  blast: StagePoint;
}

export interface VegetaViewProps {
  settings: VegetaSettings;
  animate: boolean;
  pointer: RefObject<BlastPointer>;
}

const VegetaView = ({ settings, animate, pointer }: VegetaViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof VegetaMaterial>>(null);
  const live = useRef(settings);
  useEffect(() => {
    live.current = settings;
  }, [settings]);
  const motion = useRef({
    aura: {
      strength: createSpring(0),
      x: createSpring(0.4),
      y: createSpring(0.7),
    },
    ki: createKi(),
  });
  const image = useSourceTexture("vegeta");
  const blueNoise = useBlueNoiseTexture();

  useFrame((_, delta) => {
    const { aura, ki } = motion.current;
    const step = frameStep(delta);
    const { current: hover } = pointer;
    advanceKi(ki, {
      detonations: hover.detonations,
      mode: animate ? "running" : "still",
      origin: hover.blast,
      step,
    });
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
      const { current } = live;
      renderer.getCurrentViewport(viewport);
      const { aura, ki } = motion.current;
      const { frame } = ki;
      shader.uOrigin.set(viewport.x, viewport.y);
      shader.uResolution.set(viewport.z, viewport.w);
      shader.uOriginal = originalUniform();
      shader.uCell = current.cell * renderer.getPixelRatio();
      shader.uThreshold = current.threshold;
      shader.uTime = ki.time;
      shader.uPulse = ki.pulse;
      shader.uAura.set(aura.x.value * viewport.z, aura.y.value * viewport.w);
      shader.uAuraStrength = Math.min(Math.max(aura.strength.value, 0), 1.2);
      shader.uAuraRadius = auraBase * current.auraRadius;
      shader.uBlast.set(ki.blast.x * viewport.z, ki.blast.y * viewport.w);
      shader.uRing = frame.ring;
      shader.uFront = frame.front;
      shader.uReprint = frame.reprint;
      shader.uColor = frame.color;
    };
  }, []);

  const isBlue = settings.dither === "blue-noise";

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <VegetaMaterialElement
          key={VegetaMaterial.key}
          ref={material}
          toneMapped={false}
          uBlueNoise={blueNoise}
          uDither={orderedDitherIndex(
            isBlue && !blueNoise ? "bayer-8" : settings.dither
          )}
          uHasImage={image ? 1 : 0}
          uImage={image}
        />
      </mesh>
    </>
  );
};

export default VegetaView;
