"use client";

import type { MouseEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { ExperimentStage } from "@/components/lab/experiment-stage";
import {
  ActionControl,
  SliderControl,
  TextControl,
} from "@/components/lab/lab-controls";
import { useStageActivity } from "@/components/lab/use-stage-activity";
import {
  requestSceneFrame,
  useViewSlot,
} from "@/components/scene/view-registry";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { createStampAtlas, loadStampFont } from "./stamp-atlas";
import {
  emptySheet,
  maxStampLength,
  nextSlot,
  pressStamp,
  refillPad,
} from "./stamp-pad";
import type { StampSheet } from "./stamp-pad";
import StampView from "./stamp-view";

const percent = (value: number) => `${Math.round(value * 100)}%`;

const StampTypePreview = () => {
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const [text, setText] = useState("Received");
  const [inkAmount, setInkAmount] = useState(0.85);
  const [wear, setWear] = useState(0.25);
  const [sheet, setSheet] = useState<StampSheet>(emptySheet);
  const atlas = useMemo(() => createStampAtlas(), []);
  const field = useRef<HTMLButtonElement>(null);
  const slotId = useId();

  useEffect(() => {
    void loadStampFont();
    return () => atlas.dispose();
  }, [atlas]);

  useViewSlot(
    slotId,
    field,
    <StampView
      animate={activity === "running"}
      atlas={atlas}
      impressions={sheet.impressions}
    />
  );

  const stampAt = (x: number, y: number) => {
    atlas.draw(nextSlot(sheet), text);
    setSheet(
      pressStamp(sheet, {
        inkAmount,
        pressedAt: performance.now(),
        random: Math.random,
        wear,
        x,
        y,
      })
    );
    requestSceneFrame();
  };

  const stampAtPointer = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) {
      stampAt(0.5, 0.5);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    stampAt(
      (event.clientX - bounds.left) / bounds.width,
      1 - (event.clientY - bounds.top) / bounds.height
    );
  };

  return (
    <ExperimentStage
      activity={activity}
      className="[&>p]:z-40 [&>span]:z-40"
      controls={
        <>
          <TextControl
            hint="New text applies to the next press."
            label="Stamp text"
            maxLength={maxStampLength}
            onChange={setText}
            value={text}
          />
          <SliderControl
            format={percent}
            label="Ink"
            max={1}
            min={0.2}
            onChange={setInkAmount}
            step={0.05}
            value={inkAmount}
          />
          <SliderControl
            format={percent}
            hint="Worn rubber chips and loses its edges. Each press adds a little."
            label="Wear"
            max={1}
            min={0}
            onChange={setWear}
            step={0.05}
            value={wear}
          />
          <ActionControl
            actionLabel="Re-ink"
            disabled={sheet.padLoad === 1}
            label={`Pad ${percent(sheet.padLoad)}`}
            onAction={() => setSheet(refillPad)}
          />
          <ActionControl
            actionLabel="Clear"
            disabled={sheet.impressions.length === 0}
            label={`Press ${String(sheet.presses).padStart(2, "0")}`}
            onAction={() => {
              setSheet(emptySheet);
              requestSceneFrame();
            }}
          />
        </>
      }
      reducedNote="Reduced motion is on. Each press prints at once, with no bloom."
      stageLabel="Paper sheet stamped with rubber-stamp text at the pointer"
      stageRef={ref}
    >
      <button
        aria-label="Stamp the sheet"
        className={cn(
          focusRingClassName,
          "pointer-events-auto relative z-40 block size-full cursor-crosshair touch-pan-y focus-visible:ring-inset"
        )}
        onClick={stampAtPointer}
        ref={field}
        type="button"
      />
    </ExperimentStage>
  );
};

export default StampTypePreview;
