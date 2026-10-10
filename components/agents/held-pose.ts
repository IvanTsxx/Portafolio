"use client";

import { useFrame } from "@react-three/fiber";
import { createContext, use, useRef } from "react";
import type { RefObject } from "react";
import type { Group, Object3D } from "three";
import { MathUtils } from "three";

import type { AgentAction } from "@/lib/agents/roles";

import type { AgentMotion } from "./use-agent-rig";

type Triple = readonly [number, number, number];

export interface HeldPose {
  position: Triple;
  rotation: Triple;
  facing?: number;
}

export const armPivotNames = { left: "arm-left", right: "arm-right" } as const;

const findArmPivot = (node: Object3D) => {
  let current = node.parent;
  while (current) {
    if (
      current.name === armPivotNames.left ||
      current.name === armPivotNames.right
    ) {
      return current;
    }
    current = current.parent;
  }
  return null;
};

const facingYaw = (pivot: Object3D | null, facing: number) => {
  if (!pivot) {
    return facing;
  }
  return pivot.name === armPivotNames.left
    ? pivot.rotation.y - facing
    : facing - pivot.rotation.y;
};

export interface AgentLiveState {
  dressing: RefObject<boolean>;
  liveAction: RefObject<AgentAction>;
  motion: AgentMotion;
}

export const AgentLiveContext = createContext<AgentLiveState | null>(null);

export const useAgentLive = () => {
  const live = use(AgentLiveContext);
  if (!live) {
    throw new Error("useAgentLive must be used inside an Agent");
  }
  return live;
};

const settleRate = 9;

export const useHeldPose = (
  rest: HeldPose,
  poses: Partial<Record<AgentAction, HeldPose>>
) => {
  const ref = useRef<Group>(null);
  const pivot = useRef<Object3D | null>(null);
  const { liveAction, motion } = useAgentLive();

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group) {
      return;
    }
    const target = poses[liveAction.current] ?? rest;
    if (!pivot.current) {
      pivot.current = findArmPivot(group);
    }
    const yaw =
      target.facing === undefined
        ? target.rotation[1]
        : facingYaw(pivot.current, target.facing);
    const step =
      motion === "reduced"
        ? 1
        : 1 - Math.exp(-settleRate * Math.min(delta, 0.1));
    const { position, rotation } = group;
    position.set(
      MathUtils.lerp(position.x, target.position[0], step),
      MathUtils.lerp(position.y, target.position[1], step),
      MathUtils.lerp(position.z, target.position[2], step)
    );
    rotation.set(
      MathUtils.lerp(rotation.x, target.rotation[0], step),
      MathUtils.lerp(rotation.y, yaw, step),
      MathUtils.lerp(rotation.z, target.rotation[2], step)
    );
  });

  return { position: rest.position, ref, rotation: rest.rotation };
};
