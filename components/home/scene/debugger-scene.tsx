"use client";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

import { Agent } from "@/components/agents/agent";
import { CameraRig } from "@/components/home/scene/camera-rig";
import { scenePalette } from "@/components/home/scene/palette";
import { SceneReady } from "@/components/home/scene/scene-ready";
import type { SceneRenderProps } from "@/components/home/scene/scene-slot";
import { WorkshopFloor } from "@/components/home/scene/workshop-props";
import { Stage } from "@/components/scene/stage";
import type { AgentRole } from "@/lib/agents/roles";

const debuggerCameraBase: [number, number, number] = [4.6, 4.2, 7.2];
const debuggerCameraTarget: [number, number, number] = [0, 0.4, 0];

const pacingRole: AgentRole = "debugger";

const brokenSegments = [
  { length: 1.4, position: [-1.4, 0.02, 0], rotationY: 0 },
  { length: 0.9, position: [0.05, 0.02, 0.15], rotationY: 0.35 },
  { length: 1.1, position: [1.5, 0.02, -0.3], rotationY: -0.2 },
] as const;

const PacingDebugger = ({ reducedMotion }: { reducedMotion: boolean }) => {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current || reducedMotion) {
      return;
    }
    const time = state.clock.elapsedTime;
    group.current.position.x = Math.sin(time * 0.5) * 0.6 + 0.5;
    group.current.rotation.y = -Math.PI / 2 + Math.cos(time * 0.5) * 0.6;
  });
  return (
    <group position={[0.5, 0, 0.9]} ref={group} rotation-y={-Math.PI / 2}>
      <Agent action="inspect" focused role={pacingRole} scale={0.8} />
    </group>
  );
};

const DebuggerScene = ({
  frameloop,
  onReady,
  reducedMotion,
}: SceneRenderProps) => (
  <Stage
    camera={{
      fov: 30,
      position: debuggerCameraBase,
      target: debuggerCameraTarget,
    }}
    className="absolute inset-0"
    frameloop={frameloop}
    shadowExtent={3.5}
    label="Debugger agent inspecting a broken route blueprint with a magnifying glass"
  >
    <SceneReady onReady={onReady} />
    <CameraRig base={debuggerCameraBase} target={debuggerCameraTarget} />
    <WorkshopFloor fadeDistance={12} />
    {brokenSegments.map((segment) => (
      <mesh
        key={segment.position[0]}
        position={segment.position}
        rotation-y={segment.rotationY}
      >
        <boxGeometry args={[segment.length, 0.03, 0.5]} />
        <meshStandardMaterial color={scenePalette.graphite} />
        <Edges color={scenePalette.blueprint} />
      </mesh>
    ))}
    <PacingDebugger reducedMotion={reducedMotion} />
  </Stage>
);

export default DebuggerScene;
