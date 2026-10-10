"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

import { Agent } from "@/components/agents/agent";
import type { AgentAction } from "@/lib/agents/roles";

import {
  BarChart,
  BlobShadow,
  Block,
  Check,
  Clipboard,
  PanelLegs,
  SceneCamera,
  Slab,
  useSceneClock,
} from "./kit";
import {
  easeInOutCubic,
  easeOutBack,
  popScale,
  progressBetween,
} from "./scene-values";

const inspectorAgent = { role: "inspector", scale: 0.9 } as const;
const analystAgent = { role: "analyst", scale: 0.88 } as const;

const loopSeconds = 8;
const keyTime = 6.8;
const resetAt = 7.4;

const clipboardY = 1.3;
const clipboardSize = [1.6, 1.95] as const;
const boxX = -0.5;
const chartY = 1.45;
const chartSize = [0.8, 0.62, 0.06] as const;
const chartBars = [0.14, 0.22, 0.18, 0.32] as const;
const chartGrowAt = 3.6;
const mergedAt = 4.8;
const mergedY = -0.74;

const checkRows = [
  { at: 1, width: 0.82, y: 0.5 },
  { at: 1.8, width: 0.62, y: 0.18 },
  { at: 2.6, width: 0.74, y: -0.14 },
  { at: 3.4, width: 0.52, y: -0.46 },
] as const;

const inspectorActionAt = (time: number): AgentAction => {
  if (time < 0.8) {
    return "inspect";
  }
  if (time > 5.4 && time < 6.5) {
    return "celebrate";
  }
  return "check";
};

const analystActionAt = (time: number): AgentAction => {
  if (time > chartGrowAt - 0.2 && time < mergedAt + 0.3) {
    return "point";
  }
  if (time > 5.4 && time < 6.5) {
    return "celebrate";
  }
  return time < chartGrowAt ? "read" : "idle";
};

const shown = (value: number) => Math.max(value, 0.0001);

const ReviewScene = () => {
  const inspectorAction = useRef<AgentAction>("inspect");
  const analystAction = useRef<AgentAction>("read");
  const ticks = useRef<(Group | null)[]>([]);
  const bars = useRef<Group>(null);
  const merged = useRef<Group>(null);
  const { timeAt } = useSceneClock(loopSeconds, keyTime);

  useFrame((state) => {
    const time = timeAt(state.clock.elapsedTime);
    inspectorAction.current = inspectorActionAt(time);
    analystAction.current = analystActionAt(time);

    for (const [index, row] of checkRows.entries()) {
      const tick = ticks.current[index];
      if (tick) {
        tick.scale.setScalar(shown(popScale(time, row.at, resetAt) * 0.55));
      }
    }

    if (bars.current) {
      const grow = easeOutBack(
        progressBetween(time, chartGrowAt, chartGrowAt + 0.6)
      );
      const vanish = easeInOutCubic(
        progressBetween(time, resetAt, resetAt + 0.3)
      );
      bars.current.scale.y = shown(grow * (1 - vanish));
    }

    if (merged.current) {
      const rise = easeOutBack(progressBetween(time, mergedAt, mergedAt + 0.4));
      merged.current.position.y = mergedY - (1 - rise) * 0.2;
      merged.current.scale.setScalar(shown(popScale(time, mergedAt, resetAt)));
    }
  });

  return (
    <>
      <SceneCamera fitHeight={2.8} fitWidth={6.6} target={[0, 0.92, 0]} />
      <group position={[-1.95, 0, 0.6]} rotation-y={0.55}>
        <Agent actionRef={inspectorAction} {...inspectorAgent} />
      </group>
      <group position={[-0.05, clipboardY, 0]} rotation-y={0.04}>
        <Clipboard size={clipboardSize}>
          {checkRows.map((row, index) => (
            <group key={row.y} position={[0, row.y, 0.045]}>
              <Slab
                material="rule"
                position={[boxX, 0, 0]}
                radius={0.01}
                size={[0.17, 0.17, 0.01]}
              />
              <Slab
                position={[boxX, 0, 0.004]}
                radius={0.008}
                size={[0.13, 0.13, 0.01]}
              />
              <Block
                material="graphite"
                position={[-0.3 + row.width / 2, 0, 0.004]}
                scale={[row.width, 0.05, 0.01]}
              />
              <Check
                position={[boxX + 0.02, 0.03, 0.03]}
                ref={(node) => {
                  ticks.current[index] = node;
                }}
                scale={0.0001}
              />
            </group>
          ))}
          <group position={[0.32, mergedY, 0.1]} ref={merged} scale={0.0001}>
            <Slab
              material="vermilion"
              radius={0.03}
              size={[0.62, 0.26, 0.04]}
            />
            <Check
              material="paper"
              position={[-0.19, 0.01, 0.03]}
              scale={0.4}
            />
            <Block
              material="paper"
              position={[0.08, 0.03, 0.025]}
              scale={[0.28, 0.04, 0.01]}
            />
            <Block
              material="paper"
              position={[0.03, -0.05, 0.025]}
              scale={[0.18, 0.04, 0.01]}
            />
          </group>
        </Clipboard>
        <PanelLegs
          panelHeight={clipboardSize[1]}
          panelY={clipboardY}
          spread={0.5}
        />
      </group>
      <BlobShadow position={[-0.05, 0.003, 0]} scale={[1.1, 0.4]} />
      <group position={[1.35, chartY, 0.15]} rotation-y={-0.25}>
        <Slab size={chartSize} />
        <PanelLegs panelHeight={chartSize[1]} panelY={chartY} spread={0.26} />
        <BarChart
          bars={chartBars}
          growRef={bars}
          position={[0.02, -0.2, 0.04]}
          width={0.56}
        />
      </group>
      <BlobShadow position={[1.35, 0.003, 0.15]} scale={[0.5, 0.25]} />
      <group position={[2.2, 0, 0.6]} rotation-y={-0.55}>
        <Agent actionRef={analystAction} {...analystAgent} />
      </group>
    </>
  );
};

export default ReviewScene;
