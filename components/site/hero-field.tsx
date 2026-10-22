"use client";

import { useEffect, useMemo, useRef } from "react";

import { tokenRgb } from "@/components/profile/dither";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import {
  HERO_FIELD_CELLS,
  HERO_FIELD_COLUMNS,
  HERO_FIELD_ROWS,
  heroFieldBase,
  heroFieldCells,
  heroFieldDotPath,
} from "./hero-field-grid";
import type { HeroFieldBase } from "./hero-field-grid";
import {
  AMBIENT_FRAME_MS,
  createHeroFieldMotion,
  createLens,
  heroFieldPixels,
  isLensSettled,
  lensSwell,
  lensTravel,
  packInk,
  paintHeroField,
  RING_LIFE,
  rampAt,
  stepSpring,
} from "./hero-field-motion";
import type { HeroPalette, HeroRing } from "./hero-field-motion";

const MAX_STEP_SECONDS = 0.05;
const DOT_SCALE = 4;
const DOT_INSET = 1;
const CLEAR_PAD = 2;
const canvasWidth = HERO_FIELD_COLUMNS * DOT_SCALE;
const INK_ALPHA = 0.1;
const SPARK_ALPHA = 0.45;
const CLAY_ALPHA = 0.75;
const interactiveSelector = "a, button, input, textarea, select, [role=button]";

const pixelated = { imageRendering: "pixelated" } as const;

interface HeroFieldSurface {
  base: HeroFieldBase;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  field: HTMLElement;
  host: HTMLElement;
  palette: HeroPalette;
}

const readPalette = (): HeroPalette | null => {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const context = probe.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }
  const ink = tokenRgb(context, "--ink");
  return {
    clay: packInk(tokenRgb(context, "--clay"), CLAY_ALPHA),
    ink: packInk(ink, INK_ALPHA),
    spark: packInk(ink, SPARK_ALPHA),
  };
};

const isInteractive = (target: EventTarget | null) =>
  target instanceof Element && target.closest(interactiveSelector) !== null;

const fieldFrame = (field: HTMLElement) => {
  const bounds = field.getBoundingClientRect();
  const scale = Math.max(
    bounds.width / HERO_FIELD_COLUMNS,
    bounds.height / HERO_FIELD_ROWS
  );
  return {
    left: bounds.left + bounds.width - HERO_FIELD_COLUMNS * scale,
    scale,
    top: bounds.top,
  };
};

const clampCell = (value: number, limit: number) =>
  Math.min(limit - 1, Math.max(0, value));

const measureClear = (field: HTMLElement, host: HTMLElement) => {
  const clear = new Uint8Array(HERO_FIELD_CELLS);
  const { left, scale, top } = fieldFrame(field);
  for (const element of host.querySelectorAll("[data-hero-clear]")) {
    const box = element.getBoundingClientRect();
    const firstColumn = clampCell(
      Math.floor((box.left - left) / scale) - CLEAR_PAD,
      HERO_FIELD_COLUMNS
    );
    const lastColumn = clampCell(
      Math.ceil((box.right - left) / scale) + CLEAR_PAD,
      HERO_FIELD_COLUMNS
    );
    const firstRow = clampCell(
      Math.floor((box.top - top) / scale) - CLEAR_PAD,
      HERO_FIELD_ROWS
    );
    const lastRow = clampCell(
      Math.ceil((box.bottom - top) / scale) + CLEAR_PAD,
      HERO_FIELD_ROWS
    );
    for (let row = firstRow; row <= lastRow; row += 1) {
      clear.fill(
        1,
        row * HERO_FIELD_COLUMNS + firstColumn,
        row * HERO_FIELD_COLUMNS + lastColumn + 1
      );
    }
  }
  return clear;
};

const spreadDots = (cells: Uint32Array, dots: Uint32Array) => {
  for (const [index, color] of cells.entries()) {
    const column = index % HERO_FIELD_COLUMNS;
    const row = Math.floor(index / HERO_FIELD_COLUMNS);
    const corner =
      (row * DOT_SCALE + DOT_INSET) * canvasWidth +
      column * DOT_SCALE +
      DOT_INSET;
    dots[corner] = color;
    dots[corner + 1] = color;
    dots[corner + canvasWidth] = color;
    dots[corner + canvasWidth + 1] = color;
  }
};

