import type { CSSProperties } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

import { OpenFile } from "./file-desk";
import type { LedgerEntry } from "./ledger";
import { TypeOnView } from "./type-on-view";
import { KEY_MS, typeSchedule } from "./typing";
import type { TypedLine } from "./typing";

type AtStyle = CSSProperties & { "--at": string };

const atStyle = (at: number): AtStyle => ({ "--at": `${at}ms` });

const TypedText = ({
  className,
  isLast = false,
  line,
}: {
  className?: string;
  isLast?: boolean;
  line: TypedLine;
}) => {
  const keys = [...line.text];
  return (
    <span className={className}>
      <span className="sr-only">{line.text}</span>
      <span aria-hidden>
        {keys.map((key, index) => (
          <span
            className="exp-key"
            data-last={isLast && index === keys.length - 1 ? "" : undefined}
            key={`${line.at + index * KEY_MS}`}
            style={atStyle(line.at + index * KEY_MS)}
          >
            {key}
          </span>
        ))}
      </span>
    </span>
  );
};

export const TypedResume = ({
  entries,
}: {
  entries: readonly LedgerEntry[];
}) => {
  const typed = typeSchedule(entries);
  return (
    <TypeOnView className="exp-type flex flex-col" stepMs={KEY_MS}>
      <p className="label text-mist border-rule-strong flex justify-between gap-4 border-b pb-3">
        <span>Résumé · typed</span>
        <span>{entries.length} roles</span>
      </p>
      <ol className="flex flex-col">
        {typed.map(({ entry, lines, stamps }, entryIndex) => (
          <li className="border-rule border-b" key={entry.id}>
            <OpenFile
              className={cn(
                "ease-out-quart flex w-full cursor-pointer flex-wrap gap-4 py-6 text-left transition-colors duration-150 sm:flex-nowrap sm:gap-6 sm:px-2",
                "pointer-fine:hover:bg-paper-deep/60",
                focusRingClassName
              )}
              file={entry.file}
            >
              <span className="label text-mist w-6 shrink-0 pt-2 tabular-nums">
                {entry.ordinal}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-2 font-mono">
                <TypedText
                  className="text-ink text-2xl leading-tight sm:text-3xl"
                  line={lines[0]}
                />
                <TypedText className="text-graphite text-sm" line={lines[1]} />
                <TypedText
                  className="text-mist text-sm tabular-nums"
                  isLast={entryIndex === typed.length - 1}
                  line={lines[2]}
                />
              </span>
              <span className="flex w-full flex-wrap items-start gap-3 pl-10 sm:w-auto sm:flex-col sm:items-end sm:pt-1 sm:pl-0">
                {stamps.map((stamp) => (
                  <span
                    className="exp-stamp label border-ink text-ink outline-ink/50 inline-block border-2 px-2 py-1 font-semibold outline outline-offset-2"
                    key={stamp.label}
                    style={atStyle(stamp.at)}
                  >
                    {stamp.label}
                  </span>
                ))}
              </span>
            </OpenFile>
          </li>
        ))}
      </ol>
    </TypeOnView>
  );
};
