"use client";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { RefObject } from "react";
import { Color, MathUtils } from "three";
import type { Group, MeshStandardMaterial } from "three";

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
import type {
  ProjectedTag,
  TagElements,
} from "@/components/home/scene/tag-anchors";
import { WorkshopFloor } from "@/components/home/scene/workshop-props";
import { Stage } from "@/components/scene/stage";
import { agentProfiles, agentRoles } from "@/lib/agents/roles";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";
import {
  isRoleActiveInStage,
  workshopStageCount,
  workshopStages,
  worktreeLanes,
} from "@/lib/home/workshop";

const stationX = [-5, -3, -1, 1.2, 3.4, 5.4] as const;
const laneZ = [-1.4, 0, 1.4] as const;
const centerLane = 1;
const [issueX, , laneStartX, buildX, laneEndX, integrateX] = stationX;
const laneLength = laneEndX - laneStartX;
const mcpRailZ = -2.8;
const subagentDropHeight = 3.2;
const reducedMotionStageProgress = 3.7;

const { smoothstep, lerp, damp } = MathUtils;
const draftColor = new Color(scenePalette.graphite);
const finishedColor = new Color(scenePalette.clay);
const workshopCameraBase: [number, number, number] = [0, 7.5, 10];
const workshopCameraTarget: [number, number, number] = [0, 0, 0];

const stationXAt = (stagePosition: number) => {
  const stageIndex = Math.min(
    workshopStageCount - 1,
    Math.floor(stagePosition)
  );
  const withinStage = stagePosition - stageIndex;
  const previous = stationX[Math.max(stageIndex - 1, 0)] ?? issueX;
  const current = stationX[stageIndex] ?? issueX;
  return lerp(previous, current, smoothstep(withinStage, 0, 0.4));
};

const splitAmountAt = (stagePosition: number) =>
  smoothstep(stagePosition, 2, 2.45) * (1 - smoothstep(stagePosition, 5, 5.45));

const crewLayout = {
  analyst: { position: [3.4, 0, 2.5], rotationY: Math.PI },
  architect: { position: [-3, 0, 1.3], rotationY: Math.PI * 0.85 },
  builder: { position: [1.95, 0, laneZ[1]], rotationY: -Math.PI / 2 },
  debugger: { position: [1.95, 0, laneZ[2]], rotationY: -Math.PI / 2 },
  inspector: { position: [3.4, 0, -2.5], rotationY: 0 },
  orchestrator: { position: [-3, 0, -1.3], rotationY: Math.PI * 0.15 },
  researcher: { position: [1.95, 0, laneZ[0]], rotationY: -Math.PI / 2 },
} as const satisfies Record<
  AgentRole,
  { position: [number, number, number]; rotationY: number }
>;

const builderIntegratePosition = [6.3, 0, -0.7] as const;

const actionFor = (role: AgentRole, stageIndex: number): AgentAction => {
  if (!isRoleActiveInStage(role, stageIndex)) {
    return "idle";
  }
  if (workshopStages[stageIndex]?.id === "integrate") {
    return "celebrate";
  }
  return agentProfiles[role].signatureActions[0];
};

interface WorkshopSceneProps extends SceneRenderProps {
  progressRef: RefObject<number>;
  activeStage: number;
}

const LaneCard = ({
  laneIndex,
  cardRef,
  bodyMaterialRef,
}: {
  laneIndex: number;
  cardRef: (group: Group | null) => void;
  bodyMaterialRef?: RefObject<MeshStandardMaterial | null>;
}) => {
  const lane = worktreeLanes[laneIndex];
  return (
    <group ref={cardRef}>
      <mesh castShadow position={[0, 0.06, 0]}>
        <boxGeometry args={[1, 0.06, 0.66]} />
        <meshStandardMaterial
          color={scenePalette.graphite}
          ref={bodyMaterialRef}
          roughness={0.7}
        />
        <Edges color={scenePalette.blueprint} />
      </mesh>
      {lane?.skills.map((skill, skillIndex) => (
        <mesh
          castShadow
          key={skill}
          name="cartridge"
          position={[-0.2 + skillIndex * 0.24, 0.16, 0]}
        >
          <boxGeometry args={[0.16, 0.12, 0.3]} />
          <meshStandardMaterial color={scenePalette.surfaceLight} />
          <Edges color={scenePalette.edge} />
        </mesh>
      ))}
    </group>
  );
};

