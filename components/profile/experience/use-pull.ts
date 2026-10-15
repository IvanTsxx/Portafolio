"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { pulledAfter } from "./poses";
import { useDeck } from "./use-deck";

export const useEscapeKey = (isListening: boolean, onEscape: () => void) => {
  const escape = useEffectEvent(onEscape);
  useEffect(() => {
    if (!isListening) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const isInDialog =
        event.target instanceof Element &&
        event.target.closest('[role="dialog"]') !== null;
      if (event.key === "Escape" && !event.defaultPrevented && !isInDialog) {
        event.preventDefault();
        escape();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isListening]);
};

export const usePull = (count: number) => {
  const deck = useDeck(count);
  const [pulled, setPulled] = useState<number | null>(null);

  const pull = (index: number) => {
    setPulled((current) => pulledAfter(current, index));
  };

  const fileBack = () => {
    if (pulled === null) {
      return;
    }
    deck.items.current[pulled]?.focus();
    setPulled(null);
  };

  useEscapeKey(pulled !== null, fileBack);

  return { ...deck, fileBack, pull, pulled };
};
