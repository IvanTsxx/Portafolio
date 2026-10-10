"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { MathUtils, Quaternion, Vector3 } from "three";

import { Agent } from "@/components/agents/agent";
import type { AgentAction } from "@/lib/agents/roles";

import {
  BlobShadow,
  Block,
  PanelLegs,
  SceneCamera,
  Slab,
  useSceneClock,
} from "./kit";
import type { SceneMaterialName } from "./scene-values";
import { easeInOutCubic, popScale, progressBetween } from "./scene-values";

const loopSeconds = 8;
const keyTime = 6.9;
const tripSeconds = 2.2;
const pickX = -0.85;
const dropX = 0.85;
const laneZ = 0.85;
const agentScale = 0.9;
const builderAgent = { role: "builder", scale: agentScale } as const;

interface LayoutBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  material: SceneMaterialName;
}

const carriedBlocks = [
  { height: 0.14, material: "ink", width: 1.1, x: 0, y: 0.5 },
  { height: 0.46, material: "paperDeep", width: 1.1, x: 0, y: 0.12 },
  { height: 0.14, material: "ink", width: 0.42, x: -0.34, y: -0.5 },
] as const satisfies readonly LayoutBlock[];

const textLines = [
  { width: 0.92, y: -0.2 },
  { width: 0.62, y: -0.31 },
] as const;

const layers = [0.55, 0.42, 0.29, 0.16] as const;

const panelSize = [1.7, 1.7, 0.08] as const;
const panelY = 1.3;
const carrySize = new Vector3(0.38, 0.24, 0.14);

const scratch = {
  hand: new Vector3(),
  panelQuaternion: new Quaternion(),
  slot: new Vector3(),
  slotScale: new Vector3(),
};

const tripPhase = (time: number) => {
  const trip = Math.floor(time / tripSeconds);
  return { local: time - trip * tripSeconds, trip };
};

interface AgentState {
  action: AgentAction;
  x: number;
  yaw: number;
}

const agentStateAt = (time: number): AgentState => {
  if (time >= tripSeconds * 3) {
    return {
      action: time < 7.6 ? "celebrate" : "idle",
      x: pickX,
      yaw: 0.15,
    };
  }
  const { local } = tripPhase(time);
  if (local < 0.25) {
    return { action: "carry", x: pickX, yaw: -0.8 };
  }
  if (local < 1.3) {
    const travel = easeInOutCubic(progressBetween(local, 0.25, 1.3));
    return {
      action: "carry",
      x: pickX + (dropX - pickX) * travel,
      yaw: 1.15,
    };
  }
  if (local < 1.55) {
    return { action: "carry", x: dropX, yaw: 0.85 };
  }
  const back = easeInOutCubic(progressBetween(local, 1.55, tripSeconds));
  return {
    action: "walk",
    x: dropX + (pickX - dropX) * back,
    yaw: -1.15,
  };
};

const LayoutFrame = ({ withText }: { withText: boolean }) => (
  <group>
    {[0.66, -0.66].map((y) => (
      <Block
        key={y}
        material="rule"
        position={[0, y, 0]}
        scale={[1.28, 0.012, 0.01]}
      />
    ))}
    {[0.64, -0.64].map((x) => (
      <Block
        key={x}
        material="rule"
        position={[x, 0, 0]}
        scale={[0.012, 1.32, 0.01]}
      />
    ))}
    {withText
      ? textLines.map(({ width, y }) => (
          <Block
            key={y}
            material="graphite"
            position={[-0.55 + width / 2, y, 0.01]}
            scale={[width, 0.05, 0.015]}
          />
        ))
      : null}
  </group>
);

