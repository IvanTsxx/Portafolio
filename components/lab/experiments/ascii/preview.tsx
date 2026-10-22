"use client";

import { useId, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  SliderControl,
  TextControl,
  ToggleControl,
} from "@/components/lab/lab-controls";
import { imageSourceOptions } from "@/components/lab/source/tone-chunk";
import type { SourceImage } from "@/components/lab/source/tone-chunk";
import {
  releaseStagePointer,
  trackStagePointer,
} from "@/components/lab/source/use-source";
import type { StagePointer } from "@/components/lab/source/use-source";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import { useViewSlot } from "@/components/scene/view-registry";

import AsciiView from "./ascii-view";
import type { ScanMode } from "./ascii-view";
import { glyphRamps } from "./ramps";
import type { GlyphSet } from "./ramps";

const glyphSetOptions = [
  { label: "Classic", value: "classic" },
  { label: "Blocks", value: "blocks" },
  { label: "Custom", value: "custom" },
] as const;

const scanOptions = [
  { label: "Sharpen", value: "sharpen" },
  { label: "Invert", value: "invert" },
] as const;

const customLimit = 12;

interface AsciiControls {
  cell: number;
  custom: string;
  glyphSet: GlyphSet;
  scanMode: ScanMode;
  source: SourceImage;
}

const rampFor = ({ glyphSet, custom }: AsciiControls) =>
  glyphSet === "custom" ? custom || glyphRamps.classic : glyphRamps[glyphSet];

const AsciiPreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [controls, setControls] = useState<AsciiControls>({
    cell: 12,
    custom: ".:ivo/",
    glyphSet: "classic",
    scanMode: "sharpen",
    source: "messi",
  });

  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const pointer = useRef<StagePointer>({
    isHovering: false,
    x: 0.5,
    y: 0.5,
  });

  useViewSlot(
    slotId,
    field,
    <AsciiView
      animate={activity === "running"}
      pointer={pointer}
      settings={{
        cell: controls.cell,
        ramp: rampFor(controls),
        scanMode: controls.scanMode,
        source: controls.source,
      }}
    />
  );

  return (
    <ExperimentStage
      activity={activity}
      className="[&>p]:z-40 [&>span]:z-40"
      controls={
        <>
          <ToggleControl
            label="Source"
            onChange={(source) =>
              setControls((current) => ({ ...current, source }))
            }
            options={imageSourceOptions}
            value={controls.source}
          />
          <ToggleControl
            label="Glyphs"
            onChange={(glyphSet) =>
              setControls((current) => ({ ...current, glyphSet }))
            }
            options={glyphSetOptions}
            value={controls.glyphSet}
          />
          {controls.glyphSet === "custom" ? (
            <TextControl
              hint="Sorted by measured ink. A space is always the lightest."
              label="Custom set"
              maxLength={customLimit}
              onChange={(custom) =>
                setControls((current) => ({ ...current, custom }))
              }
              value={controls.custom}
            />
          ) : null}
          <SliderControl
            format={(value) => `${value}px`}
            label="Cell size"
            max={28}
            min={8}
            onChange={(cell) =>
              setControls((current) => ({ ...current, cell }))
            }
            value={controls.cell}
          />
          <ToggleControl
            label="Scanner"
            onChange={(scanMode) =>
              setControls((current) => ({ ...current, scanMode }))
            }
            options={scanOptions}
            value={controls.scanMode}
          />
        </>
      }
      reducedNote="Reduced motion is on. The scanner holds still. It jumps to the pointer without easing."
      stageLabel="ASCII rendering of a lit form with a scanner that follows the pointer"
      stageRef={ref}
    >
      <div
        className="pointer-events-auto size-full cursor-crosshair touch-pan-y"
        onPointerLeave={() => releaseStagePointer(pointer.current)}
        onPointerMove={(event) => trackStagePointer(pointer.current, event)}
        ref={field}
      />
    </ExperimentStage>
  );
};

export default AsciiPreview;
