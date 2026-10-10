"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect } from "react";
import { MathUtils, Vector3 } from "three";

import { Agent } from "@/registry/ivan/components/agent/agent";
import type {
  AgentAction,
  AgentRole,
} from "@/registry/ivan/components/agent/types";
import { agentSignatureActions } from "@/registry/ivan/components/agent/types";
import type { AgentMotion } from "@/registry/ivan/components/agent/use-agent-rig";

import { StageLights } from "./stage-lights";

export interface AgentStageSceneProps {
  role: AgentRole;
  action?: AgentAction;
  motion?: AgentMotion;
  shadow?: boolean;
}

const lookTarget = new Vector3(0, 1, 0);
const viewDirection = new Vector3();
const elevation = 0.2;
const framedHeight = 2.5;
const framedWidth = 3;
const framePadding = 1.08;
const agentYaw = -0.28;

const FitCamera = () => {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / state.size.height);

  useLayoutEffect(() => {
    if (!("fov" in camera)) {
      return;
    }
    viewDirection.set(0, Math.sin(elevation), Math.cos(elevation));
    const halfFov = MathUtils.degToRad(camera.fov / 2);
    const fitHeight = framedHeight / 2 / Math.tan(halfFov);
    const fitWidth = framedWidth / 2 / (Math.tan(halfFov) * aspect);
    const distance = Math.max(fitHeight, fitWidth) * framePadding;
    camera.position.copy(lookTarget).addScaledVector(viewDirection, distance);
    camera.lookAt(lookTarget);
    camera.updateProjectionMatrix();
  }, [aspect, camera]);

  return null;
};

const FrameInvalidator = () => {
  const invalidate = useThree((state) => state.invalidate);
  const frameloop = useThree((state) => state.frameloop);

  useEffect(() => {
    if (frameloop === "demand") {
      invalidate();
    }
  }, [frameloop, invalidate]);

  return null;
};

export const AgentStageScene = ({
  role,
  action = agentSignatureActions[role],
  motion,
  shadow = true,
}: AgentStageSceneProps) => (
  <>
    <PerspectiveCamera fov={30} makeDefault position={[0, 2.4, 10]} />
    <FitCamera />
    <StageLights />
    <FrameInvalidator />
    <Agent
      action={action}
      motion={motion}
      role={role}
      rotation-y={agentYaw}
      shadow={shadow}
    />
  </>
);
