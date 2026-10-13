"use client";

import type { RefObject } from "react";
import { useSyncExternalStore } from "react";

const held = new Set<Element>();
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const holdBuild = (element: Element) => {
  if (!held.has(element)) {
    held.add(element);
    notify();
  }
};

export const releaseBuild = (element: Element) => {
  if (held.delete(element)) {
    notify();
  }
};

const isHeld = (element: Element | null) => {
  if (!element) {
    return false;
  }
  for (const site of held) {
    if (site.contains(element)) {
      return true;
    }
  }
  return false;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getServerHeld = () => false;

export const useBuildHeld = (track: RefObject<HTMLElement | null>) =>
  useSyncExternalStore(subscribe, () => isHeld(track.current), getServerHeld);
