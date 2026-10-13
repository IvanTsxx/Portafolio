"use client";

import { cva } from "class-variance-authority";
import { useId, useMemo } from "react";
import type { ReactNode } from "react";

import {
  EDGE_DITHER_CELL,
  EDGE_DITHER_ROWS,
  edgeDitherCells,
  edgeDitherDotsPath,
} from "./dossier-edge-grid";
import type { DossierEdgeSize, DossierEdgeVariant } from "./dossier-edge-model";
import { markPosition, sendWave, toggleMark } from "./edge/edge-press";
import type { EdgeMark, EdgePress } from "./edge/edge-press";
import { EdgeStrip } from "./edge/edge-strip";

const marginStripWidth = 48;

const marginStripClassName = "inset-y-4 left-0 z-20 hidden w-12 md:block";

const rulerStripVariants = cva(
  "bottom-full left-0 z-20 mb-1 hidden h-9 cursor-crosshair lg:block",
  {
    variants: {
      size: {
        detail: "right-0",
        document: "right-16",
      },
    },
  }
);

const fillPattern = (id: string, className?: string) => (
  <rect className={className} fill={`url(#${id})`} height="100%" width="100%" />
);

const usePatternIds = () => {
  const id = useId().replaceAll(/[^a-zA-Z0-9]/gu, "");
  return { base: `edge-base-${id}`, lit: `edge-lit-${id}` };
};

const PatternLayer = ({
  children,
  className = "absolute inset-0 size-full",
  height,
  id,
  width,
}: {
  children: ReactNode;
  className?: string;
  height: number;
  id: string;
  width: number;
}) => (
  <svg className={className}>
    <defs>
      <pattern
        height={height}
        id={id}
        patternUnits="userSpaceOnUse"
        width={width}
      >
        {children}
      </pattern>
    </defs>
    {fillPattern(id)}
  </svg>
);

const bindingPitch = 28;
const bindingHoleX = 20;

