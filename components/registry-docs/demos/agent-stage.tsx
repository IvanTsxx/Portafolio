"use client";

import { AgentPlayground } from "@/components/registry-docs/demos/agent-playground";
import { AgentPoster } from "@/registry/ivan/components/agent-stage/agent-poster";

export const Demo = () => (
  <AgentPlayground
    initialValues={{
      action: "measure",
      reducedMotion: false,
      role: "architect",
      shadow: true,
    }}
  />
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="border-rule-strong relative flex aspect-square h-4/5 items-end justify-center border">
      <AgentPoster className="size-full" role="architect" />
    </div>
  </div>
);
