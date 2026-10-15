"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { rackPoseData, rackPoseOf } from "./rack-pose";
import { usePull } from "./use-pull";

export interface RackItem {
  id: string;
  node: ReactNode;
}

export interface PullRackClassNames {
  item: string;
  list: string;
  reveal: string;
  root: string;
}

export const PullRack = ({
  classNames,
  initialOpen,
  items,
  label,
  panels,
  revealLabel,
}: {
  classNames: PullRackClassNames;
  initialOpen: number | null;
  items: readonly RackItem[];
  label: string;
  panels: readonly RackItem[];
  revealLabel: string;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const { active, open } = usePull(root, initialOpen);
  const shown = open ?? active;

  return (
    <div className={classNames.root} ref={root}>
      <ul aria-label={label} className={classNames.list} data-build-block>
        {items.map(({ id, node }, index) => (
          <li
            className={cn("group/item", classNames.item)}
            {...rackPoseData(rackPoseOf(index, active, open))}
            key={id}
          >
            {node}
          </li>
        ))}
      </ul>
      <section
        aria-label={revealLabel}
        className={cn("group/stage grid", classNames.reveal)}
        data-build-block
        data-empty={open === null || undefined}
        data-reveal
      >
        {panels.map(({ id, node }, index) => {
          const isShown = index === shown;
          return (
            <div
              aria-hidden={!isShown}
              className={cn(
                "group/reveal ease-out-quart col-start-1 row-start-1 grid transition-opacity duration-200",
                isShown ? "opacity-100" : "pointer-events-none opacity-0"
              )}
              data-open={index === open || undefined}
              inert={!isShown}
              key={id}
            >
              {node}
            </div>
          );
        })}
      </section>
    </div>
  );
};
