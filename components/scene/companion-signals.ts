"use client";

import { useEffect, useEffectEvent, useSyncExternalStore } from "react";

type Listener = () => void;

const activateListeners = new Set<Listener>();
const lineListeners = new Set<Listener>();
export interface CompanionLine {
  isQuiet: boolean;
  text: string;
}

let spokenLine: CompanionLine | null = null;

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

export const sayCompanionLine = (text: string | null, isQuiet = false) => {
  if (
    (spokenLine?.text ?? null) === text &&
    (spokenLine?.isQuiet ?? isQuiet) === isQuiet
  ) {
    return;
  }
  spokenLine = text === null ? null : { isQuiet, text };
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
