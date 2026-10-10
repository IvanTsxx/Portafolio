"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type {
  Group,
  OrthographicCamera as OrthographicCameraImpl,
} from "three";

import { Agent } from "@/components/agents/agent";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import type { AgentSpotEdge } from "@/lib/agents/scenes";

import { ViewLights } from "./view-lights";
import { useViewSlotEntry } from "./view-slot-context";

export interface AgentSpotContentProps {
  role: AgentRole;
  action: AgentAction;
  edge: AgentSpotEdge;
}

interface EdgeFraming {
  worldHeight: number;
  lean: number;
  yaw: number;
  tilt: number;
  place: (width: number, height: number) => readonly [number, number];
  hide: (width: number, height: number) => readonly [number, number];
}

const edgeFraming = {
  bottom: {
    hide: (_width, height) => [0, height / 2 + 2.4],
    lean: Math.PI,
    place: (_width, height) => [0, height / 2 + 0.62],
    tilt: -0.18,
    worldHeight: 2.3,
    yaw: 0.3,
  },
  left: {
    hide: (width, height) => [width / 2 + 1.5, -height / 2 + 0.05],
    lean: 0.12,
    place: (width, height) => [width / 2 - 0.42, -height / 2 + 0.05],
    tilt: 0.2,
    worldHeight: 2.75,
    yaw: -0.5,
  },
  right: {
    hide: (width, height) => [-width / 2 - 1.5, -height / 2 + 0.05],
    lean: -0.12,
    place: (width, height) => [-width / 2 + 0.42, -height / 2 + 0.05],
    tilt: 0.2,
    worldHeight: 2.75,
    yaw: 0.5,
  },
  top: {
    hide: (_width, height) => [0, -height / 2 - 2.3],
    lean: 0,
    place: (_width, height) => [0, -height / 2 + 0.02],
    tilt: 0.22,
    worldHeight: 2.45,
    yaw: -0.28,
  },
} as const satisfies Record<AgentSpotEdge, EdgeFraming>;

const entrySeconds = 0.75;

const easeOutBack = (value: number) => {
  const overshoot = 1.6;
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted ** 3 + overshoot * shifted ** 2;
};

const AgentSpotContent = ({ role, action, edge }: AgentSpotContentProps) => {
  const camera = useRef<OrthographicCameraImpl>(null);
  const placement = useRef<Group>(null);
  const entryStart = useRef<number | null>(null);
  const isReduced = useReducedMotion();
  const { hasEntered } = useViewSlotEntry();
  const framing = edgeFraming[edge];

  useFrame((state) => {
    const view = camera.current;
    const group = placement.current;
    if (!(view && group)) {
      return;
    }
    const pixelHeight = view.top - view.bottom;
    const pixelWidth = view.right - view.left;
    const zoom = pixelHeight / framing.worldHeight;
    if (Math.abs(view.zoom - zoom) > 0.001) {
      view.zoom = zoom;
      view.updateProjectionMatrix();
    }
    const width = pixelWidth / zoom;
    const height = framing.worldHeight;
    const [x, y] = framing.place(width, height);
    if (isReduced || hasEntered) {
      group.position.set(x, y, 0);
      return;
    }
    if (entryStart.current === null) {
      entryStart.current = state.clock.elapsedTime;
    }
    const progress = Math.min(
      1,
      (state.clock.elapsedTime - entryStart.current) / entrySeconds
    );
    const eased = easeOutBack(progress);
    const [hiddenX, hiddenY] = framing.hide(width, height);
    group.position.set(
      hiddenX + (x - hiddenX) * eased,
      hiddenY + (y - hiddenY) * eased,
      0
    );
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 12]} ref={camera} />
      <ViewLights />
      <group ref={placement}>
        <group rotation={[framing.tilt, 0, framing.lean]}>
          <Agent action={action} role={role} rotation-y={framing.yaw} />
        </group>
      </group>
    </>
  );
};

export default AgentSpotContent;
