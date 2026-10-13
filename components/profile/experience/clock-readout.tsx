import { FigureReadout } from "@/components/profile/figure-plate";

import type { Tenure } from "./career";
import { spanText } from "./career";

export type Shown =
  | { kind: "idle" }
  | { job: number; kind: "peek" }
  | { job: number; kind: "moving" }
  | { job: number; kind: "held" };

const startOf = (tenure: Tenure) => tenure.dates.split(" → ")[0] ?? "";

const Company = ({ tenure }: { tenure: Tenure }) =>
  tenure.website ? (
    <a
      className="ink-underline"
      href={tenure.website}
      rel="noreferrer"
      target="_blank"
    >
      {tenure.company} ↗
    </a>
  ) : (
    tenure.company
  );

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
  if (tenure && shown.kind === "held") {
    return (
      <FigureReadout
        lead={<Company tenure={tenure} />}
        trail={`${tenure.dates} · ${spanText(tenure)}`}
      />
    );
  }
  if (tenure) {
    return <FigureReadout lead={tenure.company} trail={tenure.role} />;
  }
  return (
    <FigureReadout
      lead={current?.company ?? `${tenures.length} cards`}
      trail={current ? `Since ${startOf(current)}` : ""}
    />
  );
};
