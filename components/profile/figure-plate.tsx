import type { ReactNode } from "react";

import { CornerMarks } from "@/components/site/corner-marks";

export const FigureReadout = ({
  lead,
  trail,
}: {
  lead: ReactNode;
  trail: ReactNode;
}) => (
  <div
    className="label border-rule flex h-11 items-center gap-3 border-t px-4 tabular-nums"
    data-readout
  >
    <span className="text-ink max-w-1/2 shrink-0 truncate">{lead}</span>
    <span
      aria-hidden
      className="border-rule-strong h-px min-w-4 flex-1 border-b border-dotted"
    />
    <span className="text-graphite min-w-0 truncate text-right">{trail}</span>
  </div>
);

export const FigurePlate = ({
  children,
  readout,
}: {
  children: ReactNode;
  readout: ReactNode;
}) => (
  <div className="border-rule-strong bg-paper has-[:is(button,input):focus-visible]:outline-ink relative flex flex-col border outline-offset-4 has-[:is(button,input):focus-visible]:outline-1">
    <CornerMarks />
    <div className="touch-pan-y overflow-hidden px-1 pt-3 select-none sm:px-4">
      {children}
    </div>
    {readout}
  </div>
);
