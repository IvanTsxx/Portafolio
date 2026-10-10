"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, MeshStandardMaterial } from "three";
import { Color } from "three";

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
import {
  boxGeometry,
  easeInOutCubic,
  popScale,
  progressBetween,
  sceneColors,
} from "./scene-values";

const debuggerAgent = { role: "debugger", scale: 0.92 } as const;

const loopSeconds = 8;
const keyTime = 5.4;

const codeLines = [
  { indent: 0, width: 1.4 },
  { indent: 0.18, width: 1.05 },
  { indent: 0.18, width: 1.6 },
  { indent: 0.36, width: 0.85 },
  { indent: 0.36, width: 1.25 },
  { indent: 0.18, width: 1.15 },
  { indent: 0, width: 0.7 },
] as const;

const bugLine = 4;
const lineGap = 0.22;
const panelSize = [2.5, 1.95, 0.08] as const;
const panelCenter = [0.75, 1.25, 0] as const;
const lineTop = 0.6;
const lineLeft = -0.95;
const bugY = lineTop - bugLine * lineGap;
const bugStartX = lineLeft + codeLines[bugLine].indent + 0.05;
const bugTravel = codeLines[bugLine].width - 0.12;

const bugColor = new Color(sceneColors.vermilion);
const fixedColor = new Color(sceneColors.ink);

const actionAt = (time: number): AgentAction => {
  if (time < 1.2 || time > 7.2) {
    return "walk";
  }
  if (time < 3.4) {
    return "inspect";
  }
  if (time < 4.6) {
    return "point";
  }
  if (time < 6.4) {
    return "celebrate";
  }
  return "idle";
};

const agentXAt = (time: number) => {
  const arrive = easeInOutCubic(progressBetween(time, 0, 1.2));
  const leave = easeInOutCubic(progressBetween(time, 7.2, 8));
  return -2.1 + arrive * 0.75 - leave * 0.75;
};

const DebuggingScene = () => {
  const action = useRef<AgentAction>("walk");
  const agent = useRef<Group>(null);
  const bug = useRef<Group>(null);
  const legs = useRef<Group>(null);
  const alert = useRef<Group>(null);
  const tick = useRef<Group>(null);
  const line = useRef<MeshStandardMaterial>(null);
  const { timeAt } = useSceneClock(loopSeconds, keyTime);

  useFrame((state) => {
    const time = timeAt(state.clock.elapsedTime);
    action.current = actionAt(time);

    if (agent.current) {
      agent.current.position.x = agentXAt(time);
      const facing = time > 7.2 ? -1.1 : 0.55;
      agent.current.rotation.y = facing;
    }

    if (bug.current) {
      const crawl = (Math.sin(time * 1.7) * 0.5 + 0.5) * bugTravel;
      const caught = progressBetween(time, 4, 4.4);
      const respawn = progressBetween(time, 7.4, 7.9);
      const scale = time < 4.4 ? 1 - caught : respawn;
      bug.current.position.x = bugStartX + crawl;
      bug.current.position.y = bugY + 0.07 + Math.sin(caught * Math.PI) * 0.14;
      bug.current.rotation.z = Math.cos(time * 1.7) > 0 ? 0 : Math.PI;
      bug.current.scale.setScalar(Math.max(scale, 0.0001));
    }

    if (legs.current) {
      legs.current.rotation.y = Math.sin(time * 22) * 0.35;
    }

    if (alert.current) {
      const pop = popScale(time, 3.4, 4.5);
      alert.current.scale.setScalar(Math.max(pop, 0.0001));
      alert.current.position.x = agentXAt(time) + 0.1;
    }

    if (line.current) {
      const resolved =
        progressBetween(time, 4.4, 5) * (1 - progressBetween(time, 7.4, 7.9));
      line.current.color.lerpColors(bugColor, fixedColor, resolved);
    }

    if (tick.current) {
      tick.current.scale.setScalar(Math.max(popScale(time, 4.8, 7.3), 0.0001));
    }
  });

  return (
    <>
      <SceneCamera fitHeight={2.7} fitWidth={5.2} target={[0, 0.92, 0]} />
      <group position={panelCenter} rotation-y={-0.16}>
        <Slab size={panelSize} />
        <Slab
          material="paperDeep"
          position={[0, panelSize[1] / 2 - 0.1, 0.045]}
          size={[panelSize[0] - 0.08, 0.12, 0.02]}
        />
        {codeLines.map(({ indent, width }, index) => {
          const y = lineTop - index * lineGap;
          const isBug = index === bugLine;
          return (
            <group key={y}>
              <Block
                material="rule"
                position={[lineLeft - 0.16, y, 0.05]}
                scale={[0.08, 0.06, 0.02]}
              />
              {isBug ? (
                <mesh
                  geometry={boxGeometry}
                  position={[lineLeft + indent + width / 2, y, 0.05]}
                  scale={[width, 0.075, 0.02]}
                >
                  <meshStandardMaterial
                    color={sceneColors.vermilion}
                    ref={line}
                    roughness={0.6}
                  />
                </mesh>
              ) : (
                <Block
                  material={index % 3 === 0 ? "ink" : "graphite"}
                  position={[lineLeft + indent + width / 2, y, 0.05]}
                  scale={[width, 0.075, 0.02]}
                />
              )}
            </group>
          );
        })}
        <group position={[0, 0, 0.08]} ref={bug}>
          <Block scale={[0.12, 0.08, 0.06]} />
          <group ref={legs}>
            {[-0.035, 0, 0.035].map((x) => (
              <Block
                key={x}
                position={[x, 0, 0]}
                scale={[0.012, 0.16, 0.012]}
              />
            ))}
          </group>
          <Block
            position={[0.075, 0.04, 0]}
            rotation-z={-0.6}
            scale={[0.08, 0.012, 0.012]}
          />
        </group>
        <Check
          position={[
            lineLeft +
              codeLines[bugLine].indent +
              codeLines[bugLine].width +
              0.3,
            bugY,
            0.08,
          ]}
          ref={tick}
          scale={0.0001}
        />
        <PanelLegs
          panelHeight={panelSize[1]}
          panelY={panelCenter[1]}
          spread={0.8}
        />
      </group>
      <BlobShadow position={[0.75, 0.003, 0]} scale={[1.7, 0.45]} />
      <group position={[-2.1, 0, 0.7]} ref={agent}>
        <Agent actionRef={action} {...debuggerAgent} />
      </group>
      <group position={[-2.2, 2.45, 0.7]} ref={alert} scale={0.0001}>
        <Block scale={[0.09, 0.32, 0.09]} />
        <Block position={[0, -0.27, 0]} scale={[0.09, 0.09, 0.09]} />
      </group>
    </>
  );
};

export default DebuggingScene;
