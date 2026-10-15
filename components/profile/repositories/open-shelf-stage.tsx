"use client";

import { useRef } from "react";

import { PanelStack } from "./panel-stack";
import type { RackItem } from "./panel-stack";
import { useRackFocus } from "./use-rack-focus";

export const OpenShelfStage = ({
  books,
  pages,
}: {
  books: readonly RackItem[];
  pages: readonly RackItem[];
}) => {
  const root = useRef<HTMLDivElement>(null);
  const active = useRackFocus(root, null);

  return (
    <div className="flex flex-col gap-6" ref={root}>
      <div className="flex flex-col">
        <ul
          aria-label="Pinned repositories as books. Arrow keys move between them."
          className="flex items-end gap-1 px-2 pt-4 sm:gap-2 sm:px-4"
        >
          {books.map(({ id, node }, index) => (
            <li
              className="group/book ease-out-quart relative flex items-end transition-[translate] duration-300 data-active:z-10 motion-reduce:transition-none lg:data-after:translate-x-74"
              data-active={index === active || undefined}
              data-after={(active !== null && index > active) || undefined}
              data-build-block
              key={id}
            >
              {node}
            </li>
          ))}
          <li
            aria-hidden
            className="border-ink bg-paper-deep ml-auto h-24 w-3 border border-b-0 max-sm:hidden"
          />
        </ul>
        <span aria-hidden className="bg-ink h-1" />
        <span aria-hidden className="hatch border-rule h-3 border-x border-b" />
      </div>
      <PanelStack active={active ?? 0} className="lg:hidden" panels={pages} />
    </div>
  );
};
