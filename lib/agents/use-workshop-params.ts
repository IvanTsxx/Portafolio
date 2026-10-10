"use client";

import { useSyncExternalStore } from "react";

import type { WorkshopState } from "./workshop";
import { parseWorkshopParams, writeWorkshopParams } from "./workshop";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
};

const getSearch = () => window.location.search;
const getServerSearch = () => "";

const replaceWorkshopState = (next: WorkshopState) => {
  const params = writeWorkshopParams(
    new URLSearchParams(window.location.search),
    next
  );
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}?${params}${window.location.hash}`
  );
  for (const listener of listeners) {
    listener();
  }
};

export const useWorkshopParams = () => {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  return [
    parseWorkshopParams(new URLSearchParams(search)),
    replaceWorkshopState,
  ] as const;
};
