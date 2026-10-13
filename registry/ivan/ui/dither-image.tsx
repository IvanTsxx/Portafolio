"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentProps, PointerEvent } from "react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import {
  ditherFrame,
  orderPalette,
  resolveColor,
} from "@/registry/ivan/lib/dither";
import type { DitherFrame } from "@/registry/ivan/lib/dither";
import { driftRows } from "@/registry/ivan/lib/dither-drift";
import type { DriftPointer } from "@/registry/ivan/lib/dither-drift";

const maxSourceSize = 480;
const driftBand = 0.16;
const driftEasing = 0.09;
const settledIntensity = 0.01;

const pixelated = { imageRendering: "pixelated" } as const;

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const loadSource = async (src: string, crossOrigin: string | null) => {
  const image = new window.Image();
  if (crossOrigin !== null) {
    image.crossOrigin = crossOrigin;
  }
  image.src = src;
  try {
    await image.decode();
  } catch {
    return null;
  }
  const scale = Math.min(
    1,
    maxSourceSize / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }
  context.drawImage(image, 0, 0, width, height);
  try {
    return {
      data: context.getImageData(0, 0, width, height).data,
      height,
      width,
    } satisfies DitherFrame;
  } catch {
    return null;
  }
};

const paintFrame = (canvas: HTMLCanvasElement, frame: DitherFrame) => {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  canvas.width = frame.width;
  canvas.height = frame.height;
  context.putImageData(
    new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height),
    0,
    0
  );
};

export interface DitherImageProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  src: string;
  alt: string;
  pixelSize?: number;
  contrast?: number;
  drift?: number;
  inkColor?: string;
  paperColor?: string;
  crossOrigin?: "anonymous" | "use-credentials" | null;
}

export const DitherImage = ({
  src,
  alt,
  pixelSize = 2,
  contrast = 14,
  drift = 11,
  inkColor = "--foreground",
  paperColor = "--background",
  crossOrigin = "anonymous",
  className,
  onPointerLeave,
  onPointerMove,
  ...props
}: DitherImageProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const driftRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<DitherFrame | null>(null);
  const imageRef = useRef<ImageData | null>(null);
  const pointerRef = useRef<DriftPointer & { isInside: boolean }>({
    isInside: false,
    x: 0,
    y: 0,
  });
  const intensityRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isReduced = usePrefersReducedMotion();
  const size = Math.round(clampNumber(pixelSize, 1, 8));
  const amplitude = isReduced ? 0 : clampNumber(drift, 0, 40);

  useEffect(() => {
    let isCancelled = false;
    const paint = async () => {
      const root = rootRef.current;
      const source = await loadSource(src, crossOrigin);
      const canvas = baseRef.current;
      if (isCancelled || !source || !root || !canvas) {
        return;
      }
      const palette = orderPalette(
        resolveColor(root, inkColor),
        resolveColor(root, paperColor)
      );
      const dithered = ditherFrame(source, palette, {
        contrast: clampNumber(contrast, 0, 60),
        pixelSize: size,
      });
      paintFrame(canvas, dithered);
      frameRef.current = dithered;
      setIsReady(true);
    };
    paint();
    return () => {
      isCancelled = true;
    };
  }, [src, crossOrigin, inkColor, paperColor, contrast, size]);

  const run = useCallback(() => {
    if (requestRef.current !== null) {
      return;
    }
    const step = (time: number) => {
      const canvas = driftRef.current;
      const frame = frameRef.current;
      const context = canvas?.getContext("2d");
      if (!(canvas && frame && context)) {
        requestRef.current = null;
        return;
      }
      const pointer = pointerRef.current;
      intensityRef.current +=
        ((pointer.isInside ? 1 : 0) - intensityRef.current) * driftEasing;
      if (!pointer.isInside && intensityRef.current < settledIntensity) {
        intensityRef.current = 0;
        canvas.dataset.active = "false";
        requestRef.current = null;
        return;
      }
      if (canvas.width !== frame.width || canvas.height !== frame.height) {
        canvas.width = frame.width;
        canvas.height = frame.height;
      }
      if (
        !imageRef.current ||
        imageRef.current.width !== frame.width ||
        imageRef.current.height !== frame.height
      ) {
        imageRef.current = context.createImageData(frame.width, frame.height);
      }
      driftRows(
        frame,
        imageRef.current.data,
        pointer,
        intensityRef.current,
        time,
        { amplitude, band: driftBand, cell: size }
      );
      context.putImageData(imageRef.current, 0, 0);
      canvas.dataset.active = "true";
      requestRef.current = requestAnimationFrame(step);
    };
    requestRef.current = requestAnimationFrame(step);
  }, [amplitude, size]);

  useEffect(
    () => () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    },
    []
  );

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const frame = frameRef.current;
    if (event.pointerType !== "mouse" || amplitude === 0 || !frame) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const scale = Math.max(
      bounds.width / frame.width,
      bounds.height / frame.height
    );
    const offsetX = (bounds.width - frame.width * scale) / 2;
    const offsetY = (bounds.height - frame.height * scale) / 2;
    pointerRef.current = {
      isInside: true,
      x: (event.clientX - bounds.left - offsetX) / scale,
      y: (event.clientY - bounds.top - offsetY) / scale,
    };
    run();
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    pointerRef.current = { ...pointerRef.current, isInside: false };
    run();
  };

  return (
    <div
      className={cn(
        "bg-muted relative aspect-4/5 overflow-hidden",
        amplitude > 0 && "cursor-crosshair",
        className
      )}
      data-ready={isReady}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={rootRef}
      {...props}
    >
      <canvas
        aria-hidden
        className="absolute inset-0 block size-full object-cover opacity-0 transition-opacity duration-500 ease-out data-[ready=true]:opacity-100 motion-reduce:transition-none"
        data-ready={isReady}
        ref={baseRef}
        style={pixelated}
      />
      <canvas
        aria-hidden
        className="pointer-events-none invisible absolute inset-0 block size-full object-cover data-[active=true]:visible"
        data-active="false"
        ref={driftRef}
        style={pixelated}
      />
      {alt ? <span className="sr-only">{alt}</span> : null}
    </div>
  );
};
