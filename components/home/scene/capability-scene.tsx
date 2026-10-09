"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";

import { Agent } from "@/components/agents/agent";
import { CameraRig } from "@/components/home/scene/camera-rig";
import { scenePalette } from "@/components/home/scene/palette";
import { SceneReady } from "@/components/home/scene/scene-ready";
import type { SceneRenderProps } from "@/components/home/scene/scene-slot";
import { Crate, WorkshopFloor } from "@/components/home/scene/workshop-props";
import { Stage } from "@/components/scene/stage";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

interface CapabilitySceneProps extends SceneRenderProps {
  role: AgentRole;
  action: AgentAction;
  switchKey: string;
}

const capabilityCameraBase: [number, number, number] = [5.2, 3.8, 7.6];
const capabilityCameraTarget: [number, number, number] = [0, 0.8, 0];

const hopDuration = 0.45;
const hopHeight = 0.35;

const ReactingAgent = ({
  role,
  action,
  switchKey,
  reducedMotion,
}: Pick<
  CapabilitySceneProps,
  "role" | "action" | "switchKey" | "reducedMotion"
>) => {
  const group = useRef<Group>(null);
  const hopElapsed = useRef(hopDuration);

  useEffect(() => {
    if (switchKey && !reducedMotion) {
      hopElapsed.current = 0;
    }
  }, [switchKey, reducedMotion]);

  useFrame((_, delta) => {
    if (!group.current || hopElapsed.current >= hopDuration) {
      return;
    }
    hopElapsed.current = Math.min(hopDuration, hopElapsed.current + delta);
    const phase = hopElapsed.current / hopDuration;
    group.current.position.y = Math.sin(phase * Math.PI) * hopHeight;
    group.current.rotation.y = (1 - phase) * Math.PI * 0.5;
  });

  return (
    <group ref={group}>
      <Agent action={action} focused role={role} />
    </group>
  );
};

const CapabilityScene = ({
  frameloop,
  onReady,
  reducedMotion,
  role,
  action,
  switchKey,
}: CapabilitySceneProps) => (
  <Stage
    camera={{
      fov: 30,
      position: capabilityCameraBase,
      target: capabilityCameraTarget,
    }}
    className="absolute inset-0"
    frameloop={frameloop}
    shadowExtent={3}
    label={`The ${role} agent at its station`}
  >
    <SceneReady onReady={onReady} />
    <CameraRig base={capabilityCameraBase} target={capabilityCameraTarget} />
    <WorkshopFloor fadeDistance={10} />
    <mesh position={[0, 0.03, 0]} receiveShadow>
      <cylinderGeometry args={[1.1, 1.1, 0.06, 48]} />
      <meshStandardMaterial color={scenePalette.graphite} roughness={0.9} />
    </mesh>
    <Crate position={[-1.5, 0, -0.6]} size={0.4} />
    <Crate position={[1.4, 0, -1]} size={0.3} />
    <ReactingAgent
      action={action}
      reducedMotion={reducedMotion}
      role={role}
      switchKey={switchKey}
    />
  </Stage>
);

export default CapabilityScene;
