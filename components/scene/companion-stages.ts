import type { AgentAction } from "@/lib/agents/roles";

import { requestSceneFrame } from "./view-registry";

export interface StageSpot {
  action: AgentAction;
  height: number | null;
  x: number;
  y: number;
  yaw: number;
}

export interface StageCue {
  action: AgentAction;
  height: number;
  x: number;
  y: number;
  yaw: number;
}

const cues = new Map<string, StageCue>();

export const markStage = (id: string, write: (cue: StageCue) => void) => {
  let cue = cues.get(id);
  if (!cue) {
    cue = { action: "idle", height: 0, x: 0, y: 0, yaw: 0 };
    cues.set(id, cue);
  }
  write(cue);
};

export const readStageCue = (id: string) => cues.get(id) ?? null;

export const forgetStageCue = (id: string) => {
  cues.delete(id);
};

export interface CompanionStage {
  figure: Element;
  id: string;
  isFeatured?: boolean;
  spot: () => StageSpot | null;
}

const stages = new Map<string, CompanionStage>();

export const registerCompanionStage = (stage: CompanionStage) => {
  stages.set(stage.id, stage);
  requestSceneFrame();
  return () => {
    if (stages.get(stage.id) === stage) {
      stages.delete(stage.id);
      requestSceneFrame();
    }
  };
};

export const getCompanionStages = () => stages.values();
