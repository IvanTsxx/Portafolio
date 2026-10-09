"use client";

import { Agent } from "@/components/agents/agent";
import { CameraRig } from "@/components/home/scene/camera-rig";
import { scenePalette, sceneSkyLight } from "@/components/home/scene/palette";
import { TagLayer, TagProjector } from "@/components/home/scene/projected-tags";
import { SceneReady } from "@/components/home/scene/scene-ready";
import type { SceneRenderProps } from "@/components/home/scene/scene-slot";
import {
  anchorRef,
  useTagAnchors,
  useTagElements,
} from "@/components/home/scene/tag-anchors";
import type { ProjectedTag } from "@/components/home/scene/tag-anchors";
import {
  BlueprintBoard,
  Crate,
  Desk,
  Monitor,
  WorkshopFloor,
} from "@/components/home/scene/workshop-props";
import { Stage } from "@/components/scene/stage";
import { agentProfiles } from "@/lib/agents/roles";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

const heroCrew = [
  {
    action: "direct",
    position: [0, 0, 1.6],
    role: "orchestrator",
    rotationY: 0,
  },
  {
    action: "type",
    position: [-1.7, 0, 0.35],
    role: "builder",
    rotationY: Math.PI,
  },
  {
    action: "point",
    position: [2.3, 0, -1.3],
    role: "architect",
    rotationY: -0.9,
  },
  {
    action: "read",
    position: [2.8, 0, 1.2],
    role: "researcher",
    rotationY: -0.6,
  },
  {
    action: "inspect",
    position: [-3.4, 0, 1.6],
    role: "debugger",
    rotationY: 0.7,
  },
] as const satisfies readonly {
  role: AgentRole;
  action: AgentAction;
  position: [number, number, number];
  rotationY: number;
}[];

const heroCameraBase: [number, number, number] = [7.5, 5.6, 10.5];
const heroCameraTarget: [number, number, number] = [0, 0.7, 0];

const HeroScene = ({ frameloop, onReady, reducedMotion }: SceneRenderProps) => {
  const anchors = useTagAnchors();
  const tagElements = useTagElements();
  const tags: ProjectedTag[] = heroCrew.map((member) => ({
    id: member.role,
    label: `${agentProfiles[member.role].designation} · ${member.action}`,
    visible: true,
  }));

  return (
    <>
      <Stage
        camera={{ fov: 30, position: heroCameraBase }}
        className="absolute inset-0"
        frameloop={frameloop}
        label="Isometric workstation where five agents direct, type, point, read and inspect"
      >
        <SceneReady onReady={onReady} />
        <CameraRig
          base={heroCameraBase}
          pointerSway={reducedMotion ? 0 : 0.6}
          target={heroCameraTarget}
        />
        <hemisphereLight args={sceneSkyLight} />
        <WorkshopFloor />
        <Desk depth={1.1} position={[-1.2, 0, -0.4]} width={3.2} />
        <Monitor position={[-1.9, 0.94, -0.65]} />
        <Monitor position={[-0.6, 0.94, -0.65]} rotation-y={-0.25} />
        <BlueprintBoard position={[2.4, 0, -2.4]} rotation-y={-0.35} />
        <Crate position={[-3.6, 0, -0.6]} />
        <Crate position={[-3.1, 0, -0.9]} size={0.38} />
        <Crate position={[-3.4, 0.45, -0.7]} size={0.34} />
        <Crate
          color={scenePalette.clay}
          position={[0.9, 0.94, -0.3]}
          size={0.22}
        />
        {heroCrew.map((member) => (
          <group
            key={member.role}
            position={member.position}
            ref={anchorRef(anchors, member.role)}
          >
            <Agent
              action={member.action}
              focused={member.role === "orchestrator"}
              role={member.role}
              rotation-y={member.rotationY}
              scale={0.7}
            />
          </group>
        ))}
        <TagProjector anchors={anchors} elements={tagElements} lift={1.3} />
      </Stage>
      <TagLayer elements={tagElements} tags={tags} />
    </>
  );
};

export default HeroScene;
