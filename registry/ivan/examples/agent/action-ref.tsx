"use client";

import { useRef } from "react";
import { NeutralToneMapping } from "three";

import { Canvas } from "@/components/registry-docs/demos/agent-canvas-view";
import { Agent } from "@/registry/ivan/components/agent/agent";
import type { AgentAction } from "@/registry/ivan/components/agent/types";

const actions = [
  "idle",
  "wave",
  "type",
  "celebrate",
] as const satisfies readonly AgentAction[];

export const Example = () => {
  const actionRef = useRef<AgentAction>("idle");

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Canvas
        camera={{ fov: 30, position: [0, 0, 9] }}
        className="h-72 w-full"
        gl={{ toneMapping: NeutralToneMapping }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight intensity={2.2} position={[-3, 6, 6]} />
        <Agent
          actionRef={actionRef}
          position={[0, -1.1, 0]}
          role="builder"
          rotation-y={-0.28}
        />
      </Canvas>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            className="border-border hover:bg-accent border px-3 py-2 text-sm"
            key={action}
            onClick={() => {
              actionRef.current = action;
            }}
            type="button"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};