const startHeroField = ({
  base,
  canvas,
  context,
  field,
  host,
  palette,
}: HeroFieldSurface) => {
  const motion = createHeroFieldMotion(base);
  const image = context.createImageData(
    canvasWidth,
    HERO_FIELD_ROWS * DOT_SCALE
  );
  const dots = new Uint32Array(image.data.buffer);
  const pixels = heroFieldPixels();
  let clear = measureClear(field, host);
  const lens = createLens();
  const pointer = { isInside: false, x: 0, y: 0 };
  let rings: HeroRing[] = [];
  let seconds = 0;
  let lastTick: number | null = null;
  let lastPaint = 0;
  let isInView = false;
  let request: number | null = null;

  const paint = () => {
    paintHeroField(
      motion,
      { clear, lens, ramp: rampAt(seconds), rings, time: seconds },
      pixels,
      palette.ink,
      palette
    );
    spreadDots(pixels, dots);
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
    for (const ring of rings) {
      ring.age += step;
    }
    rings = rings.filter((ring) => ring.age < RING_LIFE);
    const isActive =
      pointer.isInside || rings.length > 0 || !isLensSettled(lens);
    if (isActive || now - lastPaint >= AMBIENT_FRAME_MS - 1) {
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

  const locate = (event: PointerEvent) => {
    const { left, scale, top } = fieldFrame(field);
    return {
      x: (event.clientX - left) / scale,
      y: (event.clientY - top) / scale,
    };
  };

  const handleMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") {
      return;
    }
    const spot = locate(event);
    pointer.x = spot.x;
    pointer.y = spot.y;
    if (isLensSettled(lens)) {
      lens.x.value = pointer.x;
      lens.y.value = pointer.y;
    }
    pointer.isInside = true;
    schedule();
  };

  const handlePress = (event: PointerEvent) => {
    if (isInteractive(event.target)) {
      return;
    }
    rings.push({ age: 0, ...locate(event) });
    schedule();
  };

  const handleLeave = () => {
    pointer.isInside = false;
    schedule();
  };

  const resizer = new ResizeObserver(() => {
    clear = measureClear(field, host);
    paint();
  });

  const observer = new IntersectionObserver(([entry]) => {
    isInView = entry?.isIntersecting ?? false;
    schedule();
  });

  canvas.width = canvasWidth;
  canvas.height = HERO_FIELD_ROWS * DOT_SCALE;
  paint();
  canvas.dataset.live = "true";
  observer.observe(host);
  resizer.observe(host);
  host.addEventListener("pointermove", handleMove);
  host.addEventListener("pointerleave", handleLeave);
  host.addEventListener("pointerdown", handlePress);
  document.addEventListener("visibilitychange", schedule);

  return () => {
    if (request !== null) {
      cancelAnimationFrame(request);
    }
    observer.disconnect();
    resizer.disconnect();
    host.removeEventListener("pointermove", handleMove);
    host.removeEventListener("pointerleave", handleLeave);
    host.removeEventListener("pointerdown", handlePress);
    document.removeEventListener("visibilitychange", schedule);
    canvas.dataset.live = "false";
  };
};

export const HeroField = ({ seed }: { seed: string }) => {
  const base = useMemo(() => heroFieldBase(seed), [seed]);
  const path = useMemo(() => heroFieldDotPath(heroFieldCells(base)), [base]);
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    const field = fieldRef.current;
    const host = field?.parentElement;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const palette = isReduced ? null : readPalette();
    if (!(field && host && canvas && context && palette)) {
      return;
    }
    return startHeroField({ base, canvas, context, field, host, palette });
  }, [base, isReduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      ref={fieldRef}
    >
      <canvas
        className="peer ease-out-quart absolute inset-0 block size-full object-cover object-right-top opacity-0 transition-opacity duration-300 data-[live=true]:opacity-100"
        data-live="false"
        ref={canvasRef}
        style={pixelated}
      />
      <svg
        className="fill-ink/10 absolute inset-0 size-full transition-[visibility] duration-300 [shape-rendering:crispEdges] peer-data-[live=true]:invisible"
        preserveAspectRatio="xMaxYMin slice"
        viewBox={`0 0 ${HERO_FIELD_COLUMNS} ${HERO_FIELD_ROWS}`}
      >
        <path d={path} />
      </svg>
    </div>
  );
};
