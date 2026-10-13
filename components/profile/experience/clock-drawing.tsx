import { useId, useRef } from "react";
import type { MouseEvent, RefObject } from "react";

import type { Projection } from "@/components/iso/iso-kit";

import type { ClockParts } from "./clock-art";
import { CLOCK_HEIGHT, CLOCK_WIDTH, LEVER_REST } from "./clock-layout";
import type { Pocket } from "./clock-layout";
import { handsOf, leverOf, REST_SECONDS } from "./clock-parts";
import { LiveSolid } from "./live-solid";
import type { ClockNodes } from "./use-clock-motion";

const HAND_WEIGHTS = [1.8, 1.2, 0.6] as const;
const HAND_TONES = ["mid", "hi", "hi"] as const;

const jobAt = (event: MouseEvent<SVGSVGElement>) => {
  const target = event.target instanceof Element ? event.target : null;
  const job = target?.closest<SVGGElement>("[data-job]")?.dataset.job;
  return job === undefined ? null : Number(job);
};

const isConsole = (event: MouseEvent<SVGSVGElement>) =>
  event.target instanceof Element &&
  event.target.closest("[data-console]") !== null;

export const ClockDrawing = ({
  bind,
  consoleRef,
  ids,
  mask,
  onCard,
  onConsole,
  onPeek,
  parts,
  peek,
  pockets,
  projection,
}: {
  bind: (
    group: keyof ClockNodes,
    index: number
  ) => (node: SVGElement | null) => void;
  consoleRef: RefObject<SVGGElement | null>;
  ids: readonly string[];
  mask: string;
  onCard: (job: number) => void;
  onConsole: () => void;
  onPeek: (job: number | null) => void;
  parts: ClockParts;
  peek: number | null;
  pockets: readonly Pocket[];
  projection: Projection;
}) => {
  const clipId = useId();
  const pressed = useRef<number | null>(null);
  const lever = leverOf(LEVER_REST, projection);
  const hands = handsOf(REST_SECONDS, projection);
  const handPaths = [hands.hour, hands.minute, hands.second];

  const rackCard = (job: number) => (
    <g data-part="cards" key={ids[job] ?? job}>
      <g
        className="cursor-pointer"
        data-cursor={peek === job ? "" : undefined}
        data-job={job}
        ref={bind("rackCards", job)}
      >
        {parts.cards[job]}
      </g>
    </g>
  );

  const rack = (which: 0 | 1) => {
    const pieces = parts.racks[which];
    return (
      <g data-part={which ? "rack-in" : "rack-out"} key={which}>
        {pieces.under}
        {pieces.cheekLeft}
        {pockets.map((pocket, index) => (
          <g key={ids[index] ?? index}>
            {pocket.rack === which ? rackCard(index) : null}
            {pieces.dividers[index] ?? null}
          </g>
        ))}
        {pieces.cheekRight}
        {pieces.front}
        {pockets.map((pocket, index) => (
          <g
            className={pocket.rack === which ? "cursor-pointer" : undefined}
            data-job={pocket.rack === which ? index : undefined}
            key={ids[index] ?? index}
          >
            {pieces.holders[index]}
          </g>
        ))}
      </g>
    );
  };

  return (
    <svg
      aria-hidden
      className="iso-svg"
      focusable="false"
      onClick={(event) => {
        const job = jobAt(event) ?? pressed.current;
        pressed.current = null;
        if (job !== null) {
          onCard(job);
          return;
        }
        if (isConsole(event)) {
          onConsole();
        }
      }}
      onPointerDown={(event) => {
        pressed.current = jobAt(event);
      }}
      onPointerLeave={() => onPeek(null)}
      onPointerOver={(event) => {
        if (event.pointerType !== "mouse") {
          return;
        }
        const job = jobAt(event);
        if (job !== peek) {
          onPeek(job);
        }
      }}
      viewBox={`0 0 ${CLOCK_WIDTH} ${CLOCK_HEIGHT}`}
    >
      <defs>
        <clipPath id={clipId}>
          <path clipRule="evenodd" d={mask} />
        </clipPath>
      </defs>
      {parts.base}
      <g data-part="board">{parts.board}</g>
      {rack(0)}
      {rack(1)}
      <g data-part="clock">
        {parts.clock}
        {handPaths.map((d, index) => (
          <path
            className="iso-line"
            d={d}
            data-free=""
            data-tone={HAND_TONES[index]}
            key={HAND_TONES[index] + String(HAND_WEIGHTS[index])}
            ref={bind("hands", index)}
            style={{ strokeWidth: HAND_WEIGHTS[index] }}
          />
        ))}
        {parts.dialHub}
      </g>
      <g clipPath={`url(#${clipId})`}>
        {ids.map((id, index) => (
          <g
            className="cursor-pointer"
            data-job={index}
            data-on=""
            key={id}
            ref={bind("flightCards", index)}
            style={{ display: "none" }}
          >
            {parts.cards[index]}
          </g>
        ))}
      </g>
      <g data-part="lever">
        <g className="cursor-pointer" data-console ref={consoleRef}>
          <g ref={bind("lever", 0)}>
            <LiveSolid paths={lever.arm} />
          </g>
          <g ref={bind("lever", 1)}>
            <LiveSolid paths={lever.cap} />
          </g>
          <g ref={bind("lever", 2)}>
            <LiveSolid paths={lever.knob} tone="hi" />
          </g>
          <path className="iso-line" d={lever.knobFace} data-tone="lo" />
        </g>
      </g>
    </svg>
  );
};
