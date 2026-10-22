"use client";

import { OrthographicCamera } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Mesh, WebGLRenderer } from "three";
import { PlaneGeometry } from "three";

import type { SourceKind } from "@/components/lab/source/tone-chunk";
import {
  syncSourceUniforms,
  useDampedPointer,
  useSourceTexture,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";
import { requestSceneFrame } from "@/components/scene/view-registry";

import { AsciiMaterial } from "./ascii-material";
import { buildGlyphAtlas, glyphAspect } from "./glyph-atlas";
import type { GlyphAtlas } from "./glyph-atlas";

const AsciiMaterialElement = extend(AsciiMaterial);

const quad = new PlaneGeometry(1, 1);
const scannerSize = { height: 64, width: 132 } as const;

export type ScanMode = "sharpen" | "invert";

export interface AsciiSettings {
  cell: number;
  ramp: string;
  scanMode: ScanMode;
  source: SourceKind;
}

export interface AsciiViewProps {
  settings: AsciiSettings;
  animate: boolean;
  pointer: RefObject<StagePointer>;
}

const useGlyphAtlas = (ramp: string) => {
  const [atlas, setAtlas] = useState<GlyphAtlas | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let built: GlyphAtlas | null = null;
    const build = async () => {
      const next = await buildGlyphAtlas(ramp);
      built = next;
      if (!isCurrent) {
        next.texture.dispose();
        return;
      }
      setAtlas(next);
      requestSceneFrame();
    };
    void build();
    return () => {
      isCurrent = false;
      built?.texture.dispose();
    };
  }, [ramp]);

  return atlas;
};

const AsciiView = ({ settings, animate, pointer }: AsciiViewProps) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<InstanceType<typeof AsciiMaterial>>(null);
  const light = useDampedPointer(pointer, animate);
  const portrait = useSourceTexture(settings.source);
  const atlas = useGlyphAtlas(settings.ramp);

  useEffect(() => {
    const plane = mesh.current;
    if (!plane) {
      return;
    }
    plane.onBeforeRender = (renderer: WebGLRenderer) => {
      const shader = material.current;
      if (!(shader && atlas)) {
        return;
      }
      syncSourceUniforms(
        shader,
        renderer,
        light.current,
        portrait,
        settings.source
      );
      const ratio = renderer.getPixelRatio();
      const { x: width, y: height } = shader.uResolution;
      const cell = settings.cell * ratio;
      shader.uCell = cell;
      shader.uPixelRatio = ratio;
      shader.uAtlas = atlas.texture;
      shader.uGlyphCount = atlas.count;
      shader.uScan.set(light.current.x * width, (1 - light.current.y) * height);
      shader.uScanExtent.set(
        Math.max(
          2,
          Math.round((scannerSize.width * ratio) / (cell * glyphAspect))
        ),
        Math.max(1, Math.round((scannerSize.height * ratio) / cell))
      );
      shader.uScanMode = settings.scanMode === "invert" ? 1 : 0;
    };
  }, [
    atlas,
    light,
    portrait,
    settings.cell,
    settings.scanMode,
    settings.source,
  ]);

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} />
      <mesh
        frustumCulled={false}
        geometry={quad}
        ref={mesh}
        visible={atlas !== null}
      >
        <AsciiMaterialElement
          key={AsciiMaterial.key}
          ref={material}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default AsciiView;
