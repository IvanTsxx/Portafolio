"use client";

import { memo } from "react";

import type { LoomYear } from "./loom-model";
import { pinPathsOf } from "./loom-pins";
import type { PinField } from "./loom-pins";

const edgeToneOf = (isVoid: boolean, height: number) => {
  if (isVoid) {
    return "faint";
  }
  return height > 0 ? "hi" : "lo";
};

const PinBedView = ({
  field,
  shades,
  year,
}: {
  field: PinField;
  shades: { faceX: number; faceY: number };
  year: LoomYear;
}) => (
  <g data-pins>
    {field.order.map((cell) => {
      const isVoid = year.cells[cell] === null;
      const height = year.heights[cell] ?? 0;
      const paths = pinPathsOf(field, cell, height);
      return (
        <g
          className={isVoid ? undefined : "cursor-pointer"}
          data-cell={cell}
          data-void={isVoid ? "" : undefined}
          key={cell}
        >
          <g className="iso-solid">
            <path
              className="iso-shade"
              d={paths.faceX}
              data-shade={shades.faceX}
            />
            <path
              className="iso-shade"
              d={paths.faceY}
              data-shade={shades.faceY}
            />
            <path className="iso-top" d={paths.top} />
            <path
              className="iso-line iso-edge"
              d={paths.edge}
              data-tone={edgeToneOf(isVoid, height)}
            />
          </g>
        </g>
      );
    })}
  </g>
);

export const PinBed = memo(PinBedView);
