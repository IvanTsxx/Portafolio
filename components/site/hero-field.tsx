"use client";

import { useEffect, useMemo, useRef } from "react";

import { tokenRgb } from "@/components/profile/dither";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import {
  HERO_FIELD_COLUMNS,
  HERO_FIELD_ROWS,
  heroFieldBase,
  heroFieldCells,
  heroFieldPath,
} from "./hero-field-grid";
import type { HeroFieldBase } from "./hero-field-grid";
import {
  AMBIENT_FRAME_MS,
  createHeroFieldMotion,
  createLens,
  isLensSettled,
  lensSwell,
  lensTravel,
  packInk,
  paintHeroField,
  rampAt,
  stepSpring,
} from "./hero-field-motion";

const MAX_STEP_SECONDS = 0.05;

const pixelated = { imageRendering: "pixelated" } as const;

interface HeroFieldSurface {
  base: HeroFieldBase;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  field: HTMLElement;
  host: HTMLElement;
  ink: number;
}

const readInk = () => {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const context = probe.getContext("2d", { willReadFrequently: true });
  return context ? packInk(tokenRgb(context, "--ink")) : null;
};

const startHeroField = ({
  base,
  canvas,
  context,
  field,
  host,
  ink,
}: HeroFieldSurface) => {
  const motion = createHeroFieldMotion(base);
  const image = context.createImageData(HERO_FIELD_COLUMNS, HERO_FIELD_ROWS);
  const pixels = new Uint32Array(image.data.buffer);
  const lens = createLens();
  const pointer = { isInside: false, x: 0, y: 0 };
  let seconds = 0;
  let lastTick: number | null = null;
  let lastPaint = 0;
  let isInView = false;
  let request: number | null = null;

  const paint = () => {
    paintHeroField(
      motion,
      { lens, ramp: rampAt(seconds), time: seconds },
      pixels,
      ink
    );
    context.putImageData(image, 0, 0);
  };

  const canRun = () => isInView && document.visibilityState === "visible";

  const tick = (now: number) => {
    const step =
      lastTick === null
        ? 0
        : Math.min(MAX_STEP_SECONDS, (now - lastTick) / 1000);
    lastTick = now;
    seconds += step;
    stepSpring(lens.x, pointer.x, lensTravel, step);
    stepSpring(lens.y, pointer.y, lensTravel, step);
    stepSpring(lens.strength, pointer.isInside ? 1 : 0, lensSwell, step);
    const isInteractive = pointer.isInside || !isLensSettled(lens);
    if (isInteractive || now - lastPaint >= AMBIENT_FRAME_MS - 1) {
      paint();
      lastPaint = now;
    }
    request = canRun() ? requestAnimationFrame(tick) : null;
    if (request === null) {
      lastTick = null;
    }
  };

  const schedule = () => {
    if (request !== null) {
      return;
    }
    if (!canRun()) {
      lastTick = null;
      return;
    }
    request = requestAnimationFrame(tick);
  };

  const handleMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    const bounds = field.getBoundingClientRect();
    const scale = Math.max(
      bounds.width / HERO_FIELD_COLUMNS,
      bounds.height / HERO_FIELD_ROWS
    );
    const offsetX = bounds.width - HERO_FIELD_COLUMNS * scale;
    pointer.x = (event.clientX - bounds.left - offsetX) / scale;
    pointer.y = (event.clientY - bounds.top) / scale;
    if (isLensSettled(lens)) {
      lens.x.value = pointer.x;
      lens.y.value = pointer.y;
    }
    pointer.isInside = true;
    schedule();
  };

  const handleLeave = () => {
    pointer.isInside = false;
    schedule();
  };

  const observer = new IntersectionObserver(([entry]) => {
    isInView = entry?.isIntersecting ?? false;
    schedule();
  });

  canvas.width = HERO_FIELD_COLUMNS;
  canvas.height = HERO_FIELD_ROWS;
  paint();
  canvas.dataset.live = "true";
  observer.observe(host);
  host.addEventListener("pointermove", handleMove);
  host.addEventListener("pointerleave", handleLeave);
  document.addEventListener("visibilitychange", schedule);

  return () => {
    if (request !== null) {
      cancelAnimationFrame(request);
    }
    observer.disconnect();
    host.removeEventListener("pointermove", handleMove);
    host.removeEventListener("pointerleave", handleLeave);
    document.removeEventListener("visibilitychange", schedule);
    canvas.dataset.live = "false";
  };
};

export const HeroField = ({ seed }: { seed: string }) => {
  const base = useMemo(() => heroFieldBase(seed), [seed]);
  const path = useMemo(() => heroFieldPath(heroFieldCells(base)), [base]);
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    const field = fieldRef.current;
    const host = field?.parentElement;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const ink = isReduced ? null : readInk();
    if (!(field && host && canvas && context && ink !== null)) {
      return;
    }
    return startHeroField({ base, canvas, context, field, host, ink });
  }, [base, isReduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-10"
      ref={fieldRef}
    >
      <canvas
        className="peer ease-out-quart absolute inset-0 block size-full object-cover object-right-top opacity-0 transition-opacity duration-300 data-[live=true]:opacity-100"
        data-live="false"
        ref={canvasRef}
        style={pixelated}
      />
      <svg
        className="fill-ink absolute inset-0 size-full transition-[visibility] duration-300 [shape-rendering:crispEdges] peer-data-[live=true]:invisible"
        preserveAspectRatio="xMaxYMin slice"
        viewBox={`0 0 ${HERO_FIELD_COLUMNS} ${HERO_FIELD_ROWS}`}
      >
        <path d={path} />
      </svg>
    </div>
  );
};
