"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import type { LightPoint } from "@/components/lab/source/form-tone";
import {
  inkRaster,
  readPortraitLuma,
} from "@/components/lab/source/ink-raster";
import type { SourceKind } from "@/components/lab/source/tone-chunk";
import type { ElementSize } from "@/components/lab/use-element-size";

import { createHatchPlanner, penAt, traceSpan } from "./hatch-plan";
import type { HatchPlanner } from "./hatch-plan";

export type PlotPhase = "plotting" | "paused" | "done";

export interface PlotSettings {
  layers: number;
  pitch: number;
  source: SourceKind;
  speed: number;
}

export interface PlotSurfaces {
  canvas: RefObject<HTMLCanvasElement | null>;
  penHead: RefObject<HTMLDivElement | null>;
  readout: RefObject<HTMLParagraphElement | null>;
}

interface Plot {
  key: string;
  planner: HatchPlanner;
  phase: PlotPhase;
  pen: number;
  drawn: number;
  planMs: number;
  percent: number;
}

interface PlotSource {
  light: LightPoint;
  portrait: HTMLImageElement | null;
  settings: Omit<PlotSettings, "speed">;
  size: ElementSize | null;
  surfaces: PlotSurfaces;
}

interface PlotterInput extends PlotSource {
  isOnscreen: boolean;
  isReduced: boolean;
  settings: PlotSettings;
}

const basePenSpeed = 3000;
const frameBudgetMs = 4;
const maxCells = 40_000;
const hatchAngle = Math.PI / 4;

const renderPlot = (
  current: Plot,
  { canvas, penHead, readout }: PlotSurfaces,
  onPercent: (percent: number) => void
) => {
  const surface = canvas.current;
  const context = surface?.getContext("2d");
  if (!(surface && context)) {
    return;
  }
  const { plan } = current.planner;
  if (current.pen < current.drawn) {
    context.clearRect(0, 0, surface.width, surface.height);
    current.drawn = 0;
  }
  if (current.pen > current.drawn) {
    context.beginPath();
    traceSpan(context, plan, current.drawn, current.pen);
    context.stroke();
    current.drawn = current.pen;
  }
  const head = penAt(plan, current.pen);
  if (penHead.current && head) {
    penHead.current.style.transform = `translate(${head.x}px, ${head.y}px)`;
  }
  const percent =
    plan.timelineLength > 0
      ? Math.round((current.pen / plan.timelineLength) * 100)
      : 0;
  if (percent !== current.percent) {
    current.percent = percent;
    onPercent(percent);
  }
  if (readout.current) {
    readout.current.textContent = `Plan ${current.planMs.toFixed(1)} ms · ${plan.count} strokes`;
  }
};

const advancePlot = (current: Plot, speed: number, elapsed: number) => {
  const { planner } = current;
  if (!planner.isDone()) {
    const started = performance.now();
    const deadline = started + frameBudgetMs;
    planner.step(() => performance.now() < deadline);
    current.planMs += performance.now() - started;
  }
  const total = planner.plan.timelineLength;
  if (current.phase === "plotting") {
    current.pen = Math.min(current.pen + basePenSpeed * speed * elapsed, total);
  }
  if (current.phase === "done") {
    current.pen = total;
  }
};

const preparePlot = (
  key: string,
  { light, portrait, settings, size, surfaces }: PlotSource,
  phase: PlotPhase
): Plot | null => {
  const surface = surfaces.canvas.current;
  const context = surface?.getContext("2d");
  if (!(size && surface && context)) {
    return null;
  }
  const ratio = window.devicePixelRatio || 1;
  surface.width = Math.round(size.width * ratio);
  surface.height = Math.round(size.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.lineCap = "round";
  context.lineWidth = 1;
  context.strokeStyle = getComputedStyle(surface).color;
  const cell = Math.max(2, Math.sqrt((size.width * size.height) / maxCells));
  const columns = Math.max(1, Math.round(size.width / cell));
  const rows = Math.max(1, Math.round(size.height / cell));
  const started = performance.now();
  const luma =
    settings.source === "portrait" && portrait
      ? readPortraitLuma(portrait, columns, rows)
      : null;
  const raster = inkRaster(settings.source, luma, columns, rows, light);
  return {
    drawn: 0,
    key,
    pen: 0,
    percent: -1,
    phase,
    planMs: performance.now() - started,
    planner: createHatchPlanner(raster, size.width / columns, {
      angle: hatchAngle,
      layers: settings.layers,
      pitch: settings.pitch,
    }),
  };
};

export const usePlotter = (input: PlotterInput) => {
  const { isOnscreen, isReduced, light, portrait, settings, size, surfaces } =
    input;
  const { layers, pitch, source, speed } = settings;
  const plotKey = [
    size?.width,
    size?.height,
    layers,
    pitch,
    source,
    portrait ? "portrait" : "none",
    light.x,
    light.y,
    isReduced,
  ].join("|");
  const startPhase: PlotPhase = isReduced ? "done" : "plotting";
  const [phaseRecord, setPhaseRecord] = useState<{
    key: string;
    phase: PlotPhase;
  }>({
    key: "",
    phase: startPhase,
  });
  const [progress, setProgress] = useState(0);
  const plot = useRef<Plot | null>(null);
  const wake = useRef<(() => void) | null>(null);
  const phase = phaseRecord.key === plotKey ? phaseRecord.phase : startPhase;

  useEffect(() => {
    const prepared = preparePlot(
      plotKey,
      { light, portrait, settings: { layers, pitch, source }, size, surfaces },
      startPhase
    );
    if (prepared) {
      plot.current = prepared;
      wake.current?.();
    }
  }, [
    plotKey,
    startPhase,
    light,
    portrait,
    layers,
    pitch,
    source,
    size,
    surfaces,
  ]);

  useEffect(() => {
    if (!isOnscreen) {
      wake.current = null;
      return;
    }
    let frame = 0;
    let isRunning = false;
    let previous = 0;
    const tick = (now: number) => {
      const { current } = plot;
      if (!current) {
        isRunning = false;
        return;
      }
      const elapsed = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      advancePlot(current, speed, elapsed);
      const isPlanned = current.planner.isDone();
      if (current.phase !== "done" || isPlanned) {
        renderPlot(current, surfaces, setProgress);
      }
      if (
        current.phase === "plotting" &&
        isPlanned &&
        current.pen >= current.planner.plan.timelineLength
      ) {
        current.phase = "done";
        setPhaseRecord({ key: current.key, phase: "done" });
      }
      if (isPlanned && current.phase !== "plotting") {
        isRunning = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    wake.current = () => {
      if (!isRunning) {
        isRunning = true;
        previous = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    wake.current();
    return () => {
      cancelAnimationFrame(frame);
      wake.current = null;
    };
  }, [isOnscreen, speed, surfaces]);

  const changePhase = (current: Plot, next: PlotPhase) => {
    current.phase = next;
    setPhaseRecord({ key: current.key, phase: next });
    wake.current?.();
  };

  const scrub = (percent: number) => {
    const { current } = plot;
    if (!current) {
      return;
    }
    current.pen = (current.planner.plan.timelineLength * percent) / 100;
    renderPlot(current, surfaces, setProgress);
    changePhase(current, "paused");
  };

  const togglePen = () => {
    const { current } = plot;
    if (!current) {
      return;
    }
    if (current.phase === "plotting") {
      changePhase(current, "paused");
      return;
    }
    if (current.phase === "done") {
      current.pen = 0;
      renderPlot(current, surfaces, setProgress);
    }
    changePhase(current, "plotting");
  };

  return { phase, progress, scrub, togglePen };
};
