"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry, Vector4 } from "three";

import type { StampAtlas } from "./stamp-atlas";
import { StampMaterial } from "./stamp-material";
import type { Impression } from "./stamp-pad";

const StampMaterialElement = extend(StampMaterial);

const quad = new PlaneGeometry(1, 1);
const viewport = new Vector4();
const pressDuration = 220;

export interface StampViewProps {
  atlas: StampAtlas;
  impressions: readonly Impression[];
  animate: boolean;
}

const pressProgress = (
  impression: Impression,
  now: number,
  animate: boolean
) =>
  animate
    ? Math.min(Math.max((now - impression.pressedAt) / pressDuration, 0), 1)
    : 1;

const StampView = ({ atlas, impressions, animate }: StampViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof StampMaterial>>(null);

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
      shader.uOrigin.set(viewport.x, viewport.y);
      shader.uResolution.set(viewport.z, viewport.w);
      shader.uPixelRatio = renderer.getPixelRatio();
    };
  }, []);

  useFrame(() => {
    const shader = material.current;
    if (!shader) {
      return;
    }
    const now = performance.now();
    shader.uAtlas = atlas.texture;
    shader.uCount = impressions.length;
    for (const impression of impressions) {
      shader.uPlacement[impression.slot]?.set(
        impression.x,
        impression.y,
        impression.rotation,
        atlas.aspects[impression.slot] ?? 1
      );
      shader.uPress[impression.slot]?.set(
        impression.ink,
        impression.seed,
        pressProgress(impression, now, animate),
        impression.wear
      );
    }
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh frustumCulled={false} geometry={quad} ref={mesh}>
        <StampMaterialElement
          key={StampMaterial.key}
          ref={material}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default StampView;