const WorkshopRig = ({
  progressRef,
  reducedMotion,
  activeStage,
  tagElements,
}: {
  progressRef: RefObject<number>;
  reducedMotion: boolean;
  activeStage: number;
  tagElements: TagElements;
}) => {
  const stagePosition = useRef(reducedMotion ? reducedMotionStageProgress : 0);
  const cameraTrack = useRef(0);
  const cards = useRef<(Group | null)[]>([]);
  const lanes = useRef<(Group | null)[]>([]);
  const connectors = useRef<(Group | null)[]>([]);
  const centerMaterial = useRef<MeshStandardMaterial | null>(null);
  const anchors = useTagAnchors();

  useFrame((_, delta) => {
    const target = reducedMotion
      ? reducedMotionStageProgress
      : (progressRef.current ?? 0) * workshopStageCount;
    stagePosition.current = reducedMotion
      ? target
      : damp(stagePosition.current, target, 6, delta);
    const position = Math.min(
      stagePosition.current,
      workshopStageCount - 0.001
    );
    const cardX = stationXAt(position);
    const split = splitAmountAt(position);
    const entryLift = (1 - smoothstep(position, 0, 0.4)) * 1.6;
    const converged = smoothstep(position, 5, 5.45);
    const loaded = smoothstep(position, 3, 3.45);

    cameraTrack.current = lerp(-3, 3, position / workshopStageCount);

    for (const [laneIndex, card] of cards.current.entries()) {
      if (!card) {
        continue;
      }
      const isCenter = laneIndex === centerLane;
      const scale = isCenter ? 1 : Math.max(split, 0.0001);
      card.position.set(cardX, entryLift, (laneZ[laneIndex] ?? 0) * split);
      card.scale.setScalar(scale);
      for (const child of card.children) {
        if (child.name === "cartridge") {
          child.visible = loaded > 0.01 && converged < 0.99;
          child.position.y = 0.16 + (1 - loaded) * 1.4;
        }
      }
    }

    centerMaterial.current?.color.lerpColors(
      draftColor,
      finishedColor,
      converged
    );

    const laneGrowth = smoothstep(position, 2, 2.6);
    for (const lane of lanes.current) {
      if (!lane) {
        continue;
      }
      lane.scale.x = Math.max(laneGrowth, 0.0001);
    }

    const connectorReach = loaded * (1 - converged);
    for (const connector of connectors.current) {
      if (!connector) {
        continue;
      }
      connector.scale.z = Math.max(connectorReach, 0.0001);
      connector.visible = connectorReach > 0.01;
    }

    const debuggerGroup = anchors.current.get("debugger");
    if (debuggerGroup) {
      const descend = 1 - smoothstep(position, 2.8, 3.3);
      const ascend = smoothstep(position, 4.1, 4.6);
      const height = Math.max(descend, ascend) * subagentDropHeight;
      debuggerGroup.position.y = height;
      debuggerGroup.visible = height < subagentDropHeight - 0.05;
    }

    const builderGroup = anchors.current.get("builder");
    if (builderGroup) {
      const walk = smoothstep(position, 5, 5.6);
      const [homeX, , homeZ] = crewLayout.builder.position;
      builderGroup.position.x = lerp(homeX, builderIntegratePosition[0], walk);
      builderGroup.position.z = lerp(homeZ, builderIntegratePosition[2], walk);
    }
  });

  return (
    <>
      <CameraRig
        base={workshopCameraBase}
        target={workshopCameraTarget}
        trackX={cameraTrack}
      />
      <mesh position={[(issueX + laneStartX) / 2 - 0.4, 0.01, 0]}>
        <boxGeometry args={[laneStartX - issueX + 0.8, 0.02, 0.08]} />
        <meshStandardMaterial color={scenePalette.surfaceLight} />
      </mesh>
      <mesh position={[(laneEndX + integrateX) / 2 + 0.4, 0.01, 0]}>
        <boxGeometry args={[integrateX - laneEndX + 0.8, 0.02, 0.08]} />
        <meshStandardMaterial color={scenePalette.surfaceLight} />
      </mesh>
      {laneZ.map((z, laneIndex) => (
        <group
          key={z}
          position={[laneStartX, 0.012, z]}
          ref={(group) => {
            lanes.current[laneIndex] = group;
          }}
        >
          <mesh position={[laneLength / 2, 0, 0]}>
            <boxGeometry args={[laneLength, 0.02, 0.7]} />
            <meshStandardMaterial
              color={scenePalette.graphite}
              opacity={0.85}
              transparent
            />
            <Edges color={scenePalette.edge} />
          </mesh>
        </group>
      ))}
      <mesh position={[(laneStartX + laneEndX) / 2, 1, mcpRailZ]}>
        <boxGeometry args={[laneLength + 1, 0.08, 0.08]} />
        <meshStandardMaterial color={scenePalette.surfaceLight} />
      </mesh>
      {[laneStartX - 0.5, laneEndX + 0.5].map((x) => (
        <mesh castShadow key={x} position={[x, 0.5, mcpRailZ]}>
          <boxGeometry args={[0.06, 1, 0.06]} />
          <meshStandardMaterial color={scenePalette.graphite} />
        </mesh>
      ))}
      {laneZ.map((z, laneIndex) => {
        const reach = z - mcpRailZ;
        return (
          <group
            key={z}
            position={[buildX + 0.35, 1, mcpRailZ]}
            ref={(group) => {
              connectors.current[laneIndex] = group;
            }}
          >
            <mesh position={[0, 0, reach / 2]}>
              <boxGeometry args={[0.03, 0.03, reach]} />
              <meshBasicMaterial color={scenePalette.blueprint} />
            </mesh>
            <mesh position={[0, -0.42, reach]}>
              <boxGeometry args={[0.03, 0.84, 0.03]} />
              <meshBasicMaterial color={scenePalette.blueprint} />
            </mesh>
          </group>
        );
      })}
      {laneZ.map((z, laneIndex) => (
        <LaneCard
          bodyMaterialRef={
            laneIndex === centerLane ? centerMaterial : undefined
          }
          cardRef={(group) => {
            cards.current[laneIndex] = group;
          }}
          key={z}
          laneIndex={laneIndex}
        />
      ))}
      {agentRoles.map((role) => {
        const layout = crewLayout[role];
        const isActive =
          reducedMotion || isRoleActiveInStage(role, activeStage);
        return (
          <group
            key={role}
            position={layout.position}
            ref={anchorRef(anchors, role)}
          >
            <Agent
              action={reducedMotion ? "idle" : actionFor(role, activeStage)}
              focused={isActive}
              role={role}
              rotation-y={layout.rotationY}
              scale={0.55}
            />
          </group>
        );
      })}
      <TagProjector anchors={anchors} elements={tagElements} lift={1.1} />
    </>
  );
};

const WorkshopScene = ({
  frameloop,
  onReady,
  reducedMotion,
  progressRef,
  activeStage,
}: WorkshopSceneProps) => {
  const tagElements = useTagElements();
  const tags: ProjectedTag[] = agentRoles.map((role) => ({
    id: role,
    label: agentProfiles[role].designation,
    visible: !reducedMotion && isRoleActiveInStage(role, activeStage),
  }));

  return (
    <>
      <Stage
        camera={{ fov: 30, position: workshopCameraBase }}
        className="absolute inset-0"
        frameloop={frameloop}
        label="Workbench where an issue card splits into three worktree lanes, gets built and reviewed, then merges into one finished module"
      >
        <SceneReady onReady={onReady} />
        <hemisphereLight args={sceneSkyLight} />
        <WorkshopFloor fadeDistance={26} />
        <WorkshopRig
          activeStage={activeStage}
          progressRef={progressRef}
          reducedMotion={reducedMotion}
          tagElements={tagElements}
        />
      </Stage>
      <TagLayer elements={tagElements} tags={tags} />
    </>
  );
};

export default WorkshopScene;
