"use client";

import { useSyncExternalStore } from "react";

import type { Outfit } from "@/components/agents/outfit";
import { outfitsMatch } from "@/components/agents/outfit";

const listeners = new Set<() => void>();
let worn: Outfit | null = null;

export const dressCompanion = (outfit: Outfit | null) => {
  if (worn === outfit || (worn && outfit && outfitsMatch(worn, outfit))) {
    return;
  }
  worn = outfit;
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getWorn = () => worn;
const getServerWorn = () => null;

export const useCompanionWardrobe = () =>
  useSyncExternalStore(subscribe, getWorn, getServerWorn);
