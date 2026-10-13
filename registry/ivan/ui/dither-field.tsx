"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { resolveColor } from "@/registry/ivan/lib/dither";
import {
  AMBIENT_FRAME_MS,
  createDitherFieldGrid,
  createLens,
  isLensSettled,
  lensSwell,
  lensTravel,
  packColor,
  paintDitherField,
  rampAt,
  seedOf,
  stepSpring,
} from "@/registry/ivan/lib/dither-field";
import type {
  DitherFieldAnchor,
  DitherFieldGrid,
} from "@/registry/ivan/lib/dither-field";

const maxStepSeconds = 0.05;
const minColumns = 16;
const maxColumns = 256;
const minRows = 8;

const pixelated = { imageRendering: "pixelated" } as const;

interface GridSize {
  columns: number;
  rows: number;
}

const measureGrid = (width: number, height: number, cellSize: number) => {
  const columns = Math.round(
    Math.min(maxColumns, Math.max(minColumns, width / cellSize))
  );
  const cellPixels = width / columns;
  const rows = Math.max(minRows, Math.round(height / Math.max(1, cellPixels)));
  return { columns, rows };
};

interface FieldSurface {
  canvas: HTMLCanvasElement;
  color: number;
  context: CanvasRenderingContext2D;
  grid: DitherFieldGrid;
  host: HTMLElement;
  isAnimated: boolean;
  isInteractive: boolean;
}

const startField = ({
  canvas,
  color,
  context,
  grid,
  host,
  isAnimated,
  isInteractive,
}: FieldSurface) => {
  const image = context.createImageData(grid.columns, grid.rows);
  const pixels = new Uint32Array(image.data.buffer);
  const lens = createLens();
  const pointer = { isInside: false, x: 0, y: 0 };
  let seconds = 0;
  let lastTick: number | null = null;
  let lastPaint = 0;
  let isInView = false;
  let request: number | null = null;

  const paint = () => {
    paintDitherField(
      grid,
      { lens, ramp: isAnimated ? rampAt(seconds) : 0, time: seconds },
      pixels,
      color
    );
    context.putImageData(image, 0, 0);
  };

  canvas.width = grid.columns;
  canvas.height = grid.rows;
  paint();
  canvas.dataset.live = "true";

  if (!isAnimated) {
    return () => {
      canvas.dataset.live = "false";
    };
  }

  const canRun = () => isInView && document.visibilityState === "visible";

  const tick = (now: number) => {
    const step =
      lastTick === null ? 0 : Math.min(maxStepSeconds, (now - lastTick) / 1000);
    lastTick = now;
    seconds += step;
    stepSpring(lens.x, pointer.x, lensTravel, step);
    stepSpring(lens.y, pointer.y, lensTravel, step);
    stepSpring(lens.strength, pointer.isInside ? 1 : 0, lensSwell, step);
    const isLensMoving = pointer.isInside || !isLensSettled(lens);
    if (isLensMoving || now - lastPaint >= AMBIENT_FRAME_MS - 1) {
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
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * grid.columns;
    pointer.y = ((event.clientY - bounds.top) / bounds.height) * grid.rows;
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
  observer.observe(host);
  document.addEventListener("visibilitychange", schedule);
  if (isInteractive) {
    host.addEventListener("pointermove", handleMove);
    host.addEventListener("pointerleave", handleLeave);
  }

  return () => {
    if (request !== null) {
      cancelAnimationFrame(request);
    }
    observer.disconnect();
    document.removeEventListener("visibilitychange", schedule);
    host.removeEventListener("pointermove", handleMove);
    host.removeEventListener("pointerleave", handleLeave);
    canvas.dataset.live = "false";
  };
};

export interface DitherFieldProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  seed?: string;
  anchor?: DitherFieldAnchor;
  density?: number;
  cellSize?: number;
  interactive?: boolean;
  animated?: boolean;
}

export const DitherField = ({
  seed = "field",
  anchor = "top-right",
  density = 0.62,
  cellSize = 4,
  interactive = true,
  animated = true,
  className,
  ...props
}: DitherFieldProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<GridSize | null>(null);
  const isReduced = usePrefersReducedMotion();
  const cellPixels = Math.min(32, Math.max(2, cellSize));
  const fieldDensity = Math.min(1, Math.max(0, density));

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.contentRect;
      if (!box || box.width === 0 || box.height === 0) {
        return;
      }
      const next = measureGrid(box.width, box.height, cellPixels);
      setSize((current) =>
        current?.columns === next.columns && current.rows === next.rows
          ? current
          : next
      );
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [cellPixels]);

  useEffect(() => {
    const field = fieldRef.current;
    const host = field?.parentElement;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!(size && field && host && canvas && context)) {
      return;
    }
    const grid = createDitherFieldGrid({
      anchor,
      columns: size.columns,
      density: fieldDensity,
      rows: size.rows,
      seed: seedOf(seed),
    });
    const color = packColor(resolveColor(field, getComputedStyle(field).color));
    return startField({
      canvas,
      color,
      context,
      grid,
      host,
      isAnimated: animated && !isReduced,
      isInteractive: interactive,
    });
  }, [size, seed, anchor, fieldDensity, animated, interactive, isReduced]);

  return (
    <div
      aria-hidden
      className={cn(
        "text-foreground pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-20",
        className
      )}
      ref={fieldRef}
      {...props}
    >
      <canvas
        className="absolute inset-0 block size-full opacity-0 transition-opacity duration-300 ease-out data-[live=true]:opacity-100 motion-reduce:transition-none"
        data-live="false"
        ref={canvasRef}
        style={pixelated}
      />
    </div>
  );
};
