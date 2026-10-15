"use client";

import { cva } from "class-variance-authority";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { FiledSheet, RoomPlaceholder, sheetRoomClassName } from "./filed-sheet";
import type { FiledFacts } from "./ledger";
import { drawerHeightRem, folderSlot, pullPose } from "./poses";
import type { PullPose } from "./poses";
import { usePull } from "./use-pull";

const folderVariants = cva(
  "group ease-out-quart relative block size-full cursor-pointer text-left transition-[translate] duration-300 motion-reduce:transition-none",
  {
    variants: {
      pose: {
        pulled: "-translate-y-5",
        resting:
          "focus-visible:-translate-y-2 pointer-fine:hover:-translate-y-2",
      },
    },
  }
);

const tabVariants = cva(
  "label exp-folder-tab ease-out-quart absolute top-px z-10 flex h-8 w-3/5 items-center justify-between gap-2 border border-b-0 px-2 tabular-nums transition-colors duration-150 sm:w-2/5 sm:px-3",
  {
    variants: {
      pose: {
        pulled: "bg-ink border-ink text-paper",
        resting:
          "bg-paper-deep border-rule-strong text-graphite pointer-fine:group-hover:border-ink pointer-fine:group-hover:text-ink group-focus-visible:border-ink group-focus-visible:text-ink",
      },
    },
  }
);

const insertVariants = cva(
  "bg-paper border-rule-strong ease-out-quart absolute inset-x-3 top-18 bottom-0 flex flex-col gap-1 border px-3 pt-3 transition-[translate,opacity] duration-300 motion-reduce:translate-y-0 motion-reduce:transition-opacity sm:inset-x-6 sm:px-4",
  {
    variants: {
      pose: {
        pulled: "-translate-y-8 opacity-0",
        resting: "translate-y-0 opacity-100",
      },
    },
  }
);

const roomSheetVariants = cva(
  "ease-out-quart col-start-1 row-start-1 px-2 pt-3 transition-[translate,opacity] duration-400 motion-reduce:transition-opacity motion-reduce:duration-200 sm:px-4",
  {
    variants: {
      pose: {
        pulled: "z-10 translate-y-0 opacity-100",
        resting:
          "translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0",
      },
    },
  }
);

const Folder = ({ entry, pose }: { entry: FiledFacts; pose: PullPose }) => (
  <>
    <span className={tabVariants({ pose })}>
      <span className="truncate">{entry.company}</span>
      <span className="shrink-0">{entry.years}</span>
    </span>
    <span className="bg-paper-deep border-ink absolute inset-x-0 top-8 bottom-0 border" />
    <span className={insertVariants({ pose })}>
      <span className="label text-ink truncate">{entry.role}</span>
      <span className="label text-mist">{entry.type}</span>
    </span>
    <span className="bg-paper-deep border-ink absolute inset-x-0 top-28 bottom-0 border" />
  </>
);

export const DrawerPull = ({ entries }: { entries: readonly FiledFacts[] }) => {
  const { fileBack, itemProps, pull, pulled } = usePull(entries.length);
  const span = `${entries.at(-1)?.year ?? ""}–now`;

  return (
    <div className="flex flex-col gap-3" data-build-block>
      <div className="flex flex-col">
        <div
          className="exp-drawer relative order-2"
          style={{ height: `${drawerHeightRem(entries.length)}rem` }}
        >
          <ul aria-label="Employment folders in a file drawer">
            {entries.map((entry, index) => {
              const pose = pullPose(index, pulled);
              return (
                <li
                  className="absolute inset-x-2 bottom-16 sm:inset-x-4"
                  key={entry.id}
                  style={folderSlot(index, entries.length)}
                >
                  <button
                    {...itemProps(index)}
                    aria-controls={`drawer-sheet-${entry.id}`}
                    aria-expanded={pose === "pulled"}
                    className={cn(folderVariants({ pose }), focusRingClassName)}
                    onClick={() => pull(index)}
                    type="button"
                  >
                    <Folder entry={entry} pose={pose} />
                  </button>
                </li>
              );
            })}
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
        <div className={cn(sheetRoomClassName, "order-1")}>
          <RoomPlaceholder className="mx-2 mt-3 border-b-0 sm:mx-4">
            No folder out
          </RoomPlaceholder>
          {entries.map((entry, index) => {
            const pose = pullPose(index, pulled);
            return (
              <div
                aria-hidden={pose !== "pulled"}
                className={roomSheetVariants({ pose })}
                id={`drawer-sheet-${entry.id}`}
                inert={pose !== "pulled"}
                key={entry.id}
              >
                <FiledSheet
                  edge="sheet"
                  entry={entry}
                  onReturn={fileBack}
                  returnLabel="File back"
                />
              </div>
            );
          })}
        </div>
        <span aria-hidden className="bg-ink order-3 h-1" />
        <span
          aria-hidden
          className="hatch border-rule order-4 h-3 border-x border-b"
        />
      </div>
      <p className="label text-mist flex justify-between gap-4">
        <span>
          {entries.length} folders · {span}
        </span>
        <span>Pull a folder · Esc files it back</span>
      </p>
    </div>
  );
};
