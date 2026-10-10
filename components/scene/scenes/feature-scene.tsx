"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

import { Agent } from "@/components/agents/agent";
import type { AgentAction } from "@/lib/agents/roles";

import {
  BlobShadow,
  Block,
  Check,
  PanelLegs,
  SceneCamera,
  Slab,
  useSceneClock,
} from "./kit";
import type { SceneMaterialName } from "./scene-values";
import {
  easeInOutCubic,
  easeOutBack,
  popScale,
  progressBetween,
} from "./scene-values";

const builderAgent = { role: "builder", scale: 0.92 } as const;
const inspectorAgent = { role: "inspector", scale: 0.88 } as const;

const loopSeconds = 8;
const keyTime = 5.6;
const cardY = 1.3;
const cardSize = [1.55, 1.85, 0.08] as const;

interface CardModule {
  x: number;
  y: number;
  width: number;
  height: number;
  material: SceneMaterialName;
  at: number;
}

const modules = [
  { at: 0.5, height: 0.13, material: "ink", width: 1.2, x: 0, y: 0.7 },
  { at: 1.25, height: 0.62, material: "paperDeep", width: 1.2, x: 0, y: 0.22 },
  {
    at: 2,
    height: 0.06,
    material: "graphite",
    width: 1.05,
    x: -0.075,
    y: -0.24,
  },
  {
    at: 2.6,
    height: 0.06,
    material: "graphite",
    width: 0.75,
    x: -0.225,
    y: -0.36,
  },
  { at: 3.3, height: 0.16, material: "ink", width: 0.46, x: -0.37, y: -0.66 },
  { at: 3.8, height: 0.16, material: "rule", width: 0.46, x: 0.15, y: -0.66 },
] as const satisfies readonly CardModule[];

const collapseStart = 7.3;

const builderActionAt = (time: number): AgentAction =>
  time > 4.9 && time < 6.3 ? "celebrate" : "type";

const inspectorActionAt = (time: number): AgentAction => {
  if (time > 4.7 && time < 6.4) {
    return "celebrate";
  }
  return time > 3.9 && time < 4.7 ? "point" : "check";
};

const FeatureScene = () => {
  const builderAction = useRef<AgentAction>("type");
  const inspectorAction = useRef<AgentAction>("check");
  const pieces = useRef<(Group | null)[]>([]);
  const tick = useRef<Group>(null);
  const { timeAt } = useSceneClock(loopSeconds, keyTime);

  useFrame((state) => {
    const time = timeAt(state.clock.elapsedTime);
    builderAction.current = builderActionAt(time);
    inspectorAction.current = inspectorActionAt(time);

    for (const [index, module] of modules.entries()) {
      const piece = pieces.current[index];
      if (!piece) {
        continue;
      }
      const arrive = progressBetween(time, module.at, module.at + 0.45);
      const collapse = easeInOutCubic(
        progressBetween(
          time,
          collapseStart + (modules.length - index) * 0.06,
          collapseStart + 0.35 + (modules.length - index) * 0.06
        )
      );
      const scale = easeOutBack(arrive) * (1 - collapse);
      piece.position.y = module.y + (1 - easeOutBack(arrive)) * 0.6;
      piece.position.z = 0.06 + (1 - arrive) * 0.5;
      piece.scale.set(
        Math.max(module.width * scale, 0.0001),
        Math.max(module.height * scale, 0.0001),
        0.03
      );
    }

    if (tick.current) {
      tick.current.scale.setScalar(
        Math.max(popScale(time, 4.5, collapseStart) * 1.5, 0.0001)
      );
    }
  });

  return (
    <>
      <SceneCamera fitHeight={2.8} fitWidth={5.9} target={[0, 0.92, 0]} />
      <group position={[-1.6, 0, 0.55]} rotation-y={0.4}>
        <Agent actionRef={builderAction} {...builderAgent} />
      </group>
      <group position={[0.35, cardY, 0]} rotation-y={-0.05}>
        <Slab size={cardSize} />
        <PanelLegs panelHeight={cardSize[1]} panelY={cardY} spread={0.5} />
        {modules.map((module, index) => (
          <group
            key={module.at}
            position={[module.x, module.y, 0.06]}
            ref={(node) => {
              pieces.current[index] = node;
            }}
            scale={0.0001}
          >
            <Block material={module.material} />
          </group>
        ))}
        <Check position={[0.62, 1.15, 0.1]} ref={tick} scale={0.0001} />
      </group>
      <BlobShadow position={[0.35, 0.003, 0]} scale={[1.1, 0.35]} />
      <group position={[1.7, 0, 0.55]} rotation-y={-0.3}>
        <Agent actionRef={inspectorAction} {...inspectorAgent} />
      </group>
    </>
  );
};

export default FeatureScene;
