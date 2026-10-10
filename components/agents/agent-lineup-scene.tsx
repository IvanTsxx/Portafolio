"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { MathUtils, Vector3 } from "three";

import { ViewLights } from "@/components/scene/view-lights";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

import { Agent } from "./agent";
import type { AgentMotion } from "./use-agent-rig";

export interface LineupEntry {
  action: AgentAction;
  role: AgentRole;
}

export interface AgentLineupSceneProps {
  entries: readonly LineupEntry[];
  motion: AgentMotion;
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

const LineupAgents = ({ entries, motion }: AgentLineupSceneProps) => {
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
            key={role}
            motion={motion}
            position={[x, 0, z]}
            role={role}
          />
        );
      })}
    </>
  );
};

const AgentLineupScene = (props: AgentLineupSceneProps) => (
  <>
    <PerspectiveCamera fov={30} makeDefault position={[0, 3.2, 11]} />
    <ViewLights />
    <LineupAgents {...props} />
  </>
);

export default AgentLineupScene;
