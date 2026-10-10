"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import type { DitherFrame } from "./dither";

const BAND_RATIO = 0.16;
const AMPLITUDE = 16;
const CELL = 2;
const EASING = 0.12;
const SETTLED = 0.01;

interface DriftPointer {
  x: number;
  y: number;
  inside: boolean;
}

interface CoverAnchor {
  x: number;
  y: number;
}

const shiftRows = (
  source: DitherFrame,
  target: Uint8ClampedArray,
  pointer: DriftPointer,
  intensity: number,
  time: number
) => {
  const { width, height, data } = source;
  const rowBytes = width * 4;
  const band = height * BAND_RATIO;
  const lean = ((pointer.x - width / 2) / width) * AMPLITUDE;
  for (let y = 0; y < height; y += 1) {
    const row = Math.floor(y / CELL);
    const distance = (y - pointer.y) / band;
    const falloff = Math.exp(-distance * distance);
    const wave =
      Math.sin(time * 0.008 + row * 0.9) +
      0.5 * Math.sin(time * 0.013 - row * 0.37);
    const shift =
      Math.round((intensity * falloff * (AMPLITUDE * wave + lean)) / CELL) *
      CELL;
    const offset = ((shift % width) + width) % width;
    const start = y * rowBytes;
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

export const useDitherDrift = (anchor: CoverAnchor) => {
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
        ((pointer.inside ? 1 : 0) - intensityRef.current) * EASING;
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
        time
      );
      context.putImageData(imageRef.current, 0, 0);
      canvas.dataset.active = "true";
      requestRef.current = requestAnimationFrame(step);
    };
    requestRef.current = requestAnimationFrame(step);
  }, []);

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

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const frame = frameRef.current;
    if (event.pointerType !== "mouse" || reducedMotion || !frame) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const scale = Math.max(
      bounds.width / frame.width,
      bounds.height / frame.height
    );
    const offsetX = (bounds.width - frame.width * scale) * anchor.x;
    const offsetY = (bounds.height - frame.height * scale) * anchor.y;
    pointerRef.current = {
      inside: true,
      x: (event.clientX - bounds.left - offsetX) / scale,
      y: (event.clientY - bounds.top - offsetY) / scale,
    };
    run();
  };

  const onPointerLeave = () => {
    pointerRef.current = { ...pointerRef.current, inside: false };
    run();
  };

  return { canvasRef, onPointerLeave, onPointerMove, onRender };
};
