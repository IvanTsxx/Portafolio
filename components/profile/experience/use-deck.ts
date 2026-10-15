"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

const deckSteps = new Map([
  ["ArrowDown", 1],
  ["ArrowLeft", -1],
  ["ArrowRight", 1],
  ["ArrowUp", -1],
]);

export const deckStep = (active: number, key: string, count: number) => {
  const by = deckSteps.get(key);
  return by === undefined ? null : (active + by + count) % count;
};

export const useDeck = (count: number, initialActive: number) => {
  const items = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(initialActive);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = deckStep(active, event.key, count);
    if (next === null) {
      return;
    }
    event.preventDefault();
    setActive(next);
    items.current[next]?.focus();
  };

  const itemProps = (index: number) => ({
    onFocus: () => setActive(index),
    onKeyDown,
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse") {
        setActive(index);
      }
    },
    ref: (node: HTMLElement | null) => {
      items.current[index] = node;
    },
    tabIndex: index === active ? 0 : -1,
  });

  return { active, itemProps, items };
};
