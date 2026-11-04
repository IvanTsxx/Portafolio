"use client";

import { useSyncExternalStore } from "react";

import { readMoon } from "@/lib/sky/moon";

const subscribeToMinute = (notify: () => void) => {
  const timer = window.setInterval(notify, 60_000);
  return () => window.clearInterval(timer);
};

const readMinute = () => Math.floor(Date.now() / 60_000);
const readServerMinute = () => null;

export const useMoonReading = () => {
  const minute = useSyncExternalStore(
    subscribeToMinute,
    readMinute,
    readServerMinute
  );
  return minute === null ? null : readMoon(new Date(minute * 60_000));
};
