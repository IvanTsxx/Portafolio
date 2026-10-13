"use client";

import { useRef, useState } from "react";

import type { FigureControl } from "@/components/iso/figure-stations";
import {
  setFigureFocus,
  useFigureStation,
} from "@/components/iso/figure-stations";
import { technicalButtonVariants } from "@/components/site/styles";

const stationId = "dev-stub";
const lampCount = 5;
const pressFlashMs = 260;

const controls: readonly FigureControl[] = [
  { id: "advance", label: "Next step" },
  { id: "flip", label: "Flip shutter" },
];

const focusLines = new Map([
  ["advance", "That one walks the counter forward."],
  ["flip", "The shutter swaps ink for clay."],
]);

const lampX = (index: number) => 120 + index * 64;
const lampY = (index: number) => 150 - index * 18;

export const StubStation = () => {
  const figure = useRef<HTMLElement>(null);
  const consolePanel = useRef<SVGGElement>(null);
  const [count, setCount] = useState(0);
  const [isShut, setIsShut] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);

  const operate = (controlId: string) => {
    if (controlId === "advance") {
      setCount((value) => (value + 1) % (lampCount + 1));
    }
    if (controlId === "flip") {
      setIsShut((value) => !value);
    }
    setPressed(controlId);
    window.setTimeout(() => setPressed(null), pressFlashMs);
  };

  useFigureStation({
    consoleRef: consolePanel,
    controls,
    figureRef: figure,
    id: stationId,
    onOperate: operate,
    title: "Stub counter",
  });

  return (
    <figure
      className="border-rule-strong bg-paper-deep/40 flex flex-col gap-4 border p-4"
      data-stub-station=""
      ref={figure}
    >
      <svg aria-hidden className="w-full" viewBox="0 0 640 360">
        <polygon
          className="fill-paper stroke-ink"
          points="40,250 320,110 600,250 320,330"
        />
        <polygon
          className="fill-paper-deep stroke-ink"
          points="40,250 320,330 320,350 40,270"
        />
        <polygon
          className="fill-rule stroke-ink"
          points="320,330 600,250 600,270 320,350"
        />
        {Array.from({ length: lampCount }, (_, index) => (
          <g key={index}>
            <rect
              className="fill-paper stroke-ink"
              height={36}
              width={28}
              x={lampX(index) - 14}
              y={lampY(index) - 6}
            />
            <circle
              className={
                index < count
                  ? "fill-clay stroke-ink transition-[fill] duration-200"
                  : "fill-paper stroke-ink transition-[fill] duration-200"
              }
              cx={lampX(index)}
              cy={lampY(index) + 12}
              r={9}
            />
          </g>
        ))}
        <rect
          className={
            isShut
              ? "fill-clay stroke-ink transition-[fill] duration-200"
              : "fill-ink stroke-ink transition-[fill] duration-200"
          }
          height={56}
          width={72}
          x={150}
          y={196}
        />
        <g data-station-console="" ref={consolePanel}>
          <rect
            className="fill-paper stroke-ink"
            height={48}
            width={128}
            x={440}
            y={262}
          />
          {controls.map((control, index) => (
            <rect
              className={
                pressed === control.id
                  ? "fill-ink stroke-ink"
                  : "fill-paper-deep stroke-ink"
              }
              height={20}
              key={control.id}
              width={40}
              x={456 + index * 56}
              y={276}
            />
          ))}
        </g>
      </svg>
      <figcaption className="flex flex-wrap items-center gap-3">
        <span className="label text-mist tabular-nums">
          Count {String(count).padStart(2, "0")} · Shutter{" "}
          {isShut ? "clay" : "ink"}
        </span>
        <span className="ml-auto flex gap-2">
          {controls.map((control) => (
            <button
              className={technicalButtonVariants({ size: "sm" })}
              key={control.id}
              onBlur={() => setFigureFocus(stationId, null)}
              onClick={() => operate(control.id)}
              onFocus={() =>
                setFigureFocus(stationId, focusLines.get(control.id) ?? null)
              }
              onPointerEnter={() =>
                setFigureFocus(stationId, focusLines.get(control.id) ?? null)
              }
              onPointerLeave={() => setFigureFocus(stationId, null)}
              type="button"
            >
              {control.label}
            </button>
          ))}
        </span>
      </figcaption>
    </figure>
  );
};
