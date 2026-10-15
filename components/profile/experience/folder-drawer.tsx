"use client";

import { cva } from "class-variance-authority";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { OpenFile } from "./file-desk";
import type { LedgerEntry } from "./ledger";
import { drawerHeightRem, folderPose, folderSlot } from "./poses";
import { useDeck } from "./use-deck";

const folderTabVariants = cva(
  "label exp-folder-tab absolute top-px z-10 flex h-8 w-3/5 items-center justify-between gap-2 border border-b-0 px-2 tabular-nums sm:w-2/5 sm:px-3",
  {
    variants: {
      tenure: {
        current: "bg-ink border-ink text-paper",
        past: "bg-paper-deep border-ink text-ink",
      },
    },
  }
);

const folderPoseVariants = cva(
  "ease-out-quart relative block size-full cursor-pointer text-left transition-transform duration-300 motion-reduce:transition-none",
  {
    variants: {
      pose: {
        lifted: "-translate-y-4 data-popup-open:-translate-y-8",
        parted: "translate-y-14",
        resting: "translate-y-0",
      },
    },
  }
);

const Folder = ({ entry }: { entry: LedgerEntry }) => (
  <>
    <span
      className={folderTabVariants({
        tenure: entry.isCurrent ? "current" : "past",
      })}
    >
      <span className="truncate">{entry.company}</span>
      <span className="shrink-0">{entry.years}</span>
    </span>
    <span className="bg-paper-deep border-ink absolute inset-x-0 top-8 bottom-0 border" />
    <span className="bg-paper border-rule-strong absolute inset-x-3 top-18 bottom-0 flex flex-col gap-1 border px-3 pt-3 sm:inset-x-6 sm:px-4">
      <span className="label text-ink truncate">{entry.role}</span>
      <span className="label text-graphite truncate tabular-nums">
        {entry.dates} · {entry.length}
      </span>
      <span className="label text-mist">{entry.type}</span>
    </span>
    <span className="bg-paper-deep border-ink absolute inset-x-0 top-28 bottom-0 border" />
  </>
);

export const FolderDrawer = ({
  entries,
}: {
  entries: readonly LedgerEntry[];
}) => {
  const { active, itemProps, selectBeforeOpening } = useDeck(entries.length);
  const span = `${entries.at(-1)?.year ?? ""}–now`;

  return (
    <div className="flex flex-col gap-3" data-build-block>
      <div className="flex flex-col">
        <div
          className="exp-drawer relative"
          style={{ height: `${drawerHeightRem(entries.length)}rem` }}
        >
          <ul aria-label="Employment folders in a file drawer">
            {entries.map((entry, index) => (
              <li
                className="absolute inset-x-2 bottom-16 sm:inset-x-4"
                key={entry.id}
                onClickCapture={selectBeforeOpening(index)}
                style={folderSlot(index, entries.length)}
              >
                <OpenFile
                  {...itemProps(index)}
                  className={cn(
                    folderPoseVariants({ pose: folderPose(index, active) }),
                    focusRingClassName
                  )}
                  file={entry.file}
                >
                  <Folder entry={entry} />
                </OpenFile>
              </li>
            ))}
          </ul>
          <div
            aria-hidden
            className="border-ink bg-paper absolute inset-x-0 bottom-0 z-50 flex h-20 flex-col items-center justify-center gap-3 border"
          >
            <span className="label border-ink text-ink border px-3 py-1 tabular-nums">
              Experience · {span}
            </span>
            <span className="border-ink bg-paper-deep h-3 w-24 border" />
          </div>
        </div>
        <span aria-hidden className="bg-ink h-1" />
        <span aria-hidden className="hatch border-rule h-3 border-x border-b" />
      </div>
      <p className="label text-mist flex justify-between gap-4">
        <span>
          {entries.length} folders · {span}
        </span>
        <span>Pull a folder · open the file</span>
      </p>
    </div>
  );
};
