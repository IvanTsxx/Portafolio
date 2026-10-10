"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { Group } from "three";

import { useAgentLive } from "./held-pose";

const dropSeconds = 0.46;
const dropHeight = 0.5;
const dropStartScale = 0.35;
const popSeconds = 0.34;
const popLift = 0.14;
const popStretch = 0.07;
const pending = Number.NaN;

const easeOutBack = (value: number) => {
  const overshoot = 1.9;
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
};

const elapsedSince = (start: { current: number | null }, now: number) => {
  if (start.current === null) {
    return null;
  }
  if (Number.isNaN(start.current)) {
    start.current = now;
  }
  return now - start.current;
};

export const PieceDrop = ({ children }: { children: ReactNode }) => {
  const group = useRef<Group>(null);
  const dropStart = useRef<number | null>(null);
  const { dressing } = useAgentLive();
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const node = group.current;
    if (!(node && dressing.current)) {
      return;
    }
    dropStart.current = pending;
    node.position.y = dropHeight;
    node.scale.setScalar(dropStartScale);
    invalidate();
  }, [dressing, invalidate]);

  useFrame((state) => {
    const node = group.current;
    const elapsed = elapsedSince(dropStart, state.clock.elapsedTime);
    if (!node || elapsed === null) {
      return;
    }
    const progress = Math.min(1, elapsed / dropSeconds);
    const settle = easeOutBack(progress);
    node.position.y = dropHeight * (1 - settle);
    node.scale.setScalar(dropStartScale + (1 - dropStartScale) * settle);
    if (progress >= 1) {
      dropStart.current = null;
      node.position.y = 0;
      node.scale.setScalar(1);
    }
    state.invalidate();
  });

  return <group ref={group}>{children}</group>;
};

export const useOutfitPop = (signature: string, enabled: boolean) => {
  const group = useRef<Group>(null);
  const popStart = useRef<number | null>(null);
  const shownSignature = useRef(signature);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (shownSignature.current === signature) {
      return;
    }
    shownSignature.current = signature;
    if (enabled) {
      popStart.current = pending;
      invalidate();
    }
  }, [enabled, invalidate, signature]);

  useFrame((state) => {
    const node = group.current;
    const elapsed = elapsedSince(popStart, state.clock.elapsedTime);
    if (!node || elapsed === null) {
      return;
    }
    const progress = Math.min(1, elapsed / popSeconds);
    const arc = Math.sin(progress * Math.PI);
    node.position.y = arc * popLift;
    const squash = 1 - arc * popStretch * 0.5;
    node.scale.set(squash, 1 + arc * popStretch, squash);
    if (progress >= 1) {
      popStart.current = null;
      node.position.y = 0;
      node.scale.setScalar(1);
    }
    state.invalidate();
  });

  return group;
};
