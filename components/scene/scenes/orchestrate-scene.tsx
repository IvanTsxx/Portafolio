"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

import { Agent } from "@/components/agents/agent";
import type { AgentAction } from "@/lib/agents/roles";

import {
  BlobShadow,
  Block,
  Board,
  IssueCard,
  SceneCamera,
  Slab,
  useSceneClock,
} from "./kit";
import {
  easeInOutCubic,
  easeOutCubic,
  issueCardSize,
  popScale,
  progressBetween,
} from "./scene-values";

const orchestratorAgent = { role: "orchestrator", scale: 0.92 } as const;
const architectAgent = { role: "architect", scale: 0.9 } as const;

const loopSeconds = 8;
const keyTime = 6.8;
const resetAt = 7.4;

const boardPosition = [0.2, 1.3, 0] as const;
const boardSize = [2.3, 1.9, 0.08] as const;
const cardY = 0.55;
const splitY = 0.26;
const laneBottom = -0.8;
const laneLength = splitY - laneBottom;
const chipTop = splitY - 0.14;
const chipBottom = laneBottom + 0.14;
const chipTravelSeconds = 1.4;
const blueprintAt = 3.4;

const lanes = [
  { growAt: 1.3, startAt: 2, x: -0.6 },
  { growAt: 1.45, startAt: 2.55, x: 0 },
  { growAt: 1.6, startAt: 3.1, x: 0.6 },
] as const;

const blueprintLines = [0.08, -0.02, -0.12] as const;

const orchestratorActionAt = (time: number): AgentAction => {
  if (time > 0.8 && time < 2.2) {
    return "point";
  }
  if (time > 4.8 && time < 6.2) {
    return "celebrate";
  }
  return "direct";
};

const architectActionAt = (time: number): AgentAction =>
  time > blueprintAt - 0.6 && time < blueprintAt + 0.8 ? "point" : "measure";

const shown = (value: number) => Math.max(value, 0.0001);

const OrchestrateScene = () => {
  const orchestratorAction = useRef<AgentAction>("direct");
  const architectAction = useRef<AgentAction>("measure");
  const card = useRef<Group>(null);
  const stem = useRef<Group>(null);
  const split = useRef<Group>(null);
  const laneLines = useRef<(Group | null)[]>([]);
  const chips = useRef<(Group | null)[]>([]);
  const blueprint = useRef<Group>(null);
  const { timeAt } = useSceneClock(loopSeconds, keyTime);

  useFrame((state) => {
    const time = timeAt(state.clock.elapsedTime);
    orchestratorAction.current = orchestratorActionAt(time);
    architectAction.current = architectActionAt(time);
    const vanish = easeInOutCubic(
      progressBetween(time, resetAt, resetAt + 0.3)
    );

    if (card.current) {
      card.current.scale.setScalar(shown(popScale(time, 0.2, resetAt)));
    }
    if (stem.current) {
      const grow = easeOutCubic(progressBetween(time, 0.8, 1));
      stem.current.scale.y = shown(grow * (1 - vanish));
    }
    if (split.current) {
      const grow = easeOutCubic(progressBetween(time, 0.95, 1.35));
      split.current.scale.x = shown(grow * (1 - vanish));
    }

    for (const [index, lane] of lanes.entries()) {
      const line = laneLines.current[index];
      if (line) {
        const grow = easeOutCubic(
          progressBetween(time, lane.growAt, lane.growAt + 0.5)
        );
        line.scale.y = shown(grow * (1 - vanish));
      }
      const chip = chips.current[index];
      if (chip) {
        const travel = easeInOutCubic(
          progressBetween(time, lane.startAt, lane.startAt + chipTravelSeconds)
        );
        chip.position.y = chipTop + (chipBottom - chipTop) * travel;
        chip.scale.setScalar(
          shown(popScale(time, lane.startAt - 0.3, resetAt))
        );
      }
    }

    if (blueprint.current) {
      const drop = easeOutCubic(
        progressBetween(time, blueprintAt, blueprintAt + 0.4)
      );
      blueprint.current.position.z = 0.07 + (1 - drop) * 0.4;
      blueprint.current.scale.setScalar(
        shown(popScale(time, blueprintAt, resetAt))
      );
    }
  });

  return (
    <>
      <SceneCamera fitHeight={2.8} fitWidth={6.6} target={[0, 0.92, 0]} />
      <group position={[-2.05, 0, 0.6]} rotation-y={0.55}>
        <Agent actionRef={orchestratorAction} {...orchestratorAgent} />
      </group>
      <Board
        legSpread={0.8}
        position={boardPosition}
        rotation-y={-0.06}
        size={boardSize}
      >
        <IssueCard position={[0, cardY, 0.06]} ref={card} scale={0.0001} />
        <group position={[0, cardY - issueCardSize[1] / 2, 0.05]} ref={stem}>
          <Block
            material="graphite"
            position={[0, -(cardY - issueCardSize[1] / 2 - splitY) / 2, 0]}
            scale={[0.025, cardY - issueCardSize[1] / 2 - splitY, 0.015]}
          />
        </group>
        <group position={[0, splitY, 0.05]} ref={split}>
          <Block material="graphite" scale={[1.225, 0.025, 0.015]} />
        </group>
        {lanes.map((lane, index) => (
          <group key={lane.x} position={[lane.x, 0, 0.05]}>
            <group
              position={[0, splitY, 0]}
              ref={(node) => {
                laneLines.current[index] = node;
              }}
            >
              <Block
                material="graphite"
                position={[0, -laneLength / 2, 0]}
                scale={[0.025, laneLength, 0.015]}
              />
            </group>
            <Slab
              material="paperDeep"
              position={[0, laneBottom + 0.02, 0.005]}
              size={[0.34, 0.16, 0.02]}
            />
            <group
              position={[0, chipTop, 0.03]}
              ref={(node) => {
                chips.current[index] = node;
              }}
              scale={0.0001}
            >
              <Block scale={[0.24, 0.12, 0.03]} />
              <Block
                material="paper"
                position={[-0.04, 0, 0.016]}
                scale={[0.1, 0.025, 0.005]}
              />
            </group>
          </group>
        ))}
        <group
          position={[0.84, 0.6, 0.07]}
          ref={blueprint}
          rotation-z={-0.08}
          scale={0.0001}
        >
          <Slab material="paperDeep" radius={0.01} size={[0.42, 0.32, 0.01]} />
          {blueprintLines.map((y) => (
            <Block
              key={y}
              material="rule"
              position={[0, y, 0.008]}
              scale={[0.34, 0.012, 0.004]}
            />
          ))}
          <Block position={[-0.06, -0.02, 0.01]} scale={[0.16, 0.16, 0.004]} />
          <Block
            material="paperDeep"
            position={[-0.06, -0.02, 0.012]}
            scale={[0.12, 0.12, 0.004]}
          />
          <Block
            material="vermilion"
            position={[0, 0.13, 0.02]}
            scale={[0.045, 0.045, 0.03]}
          />
        </group>
      </Board>
      <BlobShadow position={[0.2, 0.003, 0]} scale={[1.6, 0.45]} />
      <group position={[2.15, 0, 0.6]} rotation-y={-0.5}>
        <Agent actionRef={architectAction} {...architectAgent} />
      </group>
    </>
  );
};

export default OrchestrateScene;
