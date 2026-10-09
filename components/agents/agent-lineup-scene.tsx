"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { MathUtils, Vector3 } from "three";

import { Stage } from "@/components/scene/stage";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

import { Agent } from "./agent";
import type { AgentMotion } from "./use-agent-rig";

export interface LineupEntry {
  action: AgentAction;
  role: AgentRole;
}

export interface AgentLineupSceneProps {
  entries: readonly LineupEntry[];
  focusedRole: AgentRole | null;
  motion: AgentMotion;
  onFocusRole: (role: AgentRole | null) => void;
}

const spacing = 2.25;
const rowDepth = 2.6;

const columnsForAspect = (aspect: number) => {
  if (aspect > 1.7) {
    return 7;
  }
  if (aspect > 0.9) {
    return 4;
  }
  return 2;
};

const lookTarget = new Vector3(0, 0.75, 0);
const viewDirection = new Vector3();
const agentHeight = 2.4;

const FitCamera = ({ width, depth }: { width: number; depth: number }) => {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / state.size.height);
  useLayoutEffect(() => {
    if (!("fov" in camera)) {
      return;
    }
    const elevation = depth > 0 ? 0.62 : 0.2;
    viewDirection.set(0, Math.sin(elevation), Math.cos(elevation));
    const halfFov = MathUtils.degToRad(camera.fov / 2);
    const projectedHeight =
      agentHeight * Math.cos(elevation) + depth * Math.sin(elevation);
    const fitWidth = width / 2 / (Math.tan(halfFov) * aspect);
    const fitHeight = projectedHeight / 2 / Math.tan(halfFov);
    const distance = Math.max(fitWidth, fitHeight) * 1.1 + depth / 2;
    camera.position.copy(lookTarget).addScaledVector(viewDirection, distance);
    camera.lookAt(lookTarget);
    camera.updateProjectionMatrix();
  }, [aspect, camera, depth, width]);
  return null;
};

const StatsProbe = () => {
  const gl = useThree((state) => state.gl);
  const windowStart = useRef(0);
  const frames = useRef(0);
  useFrame(() => {
    const now = performance.now();
    frames.current += 1;
    const elapsed = now - windowStart.current;
    if (elapsed < 1000) {
      return;
    }
    document.documentElement.dataset.agentStageStats = JSON.stringify({
      calls: gl.info.render.calls,
      frameMs: Math.round((elapsed / frames.current) * 100) / 100,
      geometries: gl.info.memory.geometries,
      programs: gl.info.programs?.length ?? 0,
      textures: gl.info.memory.textures,
      triangles: gl.info.render.triangles,
    });
    windowStart.current = now;
    frames.current = 0;
  });
  return null;
};

const LineupAgents = ({
  entries,
  focusedRole,
  motion,
  onFocusRole,
}: AgentLineupSceneProps) => {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const columns = Math.min(columnsForAspect(aspect), entries.length);
  const rows = Math.ceil(entries.length / columns);

  return (
    <>
      <FitCamera
        depth={(rows - 1) * rowDepth}
        width={(columns - 1) * spacing + 3.2}
      />
      {entries.map(({ action, role }, index) => {
        const row = Math.floor(index / columns);
        const inRow =
          row === rows - 1 ? entries.length - row * columns : columns;
        const column = index % columns;
        const x = (column - (inRow - 1) / 2) * spacing;
        const z = (row - (rows - 1) / 2) * -rowDepth;
        return (
          <Agent
            action={action}
            focused={focusedRole === role}
            key={role}
            motion={motion}
            onPointerOut={() => onFocusRole(null)}
            onPointerOver={(event) => {
              event.stopPropagation();
              onFocusRole(role);
            }}
            position={[x, 0, z]}
            role={role}
          />
        );
      })}
    </>
  );
};

const AgentLineupScene = (props: AgentLineupSceneProps) => (
  <Stage
    camera={{ fov: 30, position: [0, 3.2, 11], target: [0, 0.7, 0] }}
    label="Lineup of seven workshop agents, each in its signature action"
    shadowExtent={props.entries.length === 1 ? 2.5 : 8}
  >
    <LineupAgents {...props} />
    <StatsProbe />
  </Stage>
);

export default AgentLineupScene;
