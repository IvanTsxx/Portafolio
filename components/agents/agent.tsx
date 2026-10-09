"use client";

import { RoundedBox } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

import type { AgentAction, AgentRole } from "@/lib/agents/roles";

export interface AgentProps extends Omit<ThreeElements["group"], "children"> {
  role: AgentRole;
  action?: AgentAction;
  focused?: boolean;
}

export const Agent = ({
  role,
  action = "idle",
  focused = false,
  ...groupProps
}: AgentProps) => (
  <group
    {...groupProps}
    name={`agent-${role}-${action}${focused ? "-focused" : ""}`}
  >
    <RoundedBox args={[1, 0.8, 0.8]} position={[0, 0.6, 0]} radius={0.12}>
      <meshStandardMaterial color="#e0855c" roughness={0.6} />
    </RoundedBox>
  </group>
);
