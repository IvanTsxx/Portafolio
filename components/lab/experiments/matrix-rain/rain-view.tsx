"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh, Texture, WebGLRenderer } from "three";
import { PlaneGeometry, Vector4 } from "three";

import type { SourceImage } from "@/components/lab/source/tone-chunk";
import {
  syncSourceUniforms,
  useSourceTexture,
} from "@/components/lab/source/use-source";
import { requestSceneFrame } from "@/components/scene/view-registry";

import { buildGlyphAtlas, glyphRangeOf } from "./glyph-atlas";
import type { GlyphSetName } from "./glyph-atlas";
import { RainMaterial } from "./rain-material";

const RainMaterialElement = extend(RainMaterial);

const quad = new PlaneGeometry(1, 1);
const viewport = new Vector4();

const reducedTime = 9.5;
const lensRadius = 110;
const idleStrength = 0.6;
const lensRate = 9;
const strengthRate = 5;

export interface RainSettings {
  pitch: number;
  speed: number;
  trail: number;
  glyphs: GlyphSetName;
  source: SourceImage;
}

export interface RainPointer {
  x: number;
  y: number;
  isHovering: boolean;
}

export interface RainViewProps {
  settings: RainSettings;
  animate: boolean;
  pointer: RefObject<RainPointer>;
}

const approach = (value: number, target: number, rate: number, step: number) =>
  value + (target - value) * (1 - Math.exp(-rate * step));

const RainView = ({ settings, animate, pointer }: RainViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof RainMaterial>>(null);
  const wander = useRef(reducedTime);
  const lens = useRef({ strength: idleStrength, x: 0.5, y: 0.5 });
  const portrait = useSourceTexture(settings.source);

  useEffect(() => {
    let isCurrent = true;
    let atlas: Texture | null = null;
    const buildWithLoadedFont = async () => {
      await document.fonts.ready;
      if (!(isCurrent && material.current)) {
        return;
      }
      atlas = buildGlyphAtlas();
      material.current.uAtlas = atlas;
      requestSceneFrame();
    };
    buildWithLoadedFont();
    return () => {
      isCurrent = false;
      atlas?.dispose();
    };
  }, []);

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
      syncSourceUniforms(
        shader,
        renderer,
        lens.current,
        portrait,
        settings.source
      );
      renderer.getCurrentViewport(viewport);
      const ratio = renderer.getPixelRatio();
      shader.uLens.set(
        lens.current.x * viewport.z,
        lens.current.y * viewport.w
      );
      shader.uPixelRatio = ratio;
      shader.uPitch = settings.pitch * ratio;
      shader.uLensRadius = lensRadius * ratio;
    };
  }, [portrait, settings.pitch, settings.source]);

  useFrame((_, delta) => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const step = Math.min(delta, 0.05);
    if (animate) {
      shader.uTime += step * settings.speed;
      wander.current += step;
    } else {
      shader.uTime = reducedTime;
    }
    const time = wander.current;
    const { current: hover } = pointer;
    const target = hover.isHovering
      ? { strength: 1, x: hover.x, y: hover.y }
      : {
          strength: idleStrength,
          x: 0.5 + Math.sin(time * 0.31) * 0.28,
          y: 0.5 + Math.cos(time * 0.23) * 0.2,
        };
    const { current } = lens;
    if (animate) {
      current.x = approach(current.x, target.x, lensRate, step);
      current.y = approach(current.y, target.y, lensRate, step);
      current.strength = approach(
        current.strength,
        target.strength,
        strengthRate,
        step
      );
    } else {
      lens.current = target;
    }
    shader.uLensStrength = lens.current.strength;
  });

  const range = glyphRangeOf(settings.glyphs);

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <RainMaterialElement
          key={RainMaterial.key}
          ref={material}
          toneMapped={false}
          uGlyphCount={range.count}
          uGlyphStart={range.start}
          uTrail={settings.trail}
        />
      </mesh>
    </>
  );
};

export default RainView;
