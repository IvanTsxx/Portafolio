"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  SliderControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { posterLight } from "@/components/lab/source/form-tone";
import {
  inkRaster,
  readPortraitLuma,
} from "@/components/lab/source/ink-raster";
import { sourceOptions } from "@/components/lab/source/tone-chunk";
import type { SourceKind } from "@/components/lab/source/tone-chunk";
import { usePortraitImage } from "@/components/lab/source/use-portrait-image";
import { useElementSize } from "@/components/lab/use-element-size";
import { useStageActivity } from "@/components/lab/use-stage-activity";

import {
  createStippleField,
  dotRadiusFor,
  isStippleSettled,
  relaxStipple,
  setStippleCount,
  setStippleDensity,
  stippleGridFor,
  stirStipple,
  weightAt,
} from "./stipple-field";
import type { StippleField } from "./stipple-field";

interface StippleSettings {
  count: number;
  source: SourceKind;
}

interface Stipple {
  field: StippleField;
  cell: number;
  display: Float32Array;
  iterationMs: number;
  lastIterationMs: number;
  drawMs: number;
}

interface StirTrail {
  x: number;
  y: number;
  isActive: boolean;
}

const frameBudgetMs = 4;
const easeRate = 3;
const reducedIterationCap = 60;
const stirRadius = 56;
const stirStrength = 0.8;
const restDistance = 0.1;

const countFormat = new Intl.NumberFormat("en-US");

const syncDisplay = (stipple: Stipple) => {
  const { field, cell } = stipple;
  const display = new Float32Array(field.count * 2);
  const kept = Math.min(stipple.display.length, display.length);
  display.set(stipple.display.subarray(0, kept));
  for (let index = kept; index < display.length; index += 1) {
    display[index] = (field.points[index] ?? 0) * cell;
  }
  stipple.display = display;
};

const easeDisplay = (stipple: Stipple, blend: number) => {
  const { field, cell, display } = stipple;
  let farthest = 0;
  for (let index = 0; index < display.length; index += 1) {
    const target = (field.points[index] ?? 0) * cell;
    const current = display[index] ?? 0;
    const next = current + (target - current) * blend;
    display[index] = next;
    farthest = Math.max(farthest, Math.abs(target - next));
  }
  return farthest;
};

