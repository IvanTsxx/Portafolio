"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  setShowsOriginal,
  useShowsOriginal,
} from "@/components/lab/source/stage-reveal";
import type { StageImage } from "@/components/lab/source/tone-chunk";
import { chipClassName } from "@/components/site/styles";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

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

export const OriginalImage = ({ image }: { image: StageImage }) => {
  const root = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState("50% 50%");
  const showsOriginal = useShowsOriginal();

  useEffect(() => () => setShowsOriginal(false), []);

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

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0",
        !showsOriginal && "invisible"
      )}
      ref={root}
    >
      <Image
        alt=""
        className="object-cover"
        draggable={false}
        fill
        sizes="(min-width: 64rem) 60rem, 100vw"
        src={image.path}
        style={{ objectPosition: position }}
      />
    </div>
  );
};

const views = [
  { label: "Effect", value: "effect" },
  { label: "Original", value: "original" },
] as const;

export const OriginalToggle = () => {
  const showsOriginal = useShowsOriginal();
  return (
    <ToggleGroup
      aria-label="Preview image"
      onValueChange={(next) => {
        if (next[0]) {
          setShowsOriginal(next[0] === "original");
        }
      }}
      spacing={1}
      value={[showsOriginal ? "original" : "effect"]}
      variant="outline"
    >
      {views.map((view) => (
        <ToggleGroupItem
          className={cn(chipClassName, "justify-center")}
          key={view.value}
          value={view.value}
        >
          {view.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
