"use client";

import { useEffect, useEffectEvent, useSyncExternalStore } from "react";

type Listener = () => void;

const activateListeners = new Set<Listener>();
const lineListeners = new Set<Listener>();
let spokenLine: string | null = null;

export const subscribeCompanionActivate = (listener: Listener) => {
  activateListeners.add(listener);
  return () => {
    activateListeners.delete(listener);
  };
};

export const notifyCompanionActivate = () => {
  for (const listener of activateListeners) {
    listener();
  }
};

export const useCompanionActivate = (onActivate: () => void) => {
  const handleActivate = useEffectEvent(onActivate);
  useEffect(() => subscribeCompanionActivate(() => handleActivate()), []);
};

export const sayCompanionLine = (line: string | null) => {
  if (line === spokenLine) {
    return;
  }
  spokenLine = line;
  for (const listener of lineListeners) {
    listener();
  }
};

const subscribeLine = (listener: Listener) => {
  lineListeners.add(listener);
  return () => {
    lineListeners.delete(listener);
  };
};

const getLine = () => spokenLine;
const getServerLine = () => null;

export const useCompanionLine = () =>
  useSyncExternalStore(subscribeLine, getLine, getServerLine);
