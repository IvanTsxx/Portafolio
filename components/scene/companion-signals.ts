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

export interface SpokenSection {
  element: Element;
  lines: readonly string[];
}

const sections = new Map<Element, readonly string[]>();
let activeSection: SpokenSection | null = null;
let observer: IntersectionObserver | null = null;

const handleCrossings = (entries: IntersectionObserverEntry[]) => {
  for (const entry of entries) {
    const lines = sections.get(entry.target);
    if (entry.isIntersecting && lines) {
      activeSection = { element: entry.target, lines };
    }
  }
};

const getObserver = () => {
  observer ??= new IntersectionObserver(handleCrossings, {
    rootMargin: "-45% 0px -45% 0px",
  });
  return observer;
};

export const registerSpokenSection = (
  element: Element,
  lines: readonly string[]
) => {
  sections.set(element, lines);
  getObserver().observe(element);
  return () => {
    getObserver().unobserve(element);
    sections.delete(element);
    if (activeSection?.element === element) {
      activeSection = null;
    }
  };
};

export const getSpokenSection = () => activeSection;
