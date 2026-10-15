"use client";

import { useEffect, useRef, useState } from "react";

import { ditherFrame, tokenRgb } from "@/components/profile/dither";
import { cn } from "@/lib/utils";

const SIDE = 48;

const pixelated = { imageRendering: "pixelated" } as const;

const paintDither = async (src: string, canvas: HTMLCanvasElement) => {
  const image = new window.Image();
  image.src = src;
  await image.decode();
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return false;
  }
  const palette = {
    dark: tokenRgb(context, "--ink"),
    light: tokenRgb(context, "--paper"),
  };
  context.fillStyle = `rgb(${palette.light.join(" ")})`;
  context.fillRect(0, 0, SIDE, SIDE);
  context.drawImage(image, 0, 0, SIDE, SIDE);
  const dithered = ditherFrame(
    {
      data: context.getImageData(0, 0, SIDE, SIDE).data,
      height: SIDE,
      width: SIDE,
    },
    palette
  );
  context.putImageData(
    new ImageData(new Uint8ClampedArray(dithered.data), SIDE, SIDE),
    0,
    0
  );
  return true;
};

export const DitherLogo = ({
  className,
  src,
}: {
  className?: string;
  src: string;
}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const node = canvas.current;
    if (!node) {
      return;
    }
    let isCurrent = true;
    const paint = async () => {
      let painted = false;
      try {
        painted = await paintDither(src, node);
      } catch {
        painted = false;
      }
      if (isCurrent) {
        setIsReady(painted);
      }
    };
    paint();
    return () => {
      isCurrent = false;
    };
  }, [src]);

  return (
    <canvas
      aria-hidden
      className={cn(
        "border-paper bg-paper-deep block size-12 border",
        isReady ? "" : "invisible",
        className
      )}
      height={SIDE}
      ref={canvas}
      style={pixelated}
      width={SIDE}
    />
  );
};
