"use client";

import { AgentPlayground } from "@/components/registry-docs/demos/agent-playground";
import { AgentPoster } from "@/registry/ivan/components/agent-stage/agent-poster";

export const Demo = () => (
  <AgentPlayground
    initialValues={{
      action: "inspect",
      reducedMotion: false,
      role: "debugger",
      shadow: true,
    }}
  />
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-end justify-center gap-1 px-4 pb-4">
    {(["debugger", "builder", "researcher"] as const).map((role) => (
      <AgentPoster className="aspect-square h-2/5" key={role} role={role} />
    ))}
  </div>
);
