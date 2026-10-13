"use client";

import { useEffect, useEffectEvent, useMemo, useRef } from "react";

import { tokenRgb } from "@/components/profile/dither";
import type { DitherFrame, Rgb } from "@/components/profile/dither";
import { useDitherDrift } from "@/components/profile/use-dither-drift";
import type { DriftConfig } from "@/components/profile/use-dither-drift";

import {
  HERO_FIELD_COLUMNS,
  HERO_FIELD_ROWS,
  heroFieldCells,
  heroFieldPath,
} from "./hero-field-grid";

const heroDrift: DriftConfig = {
  amplitude: 4,
  anchor: { x: 1, y: 0 },
  band: 0.22,
  cell: 1,
  easing: 0.06,
  edge: "clear",
};

const pixelated = { imageRendering: "pixelated" } as const;

const readInk = () => {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const context = probe.getContext("2d", { willReadFrequently: true });
  return context ? tokenRgb(context, "--ink") : null;
};

const fieldFrame = (cells: Uint8Array, ink: Rgb): DitherFrame => {
  const data = new Uint8ClampedArray(cells.length * 4);
  for (const [index, isInk] of cells.entries()) {
    if (isInk) {
      data.set([...ink, 255], index * 4);
    }
  }
  return { data, height: HERO_FIELD_ROWS, width: HERO_FIELD_COLUMNS };
};

export const HeroField = ({ seed }: { seed: string }) => {
  const cells = useMemo(() => heroFieldCells(seed), [seed]);
  const path = useMemo(() => heroFieldPath(cells), [cells]);
  const fieldRef = useRef<HTMLDivElement>(null);
  const { canvasRef, onRender, onPointerMove, onPointerLeave } =
    useDitherDrift(heroDrift);
  const drift = useEffectEvent((event: globalThis.PointerEvent) =>
    onPointerMove(event)
  );
  const settle = useEffectEvent(() => onPointerLeave());

  useEffect(() => {
    const host = fieldRef.current?.parentElement;
    const ink = readInk();
    if (!(host && ink)) {
      return;
    }
    onRender(fieldFrame(cells, ink));
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) {
        settle();
      }
    });
    observer.observe(host);
    const handleMove = (event: globalThis.PointerEvent) => drift(event);
    const handleLeave = () => settle();
    host.addEventListener("pointermove", handleMove);
    host.addEventListener("pointerleave", handleLeave);
    return () => {
      observer.disconnect();
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
    };
  }, [cells, onRender]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-10"
      ref={fieldRef}
    >
      <canvas
        className="peer invisible absolute inset-0 block size-full object-cover object-right-top data-[active=true]:visible"
        data-active="false"
        ref={canvasRef}
        style={pixelated}
      />
      <svg
        className="fill-ink absolute inset-0 size-full [shape-rendering:crispEdges] peer-data-[active=true]:invisible"
        preserveAspectRatio="xMaxYMin slice"
        viewBox={`0 0 ${HERO_FIELD_COLUMNS} ${HERO_FIELD_ROWS}`}
      >
        <path d={path} />
      </svg>
    </div>
  );
};
