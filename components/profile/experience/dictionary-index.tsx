import { cn } from "@/lib/utils";

import { DitherLogo } from "./dither-logo";
import { OpenFile } from "./file-desk";
import type { LedgerEntry } from "./ledger";

const inverted =
  "pointer-fine:group-hover/row:text-paper group-focus-visible/row:text-paper";

export const DictionaryIndex = ({
  entries,
}: {
  entries: readonly LedgerEntry[];
}) => (
  <div className="flex flex-col gap-3" data-build-block>
    <ol className="border-rule-strong border-t">
      {entries.map((entry) => (
        <li className="border-rule border-b" key={entry.id}>
          <OpenFile
            className={cn(
              "group/row ease-out-quart flex w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 px-2 py-4 text-left transition-colors duration-150 sm:flex-nowrap sm:gap-x-6 sm:py-5",
              "pointer-fine:hover:bg-ink focus-visible:bg-ink outline-none"
            )}
            file={entry.file}
          >
            <span
              className={cn(
                "label text-mist w-10 shrink-0 tabular-nums transition-colors duration-150",
                inverted
              )}
            >
              {entry.year}
            </span>
            <span
              className={cn(
                "display text-ink min-w-0 flex-1 text-3xl transition-colors duration-150 sm:flex-none sm:text-5xl",
                inverted
              )}
            >
              {entry.company}
            </span>
            <span className="order-last flex w-full min-w-0 items-baseline gap-3 pl-14 sm:order-none sm:w-auto sm:flex-1 sm:pl-0">
              <span
                className={cn(
                  "text-graphite shrink-0 text-sm transition-colors duration-150",
                  inverted
                )}
              >
                {entry.role}
              </span>
              <span
                aria-hidden
                className="border-rule-strong pointer-fine:group-hover/row:border-paper/50 group-focus-visible/row:border-paper/50 min-w-6 flex-1 border-b border-dotted transition-colors duration-150"
              />
              <span
                className={cn(
                  "text-ink shrink-0 font-mono text-xs tabular-nums transition-colors duration-150 sm:text-sm",
                  inverted
                )}
              >
                {entry.dates}
              </span>
            </span>
            <DitherLogo
              className="ease-out-quart shrink-0 transition-[opacity,transform] duration-200 group-focus-visible/row:scale-100 group-focus-visible/row:opacity-100 sm:order-last pointer-fine:scale-96 pointer-fine:opacity-0 pointer-fine:group-hover/row:scale-100 pointer-fine:group-hover/row:opacity-100"
              src={entry.logo}
            />
          </OpenFile>
        </li>
      ))}
    </ol>
    <p className="label text-mist flex justify-between gap-4">
      <span>Index · {entries.length} entries</span>
      <span>Hover a row · open its file</span>
    </p>
  </div>
);
