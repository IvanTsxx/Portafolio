"use client";

import { useSyncExternalStore } from "react";

import { useMoonReading } from "@/components/home/moon-readout";
import { formatIllumination } from "@/lib/sky/moon";

const tucumanTime = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Tucuman",
});

const subscribeToMinute = (notify: () => void) => {
  const timer = window.setInterval(notify, 15_000);
  return () => window.clearInterval(timer);
};

const readMinute = () => Math.floor(Date.now() / 60_000);
const readServerMinute = () => null;

export const TucumanTime = () => {
  const minute = useSyncExternalStore(
    subscribeToMinute,
    readMinute,
    readServerMinute
  );
  return (
    <span className="tabular-nums">
      {minute === null
        ? "--:--"
        : `${tucumanTime.format(new Date(minute * 60_000))} ART`}
    </span>
  );
};

export const MoonLine = () => {
  const reading = useMoonReading();
  return (
    <span className="tabular-nums">
      {reading
        ? `${reading.name} · ${formatIllumination(reading.illumination)} lit`
        : "Reading sky"}
    </span>
  );
};

export const MoonOnOrbit = ({
  cx,
  cy,
  radius,
}: {
  cx: number;
  cy: number;
  radius: number;
}) => {
  const reading = useMoonReading();
  if (!reading) {
    return null;
  }
  const angle = reading.phase * 2 * Math.PI - Math.PI / 2;
  const x = cx + Math.cos(angle) * radius;
  const y = cy + Math.sin(angle) * radius;
  return (
    <g>
      <line
        stroke="currentColor"
        strokeDasharray="2 4"
        x1={cx}
        x2={x}
        y1={cy}
        y2={y}
      />
      <circle cx={x} cy={y} fill="currentColor" r={7} />
      <text
        className="font-mono"
        fill="currentColor"
        fontSize={12}
        letterSpacing="0.12em"
        x={x + 14}
        y={y + 4}
      >
        {`DAY ${reading.ageDays.toFixed(1)}`}
      </text>
    </g>
  );
};
