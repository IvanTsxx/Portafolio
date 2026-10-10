"use client";

import type { ThreeElements, ThreeEvent } from "@react-three/fiber";
import { useEffect, useId, useRef } from "react";
import type { RefObject } from "react";
import { BoxGeometry, MathUtils, MeshBasicMaterial, Vector3 } from "three";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

import type { AccessoryKit } from "./accessories/kit";
import { accessoryKits } from "./accessories/registry";
import { disc, roundedBox } from "./geometry";
import { AgentLiveContext, armPivotNames } from "./held-pose";
import { Part } from "./part";
import {
  anchorPositions,
  armSize,
  bodyBase,
  bodySize,
  eyeSize,
  legOffsets,
  legSize,
  shoulder,
} from "./rig";
import { createRadialFadeTexture } from "./textures";
import type { AgentMotion, AgentPointer } from "./use-agent-rig";
import { useAgentRig } from "./use-agent-rig";

export type { AgentMotion, AgentPointer } from "./use-agent-rig";

export interface AgentProps extends Omit<ThreeElements["group"], "children"> {
  role: AgentRole;
  action?: AgentAction;
  actionRef?: RefObject<AgentAction>;
  pointer?: RefObject<AgentPointer>;
  motion?: AgentMotion;
  shadow?: boolean;
}

const seedFromId = (id: string) => {
  let hash = 0;
  for (const character of id) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 9973;
  }
  return hash / 9973;
};

const bodyGeometry = roundedBox(
  bodySize.width,
  bodySize.height,
  bodySize.depth,
  bodySize.radius,
  5
);
const legGeometry = roundedBox(
  legSize.width,
  legSize.height,
  legSize.depth,
  legSize.radius,
  3
);
const armGeometry = roundedBox(
  armSize.length,
  armSize.height,
  armSize.depth,
  armSize.radius,
  4
);
const eyeGeometry = roundedBox(
  eyeSize.size,
  eyeSize.size,
  eyeSize.depth,
  0.014,
  2
);
const highlightGeometry = roundedBox(0.036, 0.036, 0.01, 0.004, 1);

const shadowMaterial = new MeshBasicMaterial({
  alphaMap: createRadialFadeTexture(),
  color: "#3b2a1f",
  depthWrite: false,
  opacity: 0.28,
  toneMapped: false,
  transparent: true,
});

const hitSize = { depth: 1.3, height: 1.9, width: 1.8 };
const hitGeometry = new BoxGeometry(
  hitSize.width,
  hitSize.height,
  hitSize.depth
);
const hitMaterial = new MeshBasicMaterial({ visible: false });
const hitLocal = new Vector3();

const pointerAt = (
  event: ThreeEvent<PointerEvent>,
  hovered: boolean
): AgentPointer => {
  hitLocal.copy(event.point);
  event.object.worldToLocal(hitLocal);
  return {
    hovered,
    x: MathUtils.clamp(hitLocal.x / (hitSize.width / 2), -1, 1),
    y: MathUtils.clamp(hitLocal.y / (hitSize.height / 2), -1, 1),
  };
};

const HitProxy = ({
  onPointer,
}: {
  onPointer: (pointer: AgentPointer) => void;
}) => {
  const isHovering = useRef(false);

  useEffect(
    () => () => {
      if (isHovering.current) {
        document.body.style.cursor = "";
      }
    },
    []
  );

  return (
    <mesh
      geometry={hitGeometry}
      material={hitMaterial}
      onPointerMove={(event) => onPointer(pointerAt(event, isHovering.current))}
      onPointerOut={(event) => {
        isHovering.current = false;
        onPointer(pointerAt(event, false));
        document.body.style.cursor = "";
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        isHovering.current = true;
        onPointer(pointerAt(event, true));
        document.body.style.cursor = "pointer";
      }}
      position={[0, hitSize.height / 2, 0]}
    />
  );
};

const Eye = ({ side }: { side: 1 | -1 }) => (
  <group position={[side * eyeSize.spacing, 0, 0]}>
    <Part geometry={eyeGeometry} material="eye" />
    <Part
      geometry={highlightGeometry}
      material="highlight"
      position={[-0.03, 0.03, eyeSize.depth / 2]}
      receiveShadow={false}
    />
  </group>
);

export const Agent = ({
  role,
  action = "idle",
  actionRef,
  pointer,
  motion,
  shadow = true,
  ...groupProps
}: AgentProps) => {
  const prefersReducedMotion = useReducedMotion();
  const resolvedMotion = motion ?? (prefersReducedMotion ? "reduced" : "full");
  const seed = seedFromId(useId());
  const ownPointer = useRef<AgentPointer>({ hovered: false, x: 0, y: 0 });
  const { attach, attachLeg, liveAction } = useAgentRig({
    action,
    actionRef,
    motion: resolvedMotion,
    pointer: pointer ?? ownPointer,
    seed,
  });
  const kit: AccessoryKit = accessoryKits[role];
  const {
    body: BodyKit,
    face: FaceKit,
    head: HeadKit,
    leftArm: LeftArmKit,
    rightArm: RightArmKit,
    torso: TorsoKit,
  } = kit;

  return (
    <AgentLiveContext value={{ liveAction, motion: resolvedMotion }}>
      <group {...groupProps} dispose={null} name={`agent-${role}-${action}`}>
        {pointer ? null : (
          <HitProxy
            onPointer={(next) => {
              ownPointer.current = next;
            }}
          />
        )}
        {shadow ? (
          <group ref={attach("shadow")}>
            <mesh
              geometry={disc()}
              material={shadowMaterial}
              position={[0, 0.004, 0.04]}
              rotation-x={-Math.PI / 2}
              scale={[0.95, 0.75, 1]}
            />
          </group>
        ) : null}
        <group ref={attach("root")}>
          {legOffsets.map((x, index) => (
            <group
              key={x}
              position={[x, legSize.height, legSize.z]}
              ref={attachLeg(index)}
            >
              <Part
                castShadow
                geometry={legGeometry}
                material="clay"
                position={[0, -legSize.height / 2, 0]}
              />
            </group>
          ))}
          <group position={[0, bodyBase, 0]} ref={attach("body")}>
            <Part
              castShadow
              geometry={bodyGeometry}
              material="clay"
              position={[0, bodySize.height / 2, 0]}
            />
            <group position={anchorPositions.face}>
              <group ref={attach("eyes")}>
                <Eye side={1} />
                <Eye side={-1} />
              </group>
              {FaceKit ? <FaceKit /> : null}
            </group>
            <group position={anchorPositions.head}>
              {HeadKit ? <HeadKit /> : null}
            </group>
            <group position={anchorPositions.torso}>
              {TorsoKit ? <TorsoKit /> : null}
            </group>
            {BodyKit ? <BodyKit /> : null}
            <group
              name={armPivotNames.right}
              position={[shoulder.x, shoulder.y, shoulder.z]}
              ref={attach("armRight")}
            >
              <Part
                castShadow
                geometry={armGeometry}
                material="clay"
                position={[armSize.length / 2, 0, 0]}
              />
              {RightArmKit ? <RightArmKit /> : null}
            </group>
            <group
              name={armPivotNames.left}
              position={[-shoulder.x, shoulder.y, shoulder.z]}
              ref={attach("armLeft")}
            >
              <group scale={[-1, 1, 1]}>
                <Part
                  castShadow
                  geometry={armGeometry}
                  material="clay"
                  position={[armSize.length / 2, 0, 0]}
                />
                {LeftArmKit ? <LeftArmKit /> : null}
              </group>
            </group>
          </group>
        </group>
      </group>
    </AgentLiveContext>
  );
};
