"use client";

import { createContext, use } from "react";

import type { ViewSlot } from "./view-registry";

export const ViewSlotContext = createContext<ViewSlot | null>(null);

export const useViewSlotEntry = () => {
  const slot = use(ViewSlotContext);
  return { hasEntered: slot?.hasEntered ?? true };
};
