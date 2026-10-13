"use client";

import type { MouseEvent, PointerEvent, RefObject } from "react";

import type { LoomParts } from "./loom-art";
import {
  cellAtPoint,
  LOOM_HEIGHT,
  LOOM_WIDTH,
  translateBy,
} from "./loom-layout";
import type { LoomLayout } from "./loom-layout";
import { cellOf } from "./loom-model";
import type { LoomYear } from "./loom-model";
import type { PinField } from "./loom-pins";
import { PinBed } from "./pin-bed";

export type LoomControl =
  | { kind: "busiest" }
  | { kind: "sweep" }
  | { kind: "year"; year: number };

type SvgEvent = MouseEvent<SVGSVGElement> | PointerEvent<SVGSVGElement>;

const controlOf = (event: SvgEvent): LoomControl | null => {
  const target = event.target instanceof Element ? event.target : null;
  const control = target?.closest<SVGGElement>("[data-control]");
  const kind = control?.dataset.control;
  if (kind === "year") {
    return { kind, year: Number(control?.dataset.year) };
  }
  if (kind === "sweep" || kind === "busiest") {
    return { kind };
  }
  return null;
};

const cellOfEvent = (event: SvgEvent, layout: LoomLayout, year: LoomYear) => {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest("[data-control]")) {
    return null;
  }
  const pin = target?.closest<SVGGElement>("[data-cell]");
  if (pin) {
    return pin.dataset.void === undefined ? Number(pin.dataset.cell) : null;
  }
  const matrix = event.currentTarget.getScreenCTM()?.inverse();
  if (!matrix) {
    return null;
  }
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
    matrix
  );
  const hit = cellAtPoint(layout, [point.x, point.y]);
  const cell = hit ? cellOf(hit.week, hit.day) : -1;
  return year.cells[cell] ? cell : null;
};

export const LoomDrawing = ({
  consoleRef,
  field,
  initialYear,
  layout,
  onCell,
  onControl,
  onPick,
  parts,
  shades,
  svgRef,
  year,
}: {
  consoleRef: RefObject<SVGGElement | null>;
  field: PinField;
  initialYear: LoomYear;
  layout: LoomLayout;
  onCell: (cell: number | null) => void;
  onControl: (control: LoomControl) => void;
  onPick: (cell: number) => void;
  parts: LoomParts;
  shades: { faceX: number; faceY: number };
  svgRef: RefObject<SVGSVGElement | null>;
  year: LoomYear;
}) => {
  const bridgeRest = translateBy(layout.axes, [layout.parkLeft, 0, 0]);
  return (
    <svg
      aria-hidden
      className="iso-svg"
      focusable="false"
      onClick={(event) => {
        const control = controlOf(event);
        if (control) {
          onControl(control);
          return;
        }
        const cell = cellOfEvent(event, layout, year);
        if (cell !== null) {
          onPick(cell);
        }
      }}
      onPointerLeave={() => onCell(null)}
      onPointerMove={(event) => {
        if (event.pointerType !== "touch") {
          onCell(cellOfEvent(event, layout, year));
        }
      }}
      ref={svgRef}
      viewBox={`0 0 ${LOOM_WIDTH} ${LOOM_HEIGHT}`}
    >
      {parts.base}
      <g data-part="rails">
        {parts.railBack}
        {parts.drive}
      </g>
      <g data-part="bridge">
        <g data-bridge transform={bridgeRest}>
          {parts.bridgeBack}
        </g>
      </g>
      {parts.bed}
      <PinBed field={field} shades={shades} year={initialYear} />
      <g data-part="rails">{parts.railFront}</g>
      <g data-part="bridge">
        <g data-bridge transform={bridgeRest}>
          {parts.bridgeFront}
        </g>
      </g>
      <g data-part="console" ref={consoleRef}>
        {parts.console}
      </g>
    </svg>
  );
};
