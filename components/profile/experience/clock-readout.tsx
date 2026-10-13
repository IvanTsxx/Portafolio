import type { ReactNode } from "react";

import type { Tenure } from "./career";
import { glanceText, hostOf, spanText } from "./career";

export type Shown =
  | { kind: "idle" }
  | { job: number; kind: "peek" }
  | { job: number; kind: "moving" }
  | { job: number; kind: "held" };

const startOf = (tenure: Tenure) => tenure.dates.split(" → ")[0] ?? "";

const inOutOf = (tenure: Tenure) => {
  const [start, end] = tenure.dates.split(" → ");
  return `In ${start} · Out ${end}`;
};

const HeldExtra = ({ tenure }: { tenure: Tenure }) => (
  <span className="label text-graphite flex flex-wrap gap-x-3 gap-y-0.5 sm:justify-end">
    {tenure.stack.length > 0 ? <span>{tenure.stack.join(" · ")}</span> : null}
    {tenure.website ? (
      <a
        className="text-ink decoration-rule-strong hover:decoration-ink underline underline-offset-2 transition-colors duration-100"
        href={tenure.website}
        rel="noreferrer"
        target="_blank"
      >
        {hostOf(tenure.website)} ↗
      </a>
    ) : null}
  </span>
);

const lineOf = (
  shown: Shown,
  tenure: Tenure | undefined,
  current: Tenure | undefined
) => {
  if (tenure && shown.kind === "peek") {
    return glanceText(tenure);
  }
  if (tenure && shown.kind === "moving") {
    return `${tenure.role} · ${tenure.dates}`;
  }
  if (tenure && shown.kind === "held") {
    return `${inOutOf(tenure)} · ${spanText(tenure)} · ${tenure.type}`;
  }
  return current
    ? `Punched in at ${current.company} since ${startOf(current)}`
    : null;
};

export const ClockReadout = ({
  current,
  shown,
  tenures,
}: {
  current: Tenure | undefined;
  shown: Shown;
  tenures: readonly Tenure[];
}) => {
  const tenure = shown.kind === "idle" ? undefined : tenures[shown.job];
  const line: ReactNode = lineOf(shown, tenure, current);
  return (
    <span
      className="flex min-h-28 w-full sm:min-h-16 max-w-md flex-col items-start gap-0.5 sm:ml-auto sm:items-end sm:text-right"
      data-readout
    >
      <span className="text-ink text-sm leading-tight font-medium tracking-tight">
        {tenure?.company ?? `${tenures.length} time cards`}
      </span>
      <span className="label text-graphite text-pretty tabular-nums">
        {line}
      </span>
      {tenure && shown.kind === "held" ? <HeldExtra tenure={tenure} /> : null}
    </span>
  );
};