const FigmaToCodeScene = () => {
  const action = useRef<AgentAction>("carry");
  const agent = useRef<Group>(null);
  const browserFrame = useRef<Group>(null);
  const blocks = useRef<(Group | null)[]>([]);
  const browserText = useRef<Group>(null);
  const { isReduced, timeAt } = useSceneClock(loopSeconds, keyTime);

  useFrame((state, delta) => {
    const time = timeAt(state.clock.elapsedTime);
    const agentState = agentStateAt(time);
    action.current = agentState.action;
    const body = agent.current;
    const frame = browserFrame.current;
    if (!(body && frame)) {
      return;
    }
    body.position.x = agentState.x;
    body.rotation.y = isReduced
      ? agentState.yaw
      : MathUtils.damp(
          body.rotation.y,
          agentState.yaw,
          9,
          Math.min(delta, 0.1)
        );

    scratch.hand.set(
      Math.sin(body.rotation.y) * 0.42 * agentScale,
      0.74 * agentScale,
      Math.cos(body.rotation.y) * 0.42 * agentScale
    );
    scratch.hand.add(body.position);
    frame.getWorldQuaternion(scratch.panelQuaternion);

    const reset = progressBetween(time, 7.55, 7.95);
    for (const [index, layout] of carriedBlocks.entries()) {
      const block = blocks.current[index];
      if (!block) {
        continue;
      }
      const tripStart = index * tripSeconds;
      const local = time - tripStart;
      scratch.slot.set(layout.x, layout.y, 0.03);
      frame.localToWorld(scratch.slot);
      scratch.slotScale.set(layout.width, layout.height, 0.03);

      if (local < 0) {
        block.scale.setScalar(0.0001);
        continue;
      }
      if (local < 1.3) {
        const grab = progressBetween(local, 0, 0.22);
        block.position.copy(scratch.hand);
        block.rotation.set(0, body.rotation.y, 0);
        block.scale.copy(carrySize).multiplyScalar(Math.max(grab, 0.0001));
        continue;
      }
      const fly = easeInOutCubic(progressBetween(local, 1.3, 1.55));
      block.position.lerpVectors(scratch.hand, scratch.slot, fly);
      block.rotation.set(0, body.rotation.y, 0);
      block.quaternion.slerp(scratch.panelQuaternion, fly);
      block.scale.lerpVectors(carrySize, scratch.slotScale, fly);
      block.scale.multiplyScalar(Math.max(1 - reset, 0.0001));
    }

    if (browserText.current) {
      browserText.current.scale.setScalar(
        Math.max(popScale(time, 6.6, 7.55), 0.0001)
      );
    }
  });

  return (
    <>
      <SceneCamera fitHeight={2.8} fitWidth={5.9} target={[0, 0.92, 0]} />
      <group position={[-1.75, panelY, 0]} rotation-y={0.3}>
        <Slab size={panelSize} />
        <PanelLegs panelHeight={panelSize[1]} panelY={panelY} spread={0.6} />
        <group position={[-0.72, 0, 0.045]}>
          {layers.map((y, index) => (
            <Block
              key={y}
              material={index === 0 ? "ink" : "rule"}
              position={[0, y, 0]}
              scale={[0.26, 0.06, 0.015]}
            />
          ))}
        </group>
        <group position={[0.2, -0.05, 0.045]} scale={0.95}>
          <LayoutFrame withText />
          {carriedBlocks.map((layout) => (
            <Block
              key={layout.y}
              material={layout.material}
              position={[layout.x, layout.y, 0.015]}
              scale={[layout.width, layout.height, 0.03]}
            />
          ))}
        </group>
      </group>
      <group position={[1.75, panelY, 0]} rotation-y={-0.3}>
        <Slab size={panelSize} />
        <PanelLegs panelHeight={panelSize[1]} panelY={panelY} spread={0.6} />
        <Slab
          material="paperDeep"
          position={[0, panelSize[1] / 2 - 0.1, 0.045]}
          size={[panelSize[0] - 0.08, 0.14, 0.02]}
        />
        {[-0.8, -0.7, -0.6].map((x) => (
          <Block
            key={x}
            position={[x, panelSize[1] / 2 - 0.1, 0.06]}
            scale={[0.05, 0.05, 0.02]}
          />
        ))}
        <group position={[0, -0.12, 0.045]} ref={browserFrame}>
          <LayoutFrame withText={false} />
          <group ref={browserText} scale={0.0001}>
            {textLines.map(({ width, y }) => (
              <Block
                key={y}
                material="graphite"
                position={[-0.55 + width / 2, y, 0.01]}
                scale={[width, 0.05, 0.015]}
              />
            ))}
          </group>
        </group>
      </group>
      {carriedBlocks.map((layout, index) => (
        <group
          key={layout.y}
          ref={(node) => {
            blocks.current[index] = node;
          }}
          scale={0.0001}
        >
          <Block material={layout.material} />
        </group>
      ))}
      <BlobShadow position={[-1.75, 0.003, 0]} scale={[1.2, 0.4]} />
      <BlobShadow position={[1.75, 0.003, 0]} scale={[1.2, 0.4]} />
      <group position={[pickX, 0, laneZ]} ref={agent}>
        <Agent actionRef={action} {...builderAgent} />
      </group>
    </>
  );
};

export default FigmaToCodeScene;