const StipplePreview = () => {
  const { activity, isOnscreen, isReduced, ref } =
    useStageActivity<HTMLDivElement>();
  const [settings, setSettings] = useState<StippleSettings>({
    count: 4000,
    source: "portrait",
  });
  const [scatters, setScatters] = useState(0);
  const portrait = usePortraitImage(settings.source === "portrait");
  const field = useRef<HTMLDivElement>(null);
  const size = useElementSize(field);
  const canvas = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLParagraphElement>(null);
  const stipple = useRef<Stipple | null>(null);
  const wake = useRef<(() => void) | null>(null);
  const trail = useRef<StirTrail>({ isActive: false, x: 0, y: 0 });
  const seenScatters = useRef(0);

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!(size && surface && context)) {
      return;
    }
    const ratio = window.devicePixelRatio || 1;
    surface.width = Math.round(size.width * ratio);
    surface.height = Math.round(size.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.fillStyle = getComputedStyle(surface).color;
    const { columns, rows } = stippleGridFor(size, settings.count);
    const cell = size.width / columns;
    const luma =
      settings.source === "portrait" && portrait
        ? readPortraitLuma(portrait, columns, rows)
        : null;
    const raster = inkRaster(settings.source, luma, columns, rows, posterLight);
    const { current } = stipple;
    if (current && scatters === seenScatters.current) {
      setStippleCount(current.field, settings.count);
      setStippleDensity(current.field, raster);
      current.cell = cell;
      syncDisplay(current);
    } else {
      const created = createStippleField(raster, settings.count, scatters + 7);
      const display = new Float32Array(created.count * 2);
      for (let index = 0; index < display.length; index += 1) {
        display[index] = (created.points[index] ?? 0) * cell;
      }
      stipple.current = {
        cell,
        display,
        drawMs: 0,
        field: created,
        iterationMs: 0,
        lastIterationMs: 0,
      };
    }
    seenScatters.current = scatters;
    wake.current?.();
  }, [size, settings.count, settings.source, portrait, scatters]);

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!(surface && context && isOnscreen)) {
      wake.current = null;
      return;
    }
    let frame = 0;
    let isRunning = false;
    let previous = 0;
    let wokenAtPass = 0;

    const draw = (current: Stipple) => {
      const started = performance.now();
      const { field: dots, display } = current;
      const baseRadius = dotRadiusFor(dots) * current.cell;
      context.clearRect(0, 0, surface.width, surface.height);
      context.beginPath();
      for (let point = 0; point < dots.count; point += 1) {
        const x = display[point * 2] ?? 0;
        const y = display[point * 2 + 1] ?? 0;
        const radius =
          baseRadius *
          (0.55 +
            0.45 *
              weightAt(
                dots,
                dots.points[point * 2] ?? 0,
                dots.points[point * 2 + 1] ?? 0
              ));
        context.moveTo(x + radius, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      }
      context.fill();
      current.drawMs = performance.now() - started;
      if (readout.current) {
        readout.current.textContent = `Lloyd ${current.lastIterationMs.toFixed(1)} ms · ${dots.iterations} passes · draw ${current.drawMs.toFixed(1)} ms`;
      }
    };

    const tick = (now: number) => {
      const { current } = stipple;
      if (!current) {
        isRunning = false;
        return;
      }
      const elapsed = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      const dots = current.field;
      if (!isStippleSettled(dots)) {
        const started = performance.now();
        const deadline = started + frameBudgetMs;
        const isPassDone = relaxStipple(
          dots,
          () => performance.now() < deadline
        );
        current.iterationMs += performance.now() - started;
        if (isPassDone) {
          current.lastIterationMs = current.iterationMs;
          current.iterationMs = 0;
        }
      }
      const isSettled =
        isStippleSettled(dots) ||
        (isReduced && dots.iterations - wokenAtPass >= reducedIterationCap);
      if (isReduced) {
        if (isSettled) {
          easeDisplay(current, 1);
          draw(current);
          isRunning = false;
          return;
        }
        frame = requestAnimationFrame(tick);
        return;
      }
      const farthest = easeDisplay(current, 1 - Math.exp(-elapsed * easeRate));
      draw(current);
      if (isSettled && farthest < restDistance) {
        isRunning = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    wake.current = () => {
      if (!isRunning) {
        isRunning = true;
        previous = 0;
        wokenAtPass = stipple.current?.field.iterations ?? 0;
        frame = requestAnimationFrame(tick);
      }
    };
    wake.current();
    return () => {
      cancelAnimationFrame(frame);
      wake.current = null;
    };
  }, [isOnscreen, isReduced]);

  const stir = (event: PointerEvent<HTMLDivElement>) => {
    const { current } = stipple;
    if (!current || isReduced) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const last = trail.current;
    if (last.isActive) {
      const pushX = ((x - last.x) * stirStrength) / current.cell;
      const pushY = ((y - last.y) * stirStrength) / current.cell;
      if (
        Math.abs(pushX) + Math.abs(pushY) > 0 &&
        stirStipple(
          current.field,
          x / current.cell,
          y / current.cell,
          pushX,
          pushY,
          stirRadius / current.cell
        )
      ) {
        wake.current?.();
      }
    }
    trail.current = { isActive: true, x, y };
  };

  return (
    <ExperimentStage
      activity={activity}
      controls={
        <>
          <ToggleControl
            label="Source"
            onChange={(source) =>
              setSettings((current) => ({ ...current, source }))
            }
            options={sourceOptions}
            value={settings.source}
          />
          <SliderControl
            format={(value) => countFormat.format(value)}
            hint="Move across the stage to stir the dots. They settle back."
            label="Dots"
            max={8000}
            min={1000}
            onChange={(count) =>
              setSettings((current) => ({ ...current, count }))
            }
            step={500}
            value={settings.count}
          />
          <ActionControl
            actionLabel="Scatter"
            label="Restart"
            onAction={() => setScatters((value) => value + 1)}
          />
        </>
      }
      reducedNote="Reduced motion is on. The dots settle out of sight and draw in one frame. Stirring is off."
      stageLabel="Stipple dots that relax into a portrait or a lit form and part around the pointer"
      stageRef={ref}
    >
      <div
        className="relative size-full cursor-crosshair touch-pan-y"
        onPointerLeave={() => {
          trail.current.isActive = false;
        }}
        onPointerMove={stir}
        ref={field}
      >
        <canvas
          aria-hidden
          className="text-ink absolute inset-0 size-full"
          ref={canvas}
        />
        <p
          aria-live="off"
          className="label bg-paper/90 text-graphite border-rule-strong pointer-events-none absolute top-4 right-5 border px-2 py-1 tabular-nums"
          ref={readout}
        >
          Relaxing
        </p>
      </div>
    </ExperimentStage>
  );
};

export default StipplePreview;
