"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { LinearMipmapLinearFilter, TextureLoader } from "three";
import type { Texture } from "three";

export interface PrintImage {
  texture: Texture;
  element: HTMLImageElement;
  width: number;
  height: number;
}

interface LoadedImage {
  src: string;
  image: PrintImage;
}

const loadTexture = async (src: string) => {
  const loader = new TextureLoader();
  loader.setCrossOrigin("anonymous");
  try {
    return await loader.loadAsync(src);
  } catch {
    return null;
  }
};

export const usePrintImage = (src: string): PrintImage | null => {
  const invalidate = useThree((state) => state.invalidate);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let texture: Texture | null = null;
    const load = async () => {
      const value = await loadTexture(src);
      if (!value) {
        return;
      }
      if (!isCurrent) {
        value.dispose();
        return;
      }
      value.generateMipmaps = true;
      value.minFilter = LinearMipmapLinearFilter;
      texture = value;
      const element: HTMLImageElement = value.image;
      setLoaded({
        image: {
          element,
          height: element.naturalHeight,
          texture: value,
          width: element.naturalWidth,
        },
        src,
      });
      invalidate();
    };
    void load();
    return () => {
      isCurrent = false;
      texture?.dispose();
    };
  }, [invalidate, src]);

  return loaded && loaded.src === src ? loaded.image : null;
};
