"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

export interface ViewSlot {
  id: string;
  node: ReactNode;
  track: RefObject<HTMLElement>;
  hasEntered: boolean;
}

interface SlotRecord extends ViewSlot {
  isNear: boolean;
}

const slots = new Map<string, SlotRecord>();
const listeners = new Set<() => void>();
let nearSnapshot: readonly ViewSlot[] = [];
let observer: IntersectionObserver | null = null;

let frameRequester: (() => void) | null = null;

export const setSceneFrameRequester = (requester: (() => void) | null) => {
  frameRequester = requester;
};

export const requestSceneFrame = () => {
  frameRequester?.();
};

const rebuildSnapshot = () => {
  const near: ViewSlot[] = [];
  for (const { hasEntered, id, isNear, node, track } of slots.values()) {
    if (isNear) {
      near.push({ hasEntered, id, node, track });
    }
  }
  nearSnapshot = near;
  for (const listener of listeners) {
    listener();
  }
};

const slotForElement = (element: Element) => {
  for (const slot of slots.values()) {
    if (slot.track.current === element) {
      return slot;
    }
  }
  return null;
};

const handleIntersections = (entries: IntersectionObserverEntry[]) => {
  let changed = false;
  for (const entry of entries) {
    const slot = slotForElement(entry.target);
    if (slot && slot.isNear !== entry.isIntersecting) {
      if (slot.isNear) {
        slot.hasEntered = true;
      }
      slot.isNear = entry.isIntersecting;
      changed = true;
    }
  }
  if (changed) {
    rebuildSnapshot();
  }
};

const getObserver = () => {
  observer ??= new IntersectionObserver(handleIntersections, {
    rootMargin: "12% 0px",
  });
  return observer;
};

const registerSlot = (id: string, element: HTMLElement, node: ReactNode) => {
  slots.set(id, {
    hasEntered: false,
    id,
    isNear: false,
    node,
    track: { current: element },
  });
  getObserver().observe(element);
  rebuildSnapshot();
  return () => {
    getObserver().unobserve(element);
    slots.delete(id);
    rebuildSnapshot();
  };
};

const updateSlot = (id: string, node: ReactNode) => {
  const slot = slots.get(id);
  if (!slot || slot.node === node) {
    return;
  }
  slot.node = node;
  if (slot.isNear) {
    rebuildSnapshot();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getNearSnapshot = () => nearSnapshot;
const getServerNearSnapshot = (): readonly ViewSlot[] => [];
const getHasSlots = () => slots.size > 0;
const getServerHasSlots = () => false;

export const useNearViewSlots = () =>
  useSyncExternalStore(subscribe, getNearSnapshot, getServerNearSnapshot);

export const useHasViewSlots = () =>
  useSyncExternalStore(subscribe, getHasSlots, getServerHasSlots);

export const useViewSlot = (
  id: string,
  track: RefObject<HTMLElement | null>,
  node: ReactNode,
  enabled = true
) => {
  useLayoutEffect(() => {
    const element = track.current;
    if (!(element && enabled)) {
      return;
    }
    return registerSlot(id, element, null);
  }, [enabled, id, track]);

  useEffect(() => {
    updateSlot(id, node);
  });
};
