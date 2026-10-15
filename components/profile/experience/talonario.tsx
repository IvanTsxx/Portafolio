"use client";

import { cva } from "class-variance-authority";
import { useState } from "react";

import {
  focusRingClassName,
  technicalButtonVariants,
} from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { FiledSheet, RoomPlaceholder, TypeStamp } from "./filed-sheet";
import type { FiledFacts } from "./ledger";
import { deskSlot, putBack, tearOff } from "./poses";
import { useDeck } from "./use-deck";
import { useEscapeKey } from "./use-pull";

type TicketPose = "bound" | "torn";

const STAPLE_COUNT = 2;

const ticketBodyVariants = cva(
  "bg-paper ease-out-quart relative col-start-1 row-start-1 flex origin-bottom-left flex-col gap-2 p-3 transition-[translate,rotate,opacity] duration-300 motion-reduce:transition-opacity sm:p-4",
  {
    variants: {
      pose: {
        bound:
          "group-focus-visible:-translate-y-0.5 group-focus-visible:-rotate-1 motion-reduce:translate-y-0 motion-reduce:rotate-0 pointer-fine:group-hover:-translate-y-0.5 pointer-fine:group-hover:-rotate-1",
        torn: "pointer-events-none translate-x-12 rotate-6 opacity-0 motion-reduce:translate-x-0 motion-reduce:rotate-0",
      },
    },
  }
);

const stubVariants = cva(
  "border-ink flex w-16 shrink-0 flex-col justify-between gap-2 border-r border-dashed p-3 tabular-nums transition-colors duration-150 sm:w-20",
  {
    variants: {
      pose: {
        bound: "bg-paper text-ink",
        torn: "bg-paper-deep text-graphite",
      },
    },
  }
);

const deskTicketVariants = cva(
  "ease-out-quart col-start-1 row-start-1 transition-[translate,rotate,opacity] duration-400 motion-reduce:transition-opacity motion-reduce:duration-200",
  {
    variants: {
      pose: {
        bound:
          "pointer-events-none -translate-y-8 opacity-0 motion-reduce:translate-y-0 md:-translate-x-16 md:translate-y-0 motion-reduce:md:translate-x-0",
        torn: "opacity-100",
      },
    },
  }
);

const Ticket = ({ entry, pose }: { entry: FiledFacts; pose: TicketPose }) => (
  <>
    <span className={stubVariants({ pose })}>
      <span className="label text-mist">No.</span>
      <span className="font-mono text-2xl leading-none">{entry.ordinal}</span>
      <span className="label">{entry.year}</span>
    </span>
    <span className="hatch relative grid flex-1">
      <span
        aria-hidden
        className="label text-mist col-start-1 row-start-1 flex items-center justify-center"
      >
        On the desk
      </span>
      <span className={ticketBodyVariants({ pose })}>
        <span className="flex items-start justify-between gap-3">
          <span className="text-ink font-mono text-xl leading-none tracking-tight text-balance sm:text-2xl">
            {entry.company}
          </span>
          <TypeStamp className="shrink-0" type={entry.type} />
        </span>
        <span className="label text-graphite">{entry.role}</span>
        <span className="label text-mist tabular-nums">
          {entry.dates} · {entry.length}
        </span>
        <span
          aria-hidden
          className="bg-paper-deep border-ink ease-out-quart absolute top-0 right-0 size-5 origin-top-right scale-0 border-b border-l transition-transform duration-150 group-focus-visible:scale-100 motion-reduce:transition-none pointer-fine:group-hover:scale-100"
        />
      </span>
    </span>
  </>
);

export const Talonario = ({ entries }: { entries: readonly FiledFacts[] }) => {
  const { itemProps, items } = useDeck(entries.length);
  const [torn, setTorn] = useState<readonly number[]>([]);
  const top = torn.at(-1);
  const tornSet = new Set(torn);

  const tear = (index: number) => {
    setTorn((current) => tearOff(current, index));
  };

  const replace = (index: number) => {
    setTorn((current) => putBack(current, index));
    items.current[index]?.focus();
  };

  const rebind = () => {
    setTorn([]);
    items.current[0]?.focus();
  };

  useEscapeKey(top !== undefined, () => {
    if (top !== undefined) {
      replace(top);
    }
  });

  return (
    <div className="flex flex-col gap-3" data-build-block>
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div className="border-ink bg-paper-deep flex border">
          <span
            aria-hidden
            className="bg-ink flex w-4 shrink-0 flex-col items-center justify-around"
          >
            {Array.from({ length: STAPLE_COUNT }, (_, staple) => (
              <span className="bg-paper h-6 w-1" key={staple} />
            ))}
          </span>
          <ul
            aria-label="Employment tickets, bound newest first"
            className="flex min-w-0 flex-1 flex-col"
          >
            {entries.map((entry, index) => {
              const pose: TicketPose = tornSet.has(index) ? "torn" : "bound";
              return (
                <li
                  className="border-ink border-b last:border-b-0"
                  key={entry.id}
                >
                  <button
                    {...itemProps(index)}
                    aria-controls={`desk-ticket-${entry.id}`}
                    aria-label={`${pose === "torn" ? "Bring to top" : "Tear off"} ticket ${entry.ordinal}, ${entry.company}`}
                    className={cn(
                      "group flex w-full cursor-pointer text-left",
                      focusRingClassName
                    )}
                    onClick={() => tear(index)}
                    type="button"
                  >
                    <Ticket entry={entry} pose={pose} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid h-72 sm:h-64">
            <RoomPlaceholder>Tear a ticket</RoomPlaceholder>
            {entries.map((entry, index) => {
              const isTop = index === top;
              return (
                <div
                  aria-hidden={!isTop}
                  className={deskTicketVariants({
                    pose: tornSet.has(index) ? "torn" : "bound",
                  })}
                  id={`desk-ticket-${entry.id}`}
                  inert={!isTop}
                  key={entry.id}
                  style={deskSlot(index, torn)}
                >
                  <FiledSheet
                    edge="ticket"
                    entry={entry}
                    onReturn={() => replace(index)}
                    returnLabel="Put back"
                  />
                </div>
              );
            })}
          </div>
          <button
            className={cn(
              technicalButtonVariants({ size: "md", tone: "outline" }),
              "self-end"
            )}
            disabled={torn.length === 0}
            onClick={rebind}
            type="button"
          >
            Rebind {torn.length > 0 ? `· ${torn.length}` : ""}
          </button>
        </div>
      </div>
      <p className="label text-mist flex justify-between gap-4">
        <span>
          {entries.length} tickets · {entries.at(-1)?.year} → now
        </span>
        <span>Tear a ticket · Esc puts it back</span>
      </p>
    </div>
  );
};
