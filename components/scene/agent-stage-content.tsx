"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { MathUtils, Vector3 } from "three";

import { Agent } from "@/components/agents/agent";
import type { Outfit } from "@/components/agents/outfit";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

import { ViewLights } from "./view-lights";

export interface AgentStageContentProps {
  action: AgentAction;
  outfit?: Outfit;
  role: AgentRole;
}

const lookTarget = new Vector3(0, 0.95, 0);
const viewDirection = new Vector3();
const elevation = 0.24;
const frameHeight = 2.5;
const frameWidth = 3;

const StageCamera = () => {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / state.size.height);

  useLayoutEffect(() => {
    if (!("fov" in camera)) {
      return;
    }
    const halfFov = MathUtils.degToRad(camera.fov / 2);
    const distance = Math.max(
      frameHeight / 2 / Math.tan(halfFov),
      frameWidth / 2 / (Math.tan(halfFov) * aspect)
    );
    viewDirection.set(0, Math.sin(elevation), Math.cos(elevation));
    camera.position.copy(lookTarget).addScaledVector(viewDirection, distance);
    camera.lookAt(lookTarget);
    camera.updateProjectionMatrix();
  }, [aspect, camera]);

  return null;
};

const AgentStageContent = ({
  action,
  outfit,
  role,
}: AgentStageContentProps) => (
  <>
    <PerspectiveCamera fov={28} makeDefault position={[0, 2, 9]} />
    <StageCamera />
    <ViewLights />
    <Agent
      action={action}
      animateOutfit
      outfit={outfit}
      role={role}
      rotation-y={-0.32}
    />
  </>
);

export default AgentStageContent;
