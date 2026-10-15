"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import {
  cardPose,
  stepKeys,
  useScrollIndex,
} from "@/components/profile/experience/card-stack-motion";
import { focusRingClassName } from "@/components/site/styles";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export interface StackedCard {
  card: ReactNode;
  id: string;
  tab: ReactNode;
}

const domIdOf = (id: string) => id.replaceAll(/[^\w-]/gu, "-");

export const RepoCardStack = ({
  cards,
  footer,
}: {
  cards: readonly StackedCard[];
  footer: ReactNode;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [isEngaged, setIsEngaged] = useState(false);
  const isReduced = useReducedMotion();

  useScrollIndex(root, cards.length, !isEngaged && !isReduced, setActive);

  const select = (index: number) => {
    setIsEngaged(true);
    setActive(index);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const by = stepKeys.get(event.key);
    if (by === undefined) {
      return;
    }
    event.preventDefault();
    const next = (active + by + cards.length) % cards.length;
    select(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col" data-build-block ref={root}>
      <div
        aria-label="Pinned repositories"
        className="flex gap-1 pr-6"
        role="tablist"
      >
        {cards.map(({ id, tab }, index) => (
          <button
            aria-controls={`repo-card-${domIdOf(id)}`}
            aria-selected={index === active}
            className={cn(
              "label border-rule-strong ease-out-quart flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 border border-b-0 px-3 tabular-nums transition-colors duration-150",
              "text-graphite bg-paper-deep pointer-fine:hover:text-ink aria-selected:bg-ink aria-selected:text-paper",
              focusRingClassName
            )}
            id={`repo-tab-${domIdOf(id)}`}
            key={id}
            onClick={() => select(index)}
            onFocus={() => select(index)}
            onKeyDown={onTabKey}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                select(index);
              }
            }}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            role="tab"
            tabIndex={index === active ? 0 : -1}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="grid pr-6 pb-6">
        {cards.map(({ card, id }, index) => {
          const depth = index - active;
          return (
            <div
              aria-hidden={depth !== 0}
              aria-labelledby={`repo-tab-${domIdOf(id)}`}
              className="ease-out-quart col-start-1 row-start-1 transition-[transform,opacity] duration-300 motion-reduce:transition-opacity"
              id={`repo-card-${domIdOf(id)}`}
              inert={depth !== 0}
              key={id}
              role="tabpanel"
              style={cardPose(depth)}
            >
              {card}
            </div>
          );
        })}
      </div>
      {footer}
    </div>
  );
};