const reinforcementMark: EdgeMark = {
  build: (slot) => {
    const ring = document.createElement("span");
    ring.className =
      "border-ink absolute left-5 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2";
    ring.style.top = `${markPosition(slot, reinforcementMark)}px`;
    return ring;
  },
  enter: [
    { opacity: 0, transform: "scale(1.6)" },
    { offset: 0.7, opacity: 1, transform: "scale(0.9)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  limit: 12,
  offset: bindingPitch / 2,
  pitch: bindingPitch,
};

const BindingEdge = () => {
  const ids = usePatternIds();
  const center = bindingPitch / 2;
  return (
    <EdgeStrip
      axis="y"
      base={
        <PatternLayer
          height={bindingPitch}
          id={ids.base}
          width={marginStripWidth}
        >
          <circle
            className="fill-paper-deep stroke-rule-strong"
            cx={bindingHoleX}
            cy={center}
            r={5}
          />
          <circle
            className="fill-ink/20"
            cx={bindingHoleX}
            cy={center}
            r={4.5}
          />
          <circle
            className="fill-paper-deep"
            cx={bindingHoleX}
            cy={center + 1.5}
            r={4}
          />
        </PatternLayer>
      }
      className={`${marginStripClassName} cursor-pointer`}
      lit={
        <PatternLayer
          height={bindingPitch}
          id={ids.lit}
          width={marginStripWidth}
        >
          <circle
            className="fill-ink stroke-ink"
            cx={bindingHoleX}
            cy={center}
            r={5.5}
          />
          <circle
            className="fill-graphite"
            cx={bindingHoleX}
            cy={center + 2}
            r={3}
          />
        </PatternLayer>
      }
      onPress={(press) => toggleMark(press, reinforcementMark)}
    />
  );
};

const stitchPitch = 20;
const stitchX = 22;

const StitchEdge = () => {
  const ids = usePatternIds();
  return (
    <EdgeStrip
      axis="y"
      base={
        <PatternLayer
          height={stitchPitch}
          id={ids.base}
          width={marginStripWidth}
        >
          <line
            className="stroke-mist"
            strokeDasharray="1.5 2"
            x1={stitchX}
            x2={stitchX}
            y1={13}
            y2={23}
          />
          <line
            className="stroke-graphite"
            strokeLinecap="round"
            strokeWidth={1.5}
            x1={stitchX}
            x2={stitchX}
            y1={4}
            y2={12}
          />
          <circle className="fill-ink" cx={stitchX} cy={3} r={1.25} />
          <circle className="fill-ink" cx={stitchX} cy={13} r={1.25} />
        </PatternLayer>
      }
      className={`${marginStripClassName} cursor-pointer`}
      lit={
        <PatternLayer
          height={stitchPitch}
          id={ids.lit}
          width={marginStripWidth}
        >
          <line
            className="stroke-ink"
            strokeLinecap="round"
            strokeWidth={2.5}
            x1={stitchX}
            x2={stitchX}
            y1={4.5}
            y2={11.5}
          />
          <circle className="fill-ink" cx={stitchX} cy={3} r={1.75} />
          <circle className="fill-ink" cx={stitchX} cy={13} r={1.75} />
        </PatternLayer>
      }
      onPress={sendWave}
    />
  );
};

const DitherEdge = () => {
  const ids = usePatternIds();
  const [restDots, swollenDots] = useMemo(() => {
    const cells = edgeDitherCells();
    return [edgeDitherDotsPath(cells, 2), edgeDitherDotsPath(cells, 3.5)];
  }, []);
  const width = marginStripWidth;
  const height = EDGE_DITHER_ROWS * EDGE_DITHER_CELL;
  return (
    <EdgeStrip
      axis="y"
      base={
        <PatternLayer height={height} id={ids.base} width={width}>
          <path
            className="fill-ink/45 [shape-rendering:crispEdges]"
            d={restDots}
          />
        </PatternLayer>
      }
      className={`${marginStripClassName} cursor-pointer`}
      lit={
        <PatternLayer height={height} id={ids.lit} width={width}>
          <path className="fill-ink" d={swollenDots} />
        </PatternLayer>
      }
      onPress={sendWave}
    />
  );
};

const rulerUnit = 4;
const rulerPeriod = 64;
const rulerTickHeight = 20;

const rulerTickLength = (tick: number) => {
  if (tick === 0) {
    return 14;
  }
  return tick % 4 === 0 ? 8 : 4;
};

const rulerTicks = Array.from(
  { length: rulerPeriod / rulerUnit },
  (_, tick) => ({ length: rulerTickLength(tick), x: tick * rulerUnit + 0.5 })
);

const rulerReading = (at: number) =>
  `${Math.max(0, Math.round(at / rulerUnit) * rulerUnit)} px`;

const rulerMark: EdgeMark = {
  build: (slot) => {
    const at = markPosition(slot, rulerMark);
    const mark = document.createElement("span");
    mark.className = "bg-ink absolute top-4 -bottom-3 w-px";
    mark.style.left = `${at}px`;
    const value = document.createElement("span");
    value.className =
      "label bg-paper text-ink absolute bottom-full left-0 -translate-x-1/2 px-1 tabular-nums";
    value.textContent = rulerReading(at);
    mark.append(value);
    return mark;
  },
  enter: [
    { opacity: 0, transform: "translateY(-6px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  limit: 6,
  offset: 0,
  pitch: rulerUnit,
};

const rulerLayerClassName = "absolute inset-x-0 bottom-0 h-5 w-full";

const RulerEdge = ({ size }: { size: DossierEdgeSize }) => {
  const ids = usePatternIds();
  return (
    <EdgeStrip
      axis="x"
      base={
        <>
          <PatternLayer
            className={rulerLayerClassName}
            height={rulerTickHeight}
            id={ids.base}
            width={rulerPeriod}
          >
            {rulerTicks.map((tick) => (
              <line
                className="stroke-mist"
                key={tick.x}
                x1={tick.x}
                x2={tick.x}
                y1={rulerTickHeight - tick.length}
                y2={rulerTickHeight}
              />
            ))}
          </PatternLayer>
          <span className="bg-rule-strong absolute inset-x-0 bottom-0 h-px" />
        </>
      }
      className={rulerStripVariants({ size })}
      lit={
        <PatternLayer
          className={rulerLayerClassName}
          height={rulerTickHeight}
          id={ids.lit}
          width={rulerPeriod}
        >
          {rulerTicks.map((tick) => (
            <line
              className="stroke-ink"
              key={tick.x}
              x1={tick.x}
              x2={tick.x}
              y1={rulerTickHeight - tick.length - 4}
              y2={rulerTickHeight}
            />
          ))}
        </PatternLayer>
      }
      onPress={(press: EdgePress) => toggleMark(press, rulerMark)}
      readout={rulerReading}
    />
  );
};

const edgeRenderers = {
  binding: BindingEdge,
  dither: DitherEdge,
  none: () => null,
  ruler: RulerEdge,
  stitch: StitchEdge,
} as const satisfies Record<
  DossierEdgeVariant,
  (props: { size: DossierEdgeSize }) => ReactNode
>;

export const DossierEdge = ({
  size,
  variant,
}: {
  size: DossierEdgeSize;
  variant: DossierEdgeVariant;
}) => {
  const Edge = edgeRenderers[variant];
  return <Edge size={size} />;
};
