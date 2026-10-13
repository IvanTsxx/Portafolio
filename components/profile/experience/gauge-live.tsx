"use client";

import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

import { CornerMarks } from "@/components/site/corner-marks";

import type { Tenure } from "./career";
import { detailText, spokenText } from "./career";
import type { GaugeParts } from "./gauge-art";
import { GAUGE_HEIGHT, GAUGE_WIDTH, translateBy } from "./gauge-geometry";
import type { GaugeRig } from "./gauge-geometry";
import { restOf } from "./gauge-motion";
import { JobChips } from "./job-chips";
import { useGaugeMotion } from "./use-gauge-motion";
import type { GaugeNode, GaugeNodes } from "./use-gauge-motion";
import { useGaugeSelection, useIdleTour } from "./use-gauge-selection";

const jobAt = (event: MouseEvent<SVGSVGElement>) => {
  const target = event.target instanceof Element ? event.target : null;
  const job = target?.closest<SVGGElement>("[data-job]")?.dataset.job;
  return job === undefined ? null : Number(job);
};

const restTransforms = (rig: GaugeRig, initial: number) => {
  const stop = rig.stops[initial];
  if (!stop) {
    return { bridge: undefined, carriage: undefined, ram: undefined };
  }
  const { bx, cy, ext } = restOf(stop);
  return {
    bridge: translateBy(rig.axes, [bx.at, 0, 0]),
    carriage: translateBy(rig.axes, [bx.at, cy.at, 0]),
    ram: translateBy(rig.axes, [bx.at, cy.at, -ext.at]),
  };
};

const Readout = ({ tenure }: { tenure: Tenure | undefined }) => (
  <span className="ml-auto flex flex-col items-end text-right" data-readout>
    <span className="text-ink text-sm leading-tight font-medium tracking-tight">
      {tenure?.company}
    </span>
    <span className="label text-graphite tabular-nums">
      {tenure ? detailText(tenure) : null}
    </span>
  </span>
);

const GaugeCard = ({
  children,
  tenure,
}: {
  children: ReactNode;
  tenure: Tenure | undefined;
}) => (
  <div className="border-rule-strong bg-paper has-[input:focus-visible]:outline-ink relative flex flex-col border outline-offset-4 has-[input:focus-visible]:outline-1">
    <CornerMarks />
    <div className="label text-graphite flex items-start justify-between gap-4 px-4 pt-3">
      <span className="tabular-nums">Fig 03</span>
      <span className="text-ink">Tenure gauge</span>
    </div>
    {children}
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-4 pb-3">
      <span className="label text-mist">Pick a job ← →</span>
      <Readout tenure={tenure} />
    </div>
  </div>
);

export interface GaugeLiveProps {
  caption: string;
  initial: number;
  label: string;
  parts: GaugeParts;
  rig: GaugeRig;
  tenures: readonly Tenure[];
}

export const GaugeLive = ({
  caption,
  initial,
  label,
  parts,
  rig,
  tenures,
}: GaugeLiveProps) => {
  const count = tenures.length;
  const root = useRef<HTMLElement>(null);
  const nodes = useRef<GaugeNodes>({});
  const selection = useGaugeSelection(count, initial);
  const { shown } = selection;
  const motion = useGaugeMotion({ nodes, rig, root, shown });
  useIdleTour({
    advance: selection.advance,
    isActive: motion.isVisible && !motion.isReduced && !selection.isEngaged,
    lastTouch: selection.lastTouch,
    root,
  });
  const bind = (key: GaugeNode) => (node: SVGGElement | null) => {
    nodes.current[key] = node;
  };
  const rest = restTransforms(rig, initial);
  const tenure = tenures[shown];

  return (
    <div
      className="flex flex-col gap-3"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          selection.engage(false);
        }
      }}
      onFocus={() => selection.engage(true)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          selection.engage(true);
        }
      }}
      onPointerLeave={() => selection.engage(false)}
    >
      <figure
        className="iso m-0 flex flex-col gap-2"
        data-build-block
        data-build-self
        ref={root}
      >
        <GaugeCard tenure={tenure}>
          <div className="-my-1 touch-pan-y overflow-hidden px-1 select-none sm:px-4">
            <input
              aria-label={label}
              aria-valuetext={tenure ? spokenText(tenure) : undefined}
              className="sr-only"
              max={count}
              min={1}
              onChange={(event) =>
                selection.commit(Number(event.target.value) - 1)
              }
              step={1}
              type="range"
              value={shown + 1}
            />
            <svg
              aria-hidden
              className="iso-svg"
              focusable="false"
              onClick={(event) => {
                const job = jobAt(event);
                if (job !== null) {
                  selection.commit(job);
                }
              }}
              onPointerLeave={() => selection.preview(null)}
              onPointerOver={(event) => {
                const job = jobAt(event);
                if (event.pointerType === "mouse" && job !== null) {
                  selection.preview(job);
                }
              }}
              viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}
            >
              {parts.base}
              <g data-part="rails">{parts.railBack}</g>
              <g data-part="bridge">
                <g ref={bind("bridgeBack")} transform={rest.bridge}>
                  {parts.bridgeBack}
                </g>
              </g>
              <g data-part="plate">{parts.plate}</g>
              {parts.blocks.toReversed().map((block, reversed) => {
                const index = count - 1 - reversed;
                return (
                  <g
                    className="cursor-pointer"
                    data-on={index === shown ? "" : undefined}
                    data-part={`block-${index}`}
                    key={tenures[index]?.id ?? index}
                  >
                    {block}
                  </g>
                );
              })}
              <g data-part="rails">{parts.railFront}</g>
              <g data-part="bridge">
                <g ref={bind("bridgeFront")} transform={rest.bridge}>
                  {parts.bridgeFront}
                </g>
              </g>
              <g data-part="carriage">
                <g ref={bind("saddle")} transform={rest.carriage}>
                  {parts.saddle}
                </g>
                <g ref={bind("ram")} transform={rest.ram}>
                  {parts.ram}
                </g>
                <g ref={bind("housing")} transform={rest.carriage}>
                  {parts.housing}
                </g>
              </g>
              <g data-part="console">{parts.console}</g>
            </svg>
          </div>
        </GaugeCard>
        <figcaption className="text-graphite text-sm leading-relaxed text-pretty">
          {caption}
        </figcaption>
      </figure>
      <JobChips
        committed={selection.committed}
        onCommit={(index) => selection.commit(index)}
        onPreview={(index) => selection.preview(index)}
        shown={shown}
        tenures={tenures}
      />
    </div>
  );
};
