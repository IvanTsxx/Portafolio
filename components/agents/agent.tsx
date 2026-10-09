"use client";

import type { ThreeElements } from "@react-three/fiber";
import { useId } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

import type { AccessoryKit } from "./accessories/kit";
import { accessoryKits } from "./accessories/registry";
import { roundedBox } from "./geometry";
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
import type { AgentMotion } from "./use-agent-rig";
import { useAgentRig } from "./use-agent-rig";

export type { AgentMotion } from "./use-agent-rig";

export interface AgentProps extends Omit<ThreeElements["group"], "children"> {
  role: AgentRole;
  action?: AgentAction;
  focused?: boolean;
  motion?: AgentMotion;
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
  focused = false,
  motion,
  ...groupProps
}: AgentProps) => {
  const prefersReducedMotion = useReducedMotion();
  const resolvedMotion = motion ?? (prefersReducedMotion ? "reduced" : "full");
  const seed = seedFromId(useId());
  const { attach, attachLeg } = useAgentRig({
    action,
    focused,
    motion: resolvedMotion,
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
    <group
      {...groupProps}
      dispose={null}
      name={`agent-${role}-${action}${focused ? "-focused" : ""}`}
    >
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
  );
};
