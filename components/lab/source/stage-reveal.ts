"use client";

import { useSyncExternalStore } from "react";

import { requestSceneFrame } from "@/components/scene/view-registry";

export const revealChunk = `
  uniform float uOriginal;

  void revealBefore() {
    if (uOriginal > 0.5) {
      discard;
    }
  }
`;

let showsOriginal = false;
const listeners = new Set<() => void>();

export const setShowsOriginal = (next: boolean) => {
  if (next === showsOriginal) {
    return;
  }
  showsOriginal = next;
  for (const listener of listeners) {
    listener();
  }
  requestSceneFrame();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const readShowsOriginal = () => showsOriginal;
const readServerShowsOriginal = () => false;

export const useShowsOriginal = () =>
  useSyncExternalStore(subscribe, readShowsOriginal, readServerShowsOriginal);

export const originalUniform = () => (showsOriginal ? 1 : 0);
