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

export interface CompanionBeat {
  waypoint: HTMLElement;
  x: number;
  y: number;
}

type BeatListener = (beat: CompanionBeat) => void;

const beatListeners = new Set<BeatListener>();
let companionStop: HTMLElement | null = null;

export const subscribeCompanionBeat = (listener: BeatListener) => {
  beatListeners.add(listener);
  return () => {
    beatListeners.delete(listener);
  };
};

export const notifyCompanionBeat = (beat: CompanionBeat) => {
  for (const listener of beatListeners) {
    listener(beat);
  }
};

export const setCompanionStop = (stop: HTMLElement | null) => {
  companionStop = stop;
};

export const getCompanionStop = () => companionStop;
