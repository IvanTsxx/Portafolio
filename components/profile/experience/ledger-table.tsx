"use client";

import { Dialog } from "@base-ui/react/dialog";
import { cva } from "class-variance-authority";
import { useRef } from "react";

import type { DossierFile } from "@/components/profile/dossier-file";
import { FileModal, FileTrigger } from "@/components/profile/file-modal";
import type { FileModalHandle } from "@/components/profile/file-modal";
import {
  FileTip,
  FileTipProvider,
  TipLine,
} from "@/components/profile/file-tip";

import type { Ledger, LedgerEntry } from "./ledger";

const tenureFiles = Dialog.createHandle<DossierFile>();

const percent = (fraction: number) => `${fraction * 100}%`;

const capVariants = cva("bg-ink absolute top-1/2 -translate-y-1/2", {
  variants: {
    end: {
      closed: "right-0 h-3 w-px",
      open: "-right-0.75 size-1.5",
    },
  },
});

const Gridlines = ({ at }: { at: readonly number[] }) =>
  at.map((fraction) => (
    <span
      aria-hidden
      className="border-rule absolute inset-y-0 w-0 border-l border-dotted"
      key={fraction}
      style={{ left: percent(fraction) }}
    />
  ));

const LedgerRuler = ({ ledger }: { ledger: Ledger }) => (
  <div
    aria-hidden
    className="label text-mist grid grid-cols-1 gap-x-6 px-3 pb-2 tabular-nums sm:grid-cols-5"
    data-build-block
  >
    <span className="hidden sm:col-span-2 sm:block">Employer · role</span>
    <span className="relative h-4 sm:col-span-3">
      {ledger.ruler.map((mark) => (
        <span
          className="absolute top-0 flex h-full items-end"
          key={mark.label}
          style={mark.at === 1 ? { right: 0 } : { left: percent(mark.at) }}
        >
          {mark.at === 1 ? (
            <span className="text-ink">{mark.label}</span>
          ) : (
            <span className="border-rule-strong border-l pl-1">
              {mark.label}
            </span>
          )}
        </span>
      ))}
    </span>
  </div>
);

const TenureTip = ({ entry }: { entry: LedgerEntry }) => {
  const { detail } = entry;
  if (!detail) {
    return null;
  }
  return (
    <>
      {detail.summary ? (
        <TipLine label="Summary">
          <p className="text-graphite text-sm text-pretty">{detail.summary}</p>
        </TipLine>
      ) : null}
      {detail.stack.length > 0 ? (
        <TipLine label="Stack">
          <span className="label text-ink">{detail.stack.join(" · ")}</span>
        </TipLine>
      ) : null}
      <span className="label text-mist">Click opens the file</span>
    </>
  );
};

const LedgerRow = ({
  entry,
  gridlines,
  modal,
}: {
  entry: LedgerEntry;
  gridlines: readonly number[];
  modal: FileModalHandle;
}) => {
  const bar = useRef<HTMLSpanElement>(null);
  const trigger = (
    <FileTrigger
      aria-label={`${entry.spoken}. Open file.`}
      className="group/ink hover:bg-paper-deep/60 data-popup-open:bg-paper-deep/60 focus-visible:outline-ink ease-out-quart grid w-full cursor-pointer grid-cols-1 gap-x-6 gap-y-2 px-3 py-3 text-left transition-colors duration-150 focus-visible:-outline-offset-2 sm:grid-cols-5 sm:items-center"
      handle={modal}
      payload={entry.file}
    >
      <span className="flex min-w-0 items-baseline gap-3 sm:col-span-2">
        <span className="label text-mist shrink-0 tabular-nums">
          {entry.ordinal}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-ink truncate text-sm">
            <span className="ink-underline">{entry.company}</span>
          </span>
          <span className="label text-graphite truncate">{entry.role}</span>
        </span>
      </span>
      <span className="flex min-w-0 flex-col gap-1.5 sm:col-span-3">
        <span className="relative block h-3">
          <Gridlines at={gridlines} />
          <span
            className="absolute inset-y-0 min-w-1"
            ref={bar}
            style={{
              left: percent(entry.bar.start),
              width: percent(entry.bar.span),
            }}
          >
            <span className="bg-ink absolute inset-x-0 top-1/2 h-px" />
            <span className="bg-ink ease-out-quart absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 scale-y-0 transition-transform duration-150 group-hover/ink:scale-y-100 group-focus-visible/ink:scale-y-100" />
            <span className="bg-ink absolute top-1/2 left-0 h-3 w-px -translate-y-1/2" />
            <span
              className={capVariants({
                end: entry.bar.isOpen ? "open" : "closed",
              })}
            />
          </span>
        </span>
        <span className="label flex justify-between gap-3 tabular-nums">
          <span className="text-graphite truncate">{entry.dates}</span>
          <span className="text-ink shrink-0">{entry.length}</span>
        </span>
      </span>
    </FileTrigger>
  );
  return (
    <li className="border-rule border-b" data-build-block>
      {entry.detail ? (
        <FileTip anchor={bar} content={<TenureTip entry={entry} />}>
          {trigger}
        </FileTip>
      ) : (
        trigger
      )}
    </li>
  );
};

export const LedgerTable = ({ ledger }: { ledger: Ledger }) => (
  <FileTipProvider>
    <div className="flex flex-col">
      <LedgerRuler ledger={ledger} />
      <ol className="border-rule-strong border-t">
        {ledger.entries.map((entry) => (
          <LedgerRow
            entry={entry}
            gridlines={ledger.gridlines}
            key={entry.id}
            modal={tenureFiles}
          />
        ))}
      </ol>
    </div>
    <FileModal handle={tenureFiles} />
  </FileTipProvider>
);
