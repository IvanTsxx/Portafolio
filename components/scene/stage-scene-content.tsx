"use client";

import type { StageId } from "@/lib/agents/stages";

import { StageProps } from "./scenes/stage-props";
import { stageSpecs } from "./scenes/stages";
import { ViewLights } from "./view-lights";

const StageSceneContent = ({
  cueId,
  stage,
}: {
  cueId: string;
  stage: StageId;
}) => (
  <>
    <ViewLights />
    <StageProps cueId={cueId} key={stage} spec={stageSpecs[stage]} />
  </>
);

export default StageSceneContent;
