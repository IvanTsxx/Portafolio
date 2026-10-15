"use client";

import { useStageActivity } from "@/components/lab/use-stage-activity";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { OpenFile } from "./file-desk";
import { FileCard } from "./file-stack";
import type { LedgerEntry } from "./ledger";
import { fanSlot } from "./poses";
import { useDeck } from "./use-deck";

const TAB_REACH_PERCENT = 55;

export const FannedCards = ({
  entries,
}: {
  entries: readonly LedgerEntry[];
}) => {
  const { active, itemProps, selectBeforeOpening } = useDeck(entries.length);
  const { activity, ref } = useStageActivity<HTMLDivElement>();
  const reach = TAB_REACH_PERCENT / Math.max(1, entries.length - 1);

  return (
    <div className="flex flex-col gap-3" data-build-block>
      <div
        className="exp-fan grid justify-items-center overflow-x-clip pt-16 pb-2"
        data-activity={activity}
        ref={ref}
      >
        <ul aria-label="Employment files, fanned" className="grid">
          {entries.map((entry, index) => (
            <li
              className="exp-fan-card col-start-1 row-start-1"
              data-active={index === active ? "" : undefined}
              key={entry.id}
              onClickCapture={selectBeforeOpening(index)}
              style={fanSlot(index, active, entries.length)}
            >
              <OpenFile
                {...itemProps(index)}
                className={cn(
                  "bg-paper border-ink relative block h-80 w-64 cursor-pointer border text-left transition-transform duration-150 active:scale-99 sm:h-96 sm:w-96",
                  focusRingClassName
                )}
                file={entry.file}
              >
                <span
                  aria-hidden
                  className="label border-ink bg-paper-deep text-graphite absolute bottom-full -mb-px flex h-8 items-center gap-2 border border-b-0 px-3 tabular-nums"
                  style={{ left: `${index * reach}%` }}
                >
                  <span className="text-ink">{entry.ordinal}</span>
                  <span>{entry.year}</span>
                </span>
                <FileCard entry={entry} />
              </OpenFile>
            </li>
          ))}
        </ul>
      </div>
      <p className="label text-mist flex justify-between gap-4">
        <span>
          {entries.length} files · {entries.at(-1)?.year} → now
        </span>
        <span>Fan the cards · open a file</span>
      </p>
    </div>
  );
};
