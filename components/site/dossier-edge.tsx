"use client";

import { useId } from "react";
import type { ReactNode } from "react";

import {
  EDGE_DITHER_CELL,
  EDGE_HOLE_PITCH,
  EDGE_HOLE_RADIUS,
  EDGE_HOLE_X,
  boundTile,
  edgeDitherCells,
  edgeDitherDotsPath,
} from "./dossier-edge-grid";
import { punchAndRipple } from "./edge/edge-press";
import { EdgeStrip } from "./edge/edge-strip";

const stripWidth = 48;
const holeCenter = EDGE_HOLE_PITCH / 2;

const PatternLayer = ({
  children,
  height,
}: {
  children: ReactNode;
  height: number;
}) => {
  const id = `edge-${useId().replaceAll(/[^a-zA-Z0-9]/gu, "")}`;
  return (
    <svg className="absolute inset-0 size-full">
      <defs>
        <pattern
          height={height}
          id={id}
          patternUnits="userSpaceOnUse"
          width={stripWidth}
        >
          {children}
        </pattern>
      </defs>
      <rect fill={`url(#${id})`} height="100%" width="100%" />
    </svg>
  );
};

const HoleLayer = () => (
  <PatternLayer height={EDGE_HOLE_PITCH}>
    <circle
      className="fill-paper-deep stroke-ink/30"
      cx={EDGE_HOLE_X}
      cy={holeCenter}
      r={EDGE_HOLE_RADIUS}
    />
    <circle
      className="fill-ink/20"
      cx={EDGE_HOLE_X}
      cy={holeCenter}
      r={EDGE_HOLE_RADIUS - 0.5}
    />
    <circle
      className="fill-paper-deep"
      cx={EDGE_HOLE_X}
      cy={holeCenter + 1.5}
      r={EDGE_HOLE_RADIUS - 1}
    />
  </PatternLayer>
);

const LitHoleLayer = () => (
  <PatternLayer height={EDGE_HOLE_PITCH}>
    <circle
      className="fill-ink"
      cx={EDGE_HOLE_X}
      cy={holeCenter}
      r={EDGE_HOLE_RADIUS + 0.5}
    />
    <circle
      className="fill-graphite"
      cx={EDGE_HOLE_X}
      cy={holeCenter + 2}
      r={3}
    />
  </PatternLayer>
);

const edgeCells = edgeDitherCells(boundTile);
const dotsHeight = boundTile.rows * EDGE_DITHER_CELL;
const restDotsPath = edgeDitherDotsPath(edgeCells, 2);
const swollenDotsPath = edgeDitherDotsPath(edgeCells, 3.5);

const RestDots = () => (
  <PatternLayer height={dotsHeight}>
    <path
      className="fill-ink/45 [shape-rendering:crispEdges]"
      d={restDotsPath}
    />
  </PatternLayer>
);

const SwollenDots = () => (
  <PatternLayer height={dotsHeight}>
    <path className="fill-ink" d={swollenDotsPath} />
  </PatternLayer>
);

export const DossierEdge = () => (
  <EdgeStrip
    base={
      <>
        <RestDots />
        <HoleLayer />
      </>
    }
    lit={
      <>
        <SwollenDots />
        <LitHoleLayer />
      </>
    }
    onPress={punchAndRipple}
  />
);
