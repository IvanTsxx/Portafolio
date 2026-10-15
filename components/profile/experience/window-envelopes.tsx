"use client";

import { cva } from "class-variance-authority";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { FiledSheet, RoomPlaceholder, sheetRoomClassName } from "./filed-sheet";
import type { FiledFacts } from "./ledger";
import { letterOrigin, pullPose } from "./poses";
import type { PullPose } from "./poses";
import { usePull } from "./use-pull";

const peekVariants = cva(
  "bg-paper border-ink ease-out-quart absolute inset-x-3 top-0 h-8 border transition-[translate,opacity] duration-300 motion-reduce:translate-y-0 motion-reduce:transition-opacity",
  {
    variants: {
      pose: {
        pulled: "-translate-y-6 opacity-0",
        resting:
          "group-focus-visible:-translate-y-3 pointer-fine:group-hover:-translate-y-3",
      },
    },
  }
);

const windowVariants = cva(
  "border-rule-strong bg-paper-deep absolute right-1/4 bottom-3 left-3 flex flex-col justify-center gap-1 border px-3 py-2 transition-colors duration-150",
  {
    variants: {
      pose: {
        pulled: "text-mist",
        resting: "text-ink",
      },
    },
  }
);

const letterVariants = cva(
  "exp-letter ease-out-quart col-start-1 row-start-1 px-2 pt-3 transition-[translate,scale,opacity] duration-400 motion-reduce:transition-opacity motion-reduce:duration-200 sm:px-4",
  {
    variants: {
      pose: {
        pulled: "z-10 translate-y-0 scale-100 opacity-100",
        resting:
          "translate-y-full scale-50 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100",
      },
    },
  }
);

const Envelope = ({ entry, pose }: { entry: FiledFacts; pose: PullPose }) => (
  <>
    <span aria-hidden className={peekVariants({ pose })} />
    <span className="bg-paper border-ink relative block h-28 border sm:h-32">
      <span className="label border-ink text-ink absolute top-3 right-3 border px-1.5 py-0.5 tabular-nums">
        {entry.ordinal}
      </span>
      <span
        aria-hidden
        className="border-rule absolute top-4 left-3 w-1/3 border-t border-dashed"
      />
      <span className={windowVariants({ pose })}>
        <span className="label truncate">{entry.company}</span>
        <span className="label text-graphite tabular-nums">
          {pose === "pulled" ? "Letter out" : entry.years}
        </span>
      </span>
    </span>
  </>
);

export const WindowEnvelopes = ({
  entries,
}: {
  entries: readonly FiledFacts[];
}) => {
  const { fileBack, itemProps, pull, pulled } = usePull(entries.length);

  return (
    <div className="flex flex-col gap-3" data-build-block>
      <div className="flex flex-col">
        <ul
          aria-label="Employment letters in window envelopes"
          className="order-2 grid grid-cols-2 gap-x-2 gap-y-4 pt-4 sm:grid-cols-4 sm:gap-x-3"
        >
          {entries.map((entry, index) => {
            const pose = pullPose(index, pulled);
            return (
              <li key={entry.id}>
                <button
                  {...itemProps(index)}
                  aria-controls={`envelope-letter-${entry.id}`}
                  aria-expanded={pose === "pulled"}
                  className={cn(
                    "group relative block w-full cursor-pointer text-left",
                    focusRingClassName
                  )}
                  onClick={() => pull(index)}
                  type="button"
                >
                  <Envelope entry={entry} pose={pose} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className={cn(sheetRoomClassName, "order-1")}>
          <RoomPlaceholder className="mx-2 mt-3 border-b-0 sm:mx-4">
            No letter out
          </RoomPlaceholder>
          {entries.map((entry, index) => {
            const pose = pullPose(index, pulled);
            return (
              <div
                aria-hidden={pose !== "pulled"}
                className={letterVariants({ pose })}
                id={`envelope-letter-${entry.id}`}
                inert={pose !== "pulled"}
                key={entry.id}
                style={letterOrigin(index)}
              >
                <FiledSheet
                  edge="letter"
                  entry={entry}
                  onReturn={fileBack}
                  returnLabel="Fold back"
                />
              </div>
            );
          })}
        </div>
      </div>
      <p className="label text-mist flex justify-between gap-4">
        <span>
          {entries.length} envelopes · {entries.at(-1)?.year} → now
        </span>
        <span>Open an envelope · Esc folds it back</span>
      </p>
    </div>
  );
};
