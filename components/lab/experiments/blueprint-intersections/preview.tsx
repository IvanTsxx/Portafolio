import { CornerMarkers } from "@/components/lab/experiment-stage";
import { cn } from "@/lib/utils";

import {
  compactColumnCount,
  coordinate,
  sheetColumns,
  sheetRows,
} from "./sheet";

const rulerEntrance = (columnIndex: number) => ({
  animationFillMode: "both",
  animationRange: `entry ${columnIndex * 5}% cover ${30 + columnIndex * 3}%`,
  animationTimeline: "view()",
});

export const BlueprintIntersections = () => (
  <div className="flex flex-col gap-px">
    <div className="border-rule bg-background group/sheet relative border px-4 pt-12 pb-16 sm:px-10">
      <CornerMarkers />
      <p className="label text-faint absolute top-4 left-6">
        Sheet 03 · <span className="max-sm:hidden">hover to trace, </span>click
        or use arrow keys to pin
      </p>
      <ol aria-hidden className="grid grid-cols-8 pb-2 sm:grid-cols-12">
        {sheetColumns.map((column, columnIndex) => (
          <li
            className={cn(
              "label text-faint animate-in fade-in slide-in-from-bottom-3 ease-linear motion-reduce:animate-none",
              columnIndex >= compactColumnCount && "max-sm:hidden"
            )}
            key={column}
            style={rulerEntrance(columnIndex)}
          >
            {column}
          </li>
        ))}
      </ol>
      <fieldset className="blueprint-dots m-0 flex min-w-0 flex-col border-0 p-0 [--grid-size:12px]">
        <legend className="sr-only">Pin an intersection on the sheet</legend>
        {sheetRows.map((row) => (
          <div className="grid grid-cols-8 sm:grid-cols-12" key={row}>
            {sheetColumns.map((column, columnIndex) => (
              <label
                className={cn(
                  "group/cell border-rule text-faint flex aspect-square cursor-crosshair items-end justify-start border-r border-b p-1.5 transition-colors duration-150 ease-out",
                  "hover:bg-foreground/5 hover:text-foreground hover:[anchor-name:--lab-cell]",
                  "has-checked:bg-clay/10 has-checked:text-clay has-checked:[anchor-name:--lab-pin]",
                  "has-focus-visible:outline-clay has-focus-visible:outline-2 has-focus-visible:-outline-offset-2",
                  columnIndex === 0 && "border-l",
                  row === sheetRows[0] && "border-t",
                  columnIndex >= compactColumnCount && "max-sm:hidden"
                )}
                key={column}
              >
                <input
                  className="sr-only"
                  name="lab-intersection"
                  type="radio"
                  value={coordinate(column, row)}
                />
                <span className="label opacity-0 transition-opacity duration-150 group-hover/cell:opacity-100 group-has-checked/cell:opacity-100 group-has-focus-visible/cell:opacity-100">
                  {coordinate(column, row)}
                </span>
                <span className="label text-faint absolute bottom-4 left-6 hidden group-has-checked/cell:inline">
                  Pinned{" "}
                  <span className="text-clay">{coordinate(column, row)}</span>
                </span>
                <span className="label text-muted-foreground absolute right-6 bottom-4 hidden pointer-fine:group-hover/cell:inline">
                  Tracing {coordinate(column, row)}
                </span>
              </label>
            ))}
          </div>
        ))}
      </fieldset>
      <span
        aria-hidden
        className="bg-foreground/40 pointer-events-none absolute inset-y-0 left-[anchor(center)] hidden w-px [position-anchor:--lab-cell] supports-[anchor-name:--a]:group-has-[label:hover]/sheet:block"
      />
      <span
        aria-hidden
        className="bg-foreground/40 pointer-events-none absolute inset-x-0 top-[anchor(center)] hidden h-px [position-anchor:--lab-cell] supports-[anchor-name:--a]:group-has-[label:hover]/sheet:block"
      />
      <span
        aria-hidden
        className="bg-clay pointer-events-none absolute inset-y-0 left-[anchor(center)] hidden w-px [position-anchor:--lab-pin] supports-[anchor-name:--a]:group-has-checked/sheet:block"
      />
      <span
        aria-hidden
        className="bg-clay pointer-events-none absolute inset-x-0 top-[anchor(center)] hidden h-px [position-anchor:--lab-pin] supports-[anchor-name:--a]:group-has-checked/sheet:block"
      />
      <span
        aria-hidden
        className="border-clay pointer-events-none absolute top-[anchor(top)] right-[anchor(right)] bottom-[anchor(bottom)] left-[anchor(left)] hidden border [position-anchor:--lab-pin] supports-[anchor-name:--a]:group-has-checked/sheet:block"
      />
    </div>
  </div>
);
