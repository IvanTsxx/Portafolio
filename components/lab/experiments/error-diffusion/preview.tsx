"use client";

import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  SwitchControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";

import type { DiffusionName, Raster } from "./dither";
import {
  applyTone,
  diffuse,
  diffusionKernels,
  diffusionNames,
  orderedDither,
  rampRaster,
  sphereRaster,
} from "./dither";

type SourceName = "portrait" | "sphere" | "ramp";

interface DitherSettings {
  algorithm: DiffusionName;
  contrast: number;
  threshold: number;
  serpentine: boolean;
  source: SourceName;
  pixel: number;
}

interface StageSize {
  width: number;
  height: number;
}

const algorithmOptions = diffusionNames.map((name) => ({
  label: diffusionKernels[name].label,
  value: name,
}));

const sourceOptions = [
  { label: "Portrait", value: "portrait" },
  { label: "Sphere", value: "sphere" },
  { label: "Ramp", value: "ramp" },
] as const;

const inkPixel = 0xff_14_14_14;
const paperPixel = 0xff_eb_ed_ed;
const maxPixels = 160_000;

const portraitRaster = (
  image: HTMLImageElement,
  width: number,
  height: number
): Raster => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const values = new Float32Array(width * height);
  if (!context) {
    return { height, values, width };
  }
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) * 0.3,
    drawWidth,
    drawHeight
  );
  const { data } = context.getImageData(0, 0, width, height);
  for (let index = 0; index < values.length; index += 1) {
    const offset = index * 4;
    values[index] =
      0.2126 * (data[offset] ?? 0) +
      0.7152 * (data[offset + 1] ?? 0) +
      0.0722 * (data[offset + 2] ?? 0);
  }
  return { height, values, width };
};

const sourceRaster = (
  source: SourceName,
  portrait: HTMLImageElement | null,
  width: number,
  height: number
) => {
  if (source === "portrait" && portrait) {
    return portraitRaster(portrait, width, height);
  }
  if (source === "ramp") {
    return rampRaster(width, height);
  }
  return sphereRaster(width, height);
};

const paint = (
  canvas: HTMLCanvasElement | null,
  ink: Uint8Array,
  width: number,
  height: number
) => {
  const context = canvas?.getContext("2d");
  if (!(canvas && context)) {
    return;
  }
  canvas.width = width;
  canvas.height = height;
  const image = context.createImageData(width, height);
  const pixels = new Uint32Array(image.data.buffer);
  for (let index = 0; index < ink.length; index += 1) {
    pixels[index] = ink[index] ? inkPixel : paperPixel;
  }
  context.putImageData(image, 0, 0);
};

const gridFor = ({ width, height }: StageSize, pixel: number) => {
  const scale = Math.max(pixel, Math.sqrt((width * height) / maxPixels));
  return {
    height: Math.max(1, Math.floor(height / scale)),
    width: Math.max(1, Math.floor(width / scale)),
  };
};

const clampSplit = (value: number) => Math.min(Math.max(value, 0), 100);

