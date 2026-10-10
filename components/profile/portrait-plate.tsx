"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { ditherFrame } from "./dither";
import type { DitherFrame, Rgb } from "./dither";
import { useDitherDrift } from "./use-dither-drift";

const portraitAnchor = { x: 0.5, y: 0.35 } as const;

const MAX_SIZE = 480;

const registrationCorners = [
  "top-0 left-0",
  "top-0 right-0",
  "bottom-0 left-0",
  "right-0 bottom-0",
] as const;

const pixelated = { imageRendering: "pixelated" } as const;

const tokenRgb = (context: CanvasRenderingContext2D, token: string): Rgb => {
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  context.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
};

const loadFrame = async (src: string) => {
  const image = new window.Image();
  image.src = src;
  try {
    await image.decode();
  } catch {
    return null;
  }
  const scale = Math.min(
    1,
    MAX_SIZE / Math.max(image.naturalWidth, image.naturalHeight)
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
  const palette = {
    dark: tokenRgb(context, "--ink"),
    light: tokenRgb(context, "--paper"),
  };
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const frame: DitherFrame = {
    data: context.getImageData(0, 0, width, height).data,
    height,
    width,
  };
  return ditherFrame(frame, palette);
};

interface PortraitPlateProps {
  src: string;
  monogram: string;
  label: string;
}

export const PortraitPlate = ({ src, monogram, label }: PortraitPlateProps) => {
  const [scanned, setScanned] = useState(false);
  const [ready, setReady] = useState(false);
  const ditherRef = useRef<HTMLCanvasElement>(null);
  const { canvasRef, onRender, onPointerMove, onPointerLeave } =
    useDitherDrift(portraitAnchor);

  useEffect(() => {
    let cancelled = false;
    const paint = async () => {
      const dithered = await loadFrame(src);
      const canvas = ditherRef.current;
      const context = canvas?.getContext("2d");
      if (cancelled || !dithered || !canvas || !context) {
        return;
      }
      canvas.width = dithered.width;
      canvas.height = dithered.height;
      context.putImageData(
        new ImageData(
          new Uint8ClampedArray(dithered.data),
          dithered.width,
          dithered.height
        ),
        0,
        0
      );
      onRender(dithered);
      setReady(true);
    };
    paint();
    return () => {
      cancelled = true;
    };
  }, [src, onRender]);

  return (
    <figure className="group m-0 flex flex-col gap-2" data-scanned={scanned}>
      <button
        aria-label={scanned ? "Show dithered portrait" : "Scan source portrait"}
        aria-pressed={scanned}
        className="relative block w-full cursor-crosshair p-4 text-left"
        onClick={() => setScanned((current) => !current)}
        type="button"
      >
        {registrationCorners.map((corner) => (
          <svg
            aria-hidden
            className={cn("text-ink absolute size-4", corner)}
            fill="none"
            key={corner}
            stroke="currentColor"
            strokeWidth={1}
            viewBox="0 0 16 16"
          >
            <circle cx={8} cy={8} r={3.5} />
            <path d="M8 0v16M0 8h16" />
          </svg>
        ))}
        <span
          className="border-rule-strong bg-paper-deep relative block aspect-4/5 overflow-hidden border"
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
        >
          <canvas
            aria-hidden
            className="ease-out-quart block size-full object-cover opacity-0 transition-opacity duration-500 data-[ready=true]:opacity-100"
            data-ready={ready}
            ref={ditherRef}
            style={pixelated}
          />
          <canvas
            aria-hidden
            className="pointer-events-none invisible absolute inset-0 block size-full object-cover data-[active=true]:visible"
            data-active="false"
            ref={canvasRef}
            style={pixelated}
          />
          <Image
            alt=""
            className="ease-mechanical object-cover transition-[clip-path] duration-700 motion-reduce:transition-none"
            fill
            sizes="(min-width: 1024px) 30vw, 100vw"
            src={src}
            style={{ clipPath: scanned ? "inset(0)" : "inset(0 0 100% 0)" }}
          />
          <span
            aria-hidden
            className="ease-mechanical pointer-events-none absolute inset-0 -translate-y-full transition-transform duration-700 group-data-[scanned=true]:translate-y-0 motion-reduce:hidden"
          >
            <span className="bg-ink ring-paper/60 absolute inset-x-0 bottom-0 h-px ring-1" />
            <span className="label bg-ink text-paper absolute right-0 bottom-0 px-1.5 py-0.5">
              Scan
            </span>
          </span>
          <span className="label bg-paper text-ink absolute top-2 left-2 px-1.5 py-0.5">
            {monogram}
          </span>
        </span>
      </button>
      <figcaption className="label text-mist flex items-baseline justify-between">
        <span className="sr-only">{label}</span>
        <span>
          PL-01 Portrait <span className="jp">肖像</span>
        </span>
        {scanned ? (
          <span>
            Source <span className="jp">原画</span>
          </span>
        ) : (
          <>
            <span className="group-hover:hidden">Dither 4×4 · Click</span>
            <span className="hidden group-hover:inline">
              Drift <span className="jp">歪み</span>
            </span>
          </>
        )}
      </figcaption>
    </figure>
  );
};
