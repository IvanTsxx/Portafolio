"use client";

import dynamic from "next/dynamic";
import type { RefObject } from "react";

import {
  DebuggerSceneFallback,
  HeroSceneFallback,
  SingleAgentFallback,
  WorkshopSceneFallback,
} from "@/components/home/scene/scene-fallbacks";
import { SceneSlot } from "@/components/home/scene/scene-slot";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

const HeroScene = dynamic(() => import("@/components/home/scene/hero-scene"), {
  ssr: false,
});
const WorkshopScene = dynamic(
  () => import("@/components/home/scene/workshop-scene"),
  { ssr: false }
);
const CapabilityScene = dynamic(
  () => import("@/components/home/scene/capability-scene"),
  { ssr: false }
);
const DebuggerScene = dynamic(
  () => import("@/components/home/scene/debugger-scene"),
  { ssr: false }
);

export const LazyHeroScene = ({ className }: { className?: string }) => (
  <SceneSlot className={className} fallback={<HeroSceneFallback />}>
    {(sceneProps) => <HeroScene {...sceneProps} />}
  </SceneSlot>
);

export const LazyWorkshopScene = ({
  className,
  progressRef,
  activeStage,
}: {
  className?: string;
  progressRef: RefObject<number>;
  activeStage: number;
}) => (
  <SceneSlot className={className} fallback={<WorkshopSceneFallback />}>
    {(sceneProps) => (
      <WorkshopScene
        {...sceneProps}
        activeStage={activeStage}
        progressRef={progressRef}
      />
    )}
  </SceneSlot>
);

export const LazyCapabilityScene = ({
  className,
  role,
  action,
  switchKey,
}: {
  className?: string;
  role: AgentRole;
  action: AgentAction;
  switchKey: string;
}) => (
  <SceneSlot className={className} fallback={<SingleAgentFallback />}>
    {(sceneProps) => (
      <CapabilityScene
        {...sceneProps}
        action={action}
        role={role}
        switchKey={switchKey}
      />
    )}
  </SceneSlot>
);

export const LazyDebuggerScene = ({ className }: { className?: string }) => (
  <SceneSlot className={className} fallback={<DebuggerSceneFallback />}>
    {(sceneProps) => <DebuggerScene {...sceneProps} />}
  </SceneSlot>
);