const ErrorDiffusionPreview = () => {
  const { activity, isOnscreen, ref } = useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<DitherSettings>({
    algorithm: "floyd-steinberg",
    contrast: 1.2,
    pixel: 3,
    serpentine: true,
    source: "portrait",
    threshold: 128,
  });
  const [split, setSplit] = useState(50);
  const [size, setSize] = useState<StageSize | null>(null);
  const [portrait, setPortrait] = useState<HTMLImageElement | null>(null);
  const field = useRef<HTMLDivElement>(null);
  const diffusedCanvas = useRef<HTMLCanvasElement>(null);
  const orderedCanvas = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = field.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setSize({
          height: entry.contentRect.height,
          width: entry.contentRect.width,
        });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const loadPortrait = async () => {
      const image = new Image();
      image.src = "/avatar";
      try {
        await image.decode();
        if (isCurrent) {
          setPortrait(image);
        }
      } catch {
        if (isCurrent) {
          setSettings((current) =>
            current.source === "portrait"
              ? { ...current, source: "sphere" }
              : current
          );
        }
      }
    };
    loadPortrait();
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!(size && isOnscreen)) {
      return;
    }
    const { width, height } = gridFor(size, settings.pixel);
    const tone = applyTone(
      sourceRaster(settings.source, portrait, width, height),
      settings
    );
    const started = performance.now();
    const diffused = diffuse(tone, settings.algorithm, settings.serpentine);
    const milliseconds = performance.now() - started;
    paint(diffusedCanvas.current, diffused, width, height);
    paint(orderedCanvas.current, orderedDither(tone), width, height);
    if (readout.current) {
      readout.current.textContent = `Diffusion ${milliseconds.toFixed(1)} ms · ${width}×${height}`;
    }
  }, [settings, size, portrait, isOnscreen]);

  const moveSplit = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setSplit(clampSplit(((event.clientX - bounds.left) / bounds.width) * 100));
  };

  const { title } = diffusionKernels[settings.algorithm];

  return (
    <ExperimentStage
      activity={activity}
      controls={
        <>
          <ToggleControl
            label="Diffusion"
            onChange={(algorithm) =>
              setSettings((current) => ({ ...current, algorithm }))
            }
            options={algorithmOptions}
            value={settings.algorithm}
          />
          <ToggleControl
            label="Source"
            onChange={(source) =>
              setSettings((current) => ({ ...current, source }))
            }
            options={sourceOptions}
            value={settings.source}
          />
          <SliderControl
            label="Threshold"
            max={208}
            min={48}
            onChange={(threshold) =>
              setSettings((current) => ({ ...current, threshold }))
            }
            step={4}
            value={settings.threshold}
          />
          <SliderControl
            format={(value) => `${value.toFixed(2)}×`}
            label="Contrast"
            max={2.5}
            min={0.5}
            onChange={(contrast) =>
              setSettings((current) => ({ ...current, contrast }))
            }
            step={0.05}
            value={settings.contrast}
          />
          <SliderControl
            format={(value) => `${value}px`}
            label="Pixel"
            max={6}
            min={2}
            onChange={(pixel) =>
              setSettings((current) => ({ ...current, pixel }))
            }
            value={settings.pixel}
          />
          <SwitchControl
            checked={settings.serpentine}
            hint="Odd rows scan right to left and mirror the kernel."
            label="Serpentine"
            onChange={(serpentine) =>
              setSettings((current) => ({ ...current, serpentine }))
            }
          />
        </>
      }
      reducedNote="Reduced motion is on. Nothing here animates. The split moves only when you drag it."
      stageLabel={`${title} error diffusion compared with ordered Bayer dithering`}
      stageRef={ref}
    >
      <div
        className="relative size-full cursor-ew-resize touch-pan-y select-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          moveSplit(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            moveSplit(event);
          }
        }}
        ref={field}
      >
        <canvas
          aria-hidden
          className="absolute inset-0 size-full [image-rendering:pixelated]"
          ref={diffusedCanvas}
        />
        <canvas
          aria-hidden
          className="absolute inset-0 size-full [image-rendering:pixelated]"
          ref={orderedCanvas}
          style={{ clipPath: `inset(0 0 0 ${split}%)` }}
        />
        <span
          className="label bg-paper/90 text-ink border-rule-strong pointer-events-none absolute top-14 border px-2 py-1 whitespace-nowrap"
          style={{ right: `calc(${100 - split}% + 0.75rem)` }}
        >
          {title}
        </span>
        <span
          className="label bg-paper/90 text-ink border-rule-strong pointer-events-none absolute top-14 border px-2 py-1 whitespace-nowrap"
          style={{ left: `calc(${split}% + 0.75rem)` }}
        >
          Bayer 8×8
        </span>
        <input
          aria-label="Compare split"
          aria-valuetext={`${Math.round(split)}% ${title}`}
          className="peer sr-only"
          max={100}
          min={0}
          onChange={(event) => setSplit(Number(event.target.value))}
          type="range"
          value={Math.round(split)}
        />
        <div
          aria-hidden
          className="peer-focus-visible:[&>span:last-child]:ring-ink peer-focus-visible:[&>span:last-child]:ring-offset-paper pointer-events-none absolute inset-y-0 flex w-6 -translate-x-1/2 items-center justify-center peer-focus-visible:[&>span:last-child]:ring-2 peer-focus-visible:[&>span:last-child]:ring-offset-2"
          style={{ left: `${split}%` }}
        >
          <span className="bg-paper absolute inset-y-0 w-1" />
          <span className="bg-ink absolute inset-y-0 w-px" />
          <span className="border-ink bg-paper relative h-8 w-3 border" />
        </div>
        <p
          aria-live="off"
          className="label bg-paper/90 text-graphite border-rule-strong pointer-events-none absolute top-4 right-5 border px-2 py-1 tabular-nums"
          ref={readout}
        >
          Dithering
        </p>
      </div>
    </ExperimentStage>
  );
};

export default ErrorDiffusionPreview;
