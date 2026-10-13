"use client";

import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";

import type { AgentSceneId } from "@/lib/agents/scenes";

import { ViewLights } from "./view-lights";

const sceneComponents = {
  debugging: lazy(() => import("./scenes/debugging-scene")),
} as const satisfies Record<AgentSceneId, LazyExoticComponent<ComponentType>>;

const AgentSceneContent = ({ scene }: { scene: AgentSceneId }) => {
  const Scene = sceneComponents[scene];
  return (
    <>
      <ViewLights />
      <Scene />
    </>
  );
};

export default AgentSceneContent;
