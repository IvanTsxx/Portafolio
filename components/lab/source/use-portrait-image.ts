"use client";

import { useEffect, useState } from "react";

let portraitRequest: Promise<HTMLImageElement> | null = null;

const requestPortrait = async () => {
  const image = new Image();
  image.src = "/avatar";
  await image.decode();
  return image;
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

export const usePortraitImage = (isWanted: boolean) => {
  const [portrait, setPortrait] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isWanted || portrait) {
      return;
    }
    let isCurrent = true;
    const resolve = async () => {
      const image = await loadPortrait();
      if (isCurrent && image) {
        setPortrait(image);
      }
    };
    void resolve();
    return () => {
      isCurrent = false;
    };
  }, [isWanted, portrait]);

  return portrait;
};
