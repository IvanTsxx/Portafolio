"use client";

import type { ReactNode, RefObject } from "react";
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

import type { AgentAction, AgentRole, WaypointSide } from "@/lib/agents/roles";

import { ownVisibleShare } from "./companion-path";

export const viewPriority = { overlay: 3, scene: 2 } as const;

export interface ViewSlot {
  id: string;
  node: ReactNode;
  priority: number;
  track: RefObject<HTMLElement>;
}

export type { WaypointSide } from "@/lib/agents/roles";

export interface Waypoint {
  action?: AgentAction;
  element: HTMLElement;
  lines: readonly string[];
  role: AgentRole;
  side: WaypointSide;
}

interface SlotRecord extends ViewSlot {
  isNear: boolean;
}

const slots = new Map<string, SlotRecord>();
const waypoints = new Map<string, Waypoint>();
const agentCasts = new Set<HTMLElement>();
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

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const rebuildSnapshot = () => {
  const near: ViewSlot[] = [];
  for (const { id, isNear, node, priority, track } of slots.values()) {
    if (isNear) {
      near.push({ id, node, priority, track });
    }
  }
  nearSnapshot = near.toSorted((a, b) => a.priority - b.priority);
  notify();
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

const registerSlot = (
  id: string,
  element: HTMLElement,
  node: ReactNode,
  priority: number
) => {
  slots.set(id, {
    id,
    isNear: false,
    node,
    priority,
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
const getHasWaypoints = () => waypoints.size > 0;

export const getWaypoints = () => waypoints.values();

export const getAgentCasts = () => agentCasts;

const castLeadShare = 0.5;

export const isLeadAgentCast = (element: HTMLElement | null) => {
  if (!element) {
    return false;
  }
  const viewport = { height: window.innerHeight, width: window.innerWidth };
  let lead: HTMLElement | null = null;
  let leadShare = castLeadShare;
  for (const cast of agentCasts) {
    const share = ownVisibleShare(cast.getBoundingClientRect(), viewport);
    if (share >= leadShare) {
      lead = cast;
      leadShare = share;
    }
  }
  return lead === element;
};

export const registerWaypoint = (id: string, waypoint: Waypoint) => {
  const isFirst = waypoints.size === 0;
  waypoints.set(id, waypoint);
  if (isFirst) {
    notify();
  }
  requestSceneFrame();
  return () => {
    waypoints.delete(id);
    if (waypoints.size === 0) {
      notify();
    }
  };
};

export const useHasWaypoints = () =>
  useSyncExternalStore(subscribe, getHasWaypoints, getServerHasSlots);

export const useAgentCast = (
  track: RefObject<HTMLElement | null>,
  enabled: boolean
) => {
  useLayoutEffect(() => {
    const element = track.current;
    if (!(element && enabled)) {
      return;
    }
    agentCasts.add(element);
    return () => {
      agentCasts.delete(element);
    };
  }, [enabled, track]);
};

export const useNearViewSlots = () =>
  useSyncExternalStore(subscribe, getNearSnapshot, getServerNearSnapshot);

export const useHasViewSlots = () =>
  useSyncExternalStore(subscribe, getHasSlots, getServerHasSlots);

export const useViewSlot = (
  id: string,
  track: RefObject<HTMLElement | null>,
  node: ReactNode,
  enabled = true,
  priority: number = viewPriority.scene
) => {
  useLayoutEffect(() => {
    const element = track.current;
    if (!(element && enabled)) {
      return;
    }
    return registerSlot(id, element, null, priority);
  }, [enabled, id, priority, track]);

  useEffect(() => {
    updateSlot(id, node);
  });
};
