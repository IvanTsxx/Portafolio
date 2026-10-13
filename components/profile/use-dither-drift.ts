"use client";

import { useCallback, useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import type { DitherFrame } from "./dither";

const SETTLED = 0.01;

interface DriftPointer {
  x: number;
  y: number;
  inside: boolean;
}

export interface DriftConfig {
  anchor: { x: number; y: number };
  amplitude: number;
  band: number;
  cell: number;
  easing: number;
}

interface DriftPointerEvent {
  clientX: number;
  clientY: number;
  pointerType: string;
}

const shiftRows = (
  source: DitherFrame,
  target: Uint8ClampedArray,
  pointer: DriftPointer,
  intensity: number,
  time: number,
  config: DriftConfig
) => {
  const { width, height, data } = source;
  const { amplitude, cell } = config;
  const rowBytes = width * 4;
  const band = height * config.band;
  const lean = ((pointer.x - width / 2) / width) * amplitude;
  for (let y = 0; y < height; y += 1) {
    const row = Math.floor(y / cell);
    const distance = (y - pointer.y) / band;
    const falloff = Math.exp(-distance * distance);
    const wave =
      Math.sin(time * 0.008 + row * 0.9) +
      0.5 * Math.sin(time * 0.013 - row * 0.37);
    const shift =
      Math.round((intensity * falloff * (amplitude * wave + lean)) / cell) *
      cell;
    const start = y * rowBytes;
    const offset = ((shift % width) + width) % width;
    target.set(
      data.subarray(start + (width - offset) * 4, start + rowBytes),
      start
    );
    target.set(
      data.subarray(start, start + (width - offset) * 4),
      start + offset * 4
    );
  }
};

export const useDitherDrift = (config: DriftConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<DitherFrame | null>(null);
  const imageRef = useRef<ImageData | null>(null);
  const pointerRef = useRef<DriftPointer>({ inside: false, x: 0, y: 0 });
  const intensityRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  const run = useCallback(() => {
    if (requestRef.current !== null) {
      return;
    }
    const step = (time: number) => {
      const canvas = canvasRef.current;
      const frame = frameRef.current;
      const context = canvas?.getContext("2d");
      if (!(canvas && frame && context)) {
        requestRef.current = null;
        return;
      }
      const pointer = pointerRef.current;
      intensityRef.current +=
        ((pointer.inside ? 1 : 0) - intensityRef.current) * config.easing;
      if (!pointer.inside && intensityRef.current < SETTLED) {
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
      shiftRows(
        frame,
        imageRef.current.data,
        pointer,
        intensityRef.current,
        time,
        config
      );
      context.putImageData(imageRef.current, 0, 0);
      canvas.dataset.active = "true";
      requestRef.current = requestAnimationFrame(step);
    };
    requestRef.current = requestAnimationFrame(step);
  }, [config]);

  useEffect(
    () => () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    },
    []
  );

  const onRender = useCallback((frame: DitherFrame) => {
    frameRef.current = frame;
  }, []);

  const onPointerMove = useCallback(
    (event: DriftPointerEvent) => {
      const frame = frameRef.current;
      const canvas = canvasRef.current;
      if (event.pointerType !== "mouse" || reducedMotion || !frame || !canvas) {
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      const scale = Math.max(
        bounds.width / frame.width,
        bounds.height / frame.height
      );
      const offsetX = (bounds.width - frame.width * scale) * config.anchor.x;
      const offsetY = (bounds.height - frame.height * scale) * config.anchor.y;
      pointerRef.current = {
        inside: true,
        x: (event.clientX - bounds.left - offsetX) / scale,
        y: (event.clientY - bounds.top - offsetY) / scale,
      };
      run();
    },
    [config, reducedMotion, run]
  );

  const onPointerLeave = useCallback(() => {
    pointerRef.current = { ...pointerRef.current, inside: false };
    run();
  }, [run]);

  return { canvasRef, onPointerLeave, onPointerMove, onRender };
};
