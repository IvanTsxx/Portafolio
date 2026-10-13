"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { RefObject } from "react";

const TOUR_FIRST_MS = 1400;
const TOUR_EVERY_MS = 5600;
const QUIET_MS = 3600;

interface Selection {
  committed: number;
  count: number;
  shown: number;
}

type SelectionEvent =
  | { index: number; type: "commit" }
  | { index: number | null; type: "preview" }
  | { type: "advance" };

const clampIndex = (index: number, count: number) =>
  Math.min(count - 1, Math.max(0, index));

export const selectionReducer = (
  state: Selection,
  event: SelectionEvent
): Selection => {
  switch (event.type) {
    case "advance": {
      const next = (state.committed + 1) % state.count;
      return { ...state, committed: next, shown: next };
    }
    case "commit": {
      const index = clampIndex(event.index, state.count);
      return { ...state, committed: index, shown: index };
    }
    case "preview": {
      return {
        ...state,
        shown:
          event.index === null
            ? state.committed
            : clampIndex(event.index, state.count),
      };
    }
    default: {
      return state;
    }
  }
};

export const useGaugeSelection = (count: number, initial: number) => {
  const [selection, dispatch] = useReducer(selectionReducer, {
    committed: initial,
    count,
    shown: initial,
  });
  const [isEngaged, setIsEngaged] = useState(false);
  const lastTouch = useRef(Number.NEGATIVE_INFINITY);

  const advance = useCallback(() => dispatch({ type: "advance" }), []);

  const touch = () => {
    lastTouch.current = performance.now();
  };

  return {
    advance,
    commit: (index: number) => {
      touch();
      dispatch({ index, type: "commit" });
    },
    committed: selection.committed,
    engage: (isOn: boolean) => {
      touch();
      setIsEngaged(isOn);
    },
    isEngaged,
    lastTouch,
    preview: (index: number | null) => {
      touch();
      dispatch({ index, type: "preview" });
    },
    shown: selection.shown,
  };
};

export const useIdleTour = ({
  advance,
  isActive,
  lastTouch,
  root,
}: {
  advance: () => void;
  isActive: boolean;
  lastTouch: RefObject<number>;
  root: RefObject<HTMLElement | null>;
}) => {
  const hasShownRest = useRef(false);
  useEffect(() => {
    if (!isActive) {
      return;
    }
    let timer = 0;
    const later = (delay: number) => {
      timer = window.setTimeout(() => {
        const quiet = performance.now() - lastTouch.current;
        if (quiet < QUIET_MS) {
          later(QUIET_MS - quiet);
          return;
        }
        if (root.current?.dataset.assembled === undefined) {
          later(TOUR_FIRST_MS);
          return;
        }
        if (hasShownRest.current) {
          advance();
        }
        hasShownRest.current = true;
        later(TOUR_EVERY_MS);
      }, delay);
    };
    later(TOUR_FIRST_MS);
    return () => window.clearTimeout(timer);
  }, [advance, isActive, lastTouch, root]);
};
