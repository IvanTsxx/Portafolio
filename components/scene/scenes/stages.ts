import type { StageId } from "@/lib/agents/stages";

import { buildStage } from "./build";
import { debugStage } from "./debug";
import { designToCodeStage } from "./design-to-code";
import { exploreStage } from "./explore";
import { orchestrateStage } from "./orchestrate";
import { researchStage } from "./research";
import { reviewStage } from "./review";
import type { StageSpec } from "./scene-values";

export const stageSpecs = {
  build: buildStage,
  debug: debugStage,
  "design-to-code": designToCodeStage,
  explore: exploreStage,
  orchestrate: orchestrateStage,
  research: researchStage,
  review: reviewStage,
} as const satisfies Record<StageId, StageSpec>;
