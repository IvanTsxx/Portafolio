"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { RackItem } from "./panel-stack";
import { usePull } from "./use-pull";

export const PullReveals = ({
  className,
  label,
  open,
  over,
  panels,
  shown,
  under,
}: {
  className?: string;
  label: string;
  open: number | null;
  over?: ReactNode;
  panels: readonly RackItem[];
  shown: number | null;
  under?: ReactNode;
}) => (
  <section
    aria-label={label}
    className={cn("group/stage grid", className)}
    data-build-block
    data-empty={open === null || undefined}
    data-reveal
  >
    {under ? (
      <div aria-hidden className="col-start-1 row-start-1 grid">
        {under}
      </div>
    ) : null}
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
    {over ? (
      <div
        aria-hidden
        className="pointer-events-none col-start-1 row-start-1 grid"
      >
        {over}
      </div>
    ) : null}
  </section>
);

export interface PullRackClassNames {
  item: string;
  list: string;
  reveal: string;
  root: string;
}

export const PullRack = ({
  classNames,
  items,
  label,
  panels,
  revealLabel,
  revealOn,
  under,
}: {
  classNames: PullRackClassNames;
  items: readonly RackItem[];
  label: string;
  panels: readonly RackItem[];
  revealLabel: string;
  revealOn: "open" | "active";
  under?: ReactNode;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const { active, open } = usePull(root, revealOn === "active" ? 0 : null);
  const shown = revealOn === "open" ? open : (open ?? active ?? 0);

  return (
    <div className={classNames.root} ref={root}>
      <ul aria-label={label} className={classNames.list} data-build-block>
        {items.map(({ id, node }, index) => (
          <li
            className={cn("group/item", classNames.item)}
            data-active={index === active || undefined}
            data-open={index === open || undefined}
            key={id}
          >
            {node}
          </li>
        ))}
      </ul>
      <PullReveals
        className={classNames.reveal}
        label={revealLabel}
        open={open}
        panels={panels}
        shown={shown}
        under={under}
      />
    </div>
  );
};
