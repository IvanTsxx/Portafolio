"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";

import { Agent } from "@/components/agents/agent";
import type { AgentAction } from "@/lib/agents/roles";

import { BlobShadow, Block, SceneCamera, Slab, useSceneClock } from "./kit";
import {
  boxGeometry,
  popScale,
  progressBetween,
  sceneMaterials,
} from "./scene-values";

const researcherAgent = { role: "researcher", scale: 0.9 } as const;

const loopSeconds = 8;
const keyTime = 6.2;
const screenWidth = 1.5;
const screenHeight = 0.92;
const rowGap = 0.11;
const rowCount = 10;
const scrollSpeed = 0.16;
const deskTop = 0.78;
const monitorY = deskTop + 0.72;

const rows = Array.from({ length: rowCount }, (_, index) => ({
  indent: [0, 0.12, 0.24, 0.12, 0, 0.12, 0.24, 0.36, 0.12, 0][index] ?? 0,
  width:
    [0.8, 0.62, 0.95, 0.5, 0.72, 0.88, 0.42, 0.66, 0.78, 0.55][index] ?? 0.6,
}));

const matches = [1.7, 3.7, 5.7] as const;
const resultRows = [0.22, 0.02, -0.18] as const;
const resetAt = 7.4;

const researcherActionAt = (time: number): AgentAction =>
  matches.some((at) => time > at && time < at + 0.6) ? "point" : "read";

const CodeSearchScene = () => {
  const action = useRef<AgentAction>("read");
  const lines = useRef<(Mesh | null)[]>([]);
  const sweep = useRef<Group>(null);
  const results = useRef<(Group | null)[]>([]);
  const { timeAt } = useSceneClock(loopSeconds, keyTime);

  useFrame((state) => {
    const time = timeAt(state.clock.elapsedTime);
    action.current = researcherActionAt(time);
    const span = rowCount * rowGap;
    const offset = (time * scrollSpeed) % span;

    for (const [index, row] of rows.entries()) {
      const line = lines.current[index];
      if (!line) {
        continue;
      }
      const raw = index * rowGap + offset;
      const y = screenHeight / 2 - 0.08 - (raw % span);
      const edge = Math.min(
        progressBetween(y, -screenHeight / 2 + 0.02, -screenHeight / 2 + 0.12),
        progressBetween(y, screenHeight / 2 - 0.02, screenHeight / 2 - 0.12)
      );
      line.position.set(
        -screenWidth / 2 + 0.12 + row.indent + row.width / 2,
        y,
        0.012
      );
      line.scale.set(Math.max(row.width * edge, 0.0001), 0.045, 0.01);
    }

    if (sweep.current) {
      const pass = (time % 2) / 2;
      sweep.current.position.y =
        screenHeight / 2 - 0.1 - pass * (screenHeight - 0.2);
    }

    for (const [index, at] of matches.entries()) {
      const result = results.current[index];
      if (result) {
        result.scale.setScalar(
          Math.max(popScale(time, at + 0.15, resetAt), 0.0001)
        );
      }
    }
  });

  return (
    <>
      <SceneCamera fitHeight={2.8} fitWidth={5.6} target={[0, 0.92, 0]} />
      <group position={[0.05, 0, -0.1]}>
        <Slab
          material="paperDeep"
          position={[0, deskTop, 0]}
          size={[2.1, 0.08, 1.05]}
        />
        {[-0.95, 0.95].map((x) =>
          [-0.42, 0.42].map((z) => (
            <Block
              key={`${x}${z}`}
              position={[x, deskTop / 2, z]}
              scale={[0.05, deskTop, 0.05]}
            />
          ))
        )}
        <Block
          position={[0, deskTop + 0.18, -0.18]}
          scale={[0.07, 0.32, 0.07]}
        />
        <Slab
          material="ink"
          position={[0, deskTop + 0.05, -0.18]}
          size={[0.5, 0.03, 0.3]}
        />
        <group position={[0, monitorY, -0.16]} rotation-x={-0.04}>
          <Slab
            material="ink"
            radius={0.04}
            size={[screenWidth + 0.12, screenHeight + 0.12, 0.08]}
          />
          <Slab
            material="paper"
            position={[0, 0, 0.042]}
            radius={0.01}
            size={[screenWidth, screenHeight, 0.01]}
          />
          <group position={[0, 0, 0.042]}>
            {rows.map((row, index) => (
              <mesh
                geometry={boxGeometry}
                key={`${row.indent}${row.width}`}
                material={sceneMaterials[index % 4 === 0 ? "ink" : "graphite"]}
                ref={(node) => {
                  lines.current[index] = node;
                }}
              />
            ))}
            <group ref={sweep}>
              <Block
                material="ink"
                position={[-screenWidth / 2 + 0.03, 0, 0.012]}
                scale={[0.03, 0.08, 0.012]}
              />
              <Block
                material="rule"
                position={[0, 0, 0.006]}
                scale={[screenWidth - 0.04, 0.085, 0.004]}
              />
            </group>
          </group>
        </group>
        <Slab
          material="paper"
          position={[0.05, deskTop + 0.055, 0.22]}
          size={[0.8, 0.03, 0.26]}
        />
      </group>
      <BlobShadow position={[0.05, 0.003, -0.1]} scale={[1.3, 0.6]} />
      <group position={[1.95, 1.6, 0.1]} rotation-y={-0.32}>
        <Slab size={[1.05, 1.05, 0.06]} />
        <Block position={[-0.2, 0.4, 0.035]} scale={[0.5, 0.07, 0.015]} />
        {resultRows.map((y, index) => (
          <group
            key={y}
            position={[0, y, 0.04]}
            ref={(node) => {
              results.current[index] = node;
            }}
            scale={0.0001}
          >
            <Block position={[-0.36, 0, 0]} scale={[0.1, 0.1, 0.015]} />
            <Block
              material="graphite"
              position={[0.08, 0, 0]}
              scale={[0.62, 0.05, 0.015]}
            />
          </group>
        ))}
      </group>
      <group position={[-1.55, 0, 0.5]} rotation-y={0.85}>
        <Agent actionRef={action} {...researcherAgent} />
      </group>
    </>
  );
};

export default CodeSearchScene;
