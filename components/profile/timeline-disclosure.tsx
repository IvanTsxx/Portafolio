"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { TechnicalButton } from "./technical-button";

interface TimelineDisclosureProps {
  id: string;
  entries: readonly ReactNode[];
  initialCount: number;
}

export const TimelineDisclosure = ({
  id,
  entries,
  initialCount,
}: TimelineDisclosureProps) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, initialCount);
  const hiddenCount = entries.length - initialCount;

  return (
    <>
      <ol className="flex flex-col gap-12" id={id}>
        {visible}
      </ol>
      {hiddenCount > 0 && (
        <TechnicalButton
          aria-controls={id}
          aria-expanded={expanded}
          className="w-full"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less activity" : "Show more activity"}
          <span className="jp">{expanded ? "折りたたむ" : "さらに表示"}</span>
          {!expanded && (
            <span className="tabular-nums opacity-60">
              +{String(hiddenCount).padStart(2, "0")}
            </span>
          )}
        </TechnicalButton>
      )}
    </>
  );
};
