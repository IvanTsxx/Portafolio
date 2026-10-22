"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { PointerEvent } from "react";

import type { StageReveal } from "@/components/lab/source/stage-reveal";
import type { StageImage } from "@/components/lab/source/tone-chunk";
import { requestSceneFrame } from "@/components/scene/view-registry";

const restingSplit = 50;

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), high);

const shareOf = (focus: number, visible: number) => {
  if (visible >= 1) {
    return 50;
  }
  const start = clamp(focus - visible / 2, 0, 1 - visible);
  return (start / (1 - visible)) * 100;
};

const coverPosition = (
  image: StageImage,
  stageWidth: number,
  stageHeight: number
) => {
  const stageAspect = stageWidth / Math.max(stageHeight, 1);
  const imageAspect = image.width / image.height;
  const visibleX = stageAspect > imageAspect ? 1 : stageAspect / imageAspect;
  const visibleY = stageAspect > imageAspect ? imageAspect / stageAspect : 1;
  return `${shareOf(image.focus.x, visibleX)}% ${shareOf(image.focus.y, visibleY)}%`;
};

const handleMargin = 2;

export const BeforeAfter = ({
  image,
  onReveal,
}: {
  image: StageImage;
  onReveal: (reveal: StageReveal) => void;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLSpanElement>(null);
  const inputId = useId();
  const [split, setSplit] = useState(restingSplit);
  const [position, setPosition] = useState("50% 50%");

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setPosition(
          coverPosition(
            image,
            entry.contentRect.width,
            entry.contentRect.height
          )
        );
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [image]);

  const report = useCallback(
    (pill: HTMLElement | null, nextSplit: number) => {
      onReveal({
        handleHeight: (pill?.offsetHeight ?? 0) + handleMargin * 2,
        handleWidth: (pill?.offsetWidth ?? 0) + handleMargin * 2,
        split: nextSplit / 100,
      });
      requestSceneFrame();
    },
    [onReveal]
  );

  const attachHandle = useCallback(
    (pill: HTMLSpanElement | null) => {
      handle.current = pill;
      if (!pill) {
        return;
      }
      report(pill, restingSplit);
      return () => {
        onReveal({ handleHeight: 0, handleWidth: 0, split: 0 });
        requestSceneFrame();
      };
    },
    [onReveal, report]
  );

  const moveSplit = (nextSplit: number) => {
    setSplit(nextSplit);
    report(handle.current, nextSplit);
  };

  const splitAt = (clientX: number) => {
    const bounds = root.current?.getBoundingClientRect();
    if (bounds) {
      moveSplit(clamp(((clientX - bounds.left) / bounds.width) * 100, 0, 100));
    }
  };

  const grab = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    splitAt(event.clientX);
  };

  const drag = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      splitAt(event.clientX);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0" ref={root}>
      <Image
        alt=""
        className="object-cover"
        draggable={false}
        fill
        sizes="(min-width: 64rem) 60rem, 100vw"
        src={image.path}
        style={{
          clipPath: `inset(0 ${100 - split}% 0 0)`,
          objectPosition: position,
        }}
      />
      <label className="sr-only" htmlFor={inputId}>
        Before and after
      </label>
      <input
        className="peer sr-only"
        id={inputId}
        max={100}
        min={0}
        onChange={(event) => moveSplit(Number(event.target.value))}
        step={1}
        type="range"
        value={Math.round(split)}
      />
      <span
        aria-hidden
        className="bg-ink absolute inset-y-0 w-px -translate-x-full"
        style={{ left: `${split}%` }}
      />
      <span
        aria-hidden
        className="label bg-paper border-ink text-ink peer-focus-visible:outline-ink pointer-events-auto absolute top-1/2 flex -translate-1/2 cursor-ew-resize touch-none items-center border select-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
        onPointerDown={grab}
        onPointerMove={drag}
        ref={attachHandle}
        style={{ left: `${split}%` }}
      >
        <span className="px-2 py-1">Before</span>
        <span className="bg-ink text-paper px-2 py-1">⇆</span>
        <span className="px-2 py-1">After</span>
      </span>
    </div>
  );
};
