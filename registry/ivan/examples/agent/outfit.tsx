"use client";

import { useState } from "react";
import { NeutralToneMapping } from "three";

import { Canvas } from "@/components/registry-docs/demos/agent-canvas-view";
import { Agent } from "@/registry/ivan/components/agent/agent";
import type { Outfit } from "@/registry/ivan/components/agent/outfit";
import { rolePresets } from "@/registry/ivan/components/agent/outfit";

const detective: Outfit = {
  ...rolePresets.debugger,
  face: "round-glasses",
  torso: "knit-sweater",
};

export const Example = () => {
  const [isCustom, setIsCustom] = useState(true);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Canvas
        camera={{ fov: 30, position: [0, 0, 9] }}
        className="h-72 w-full"
        gl={{ toneMapping: NeutralToneMapping }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight intensity={2.2} position={[-3, 6, 6]} />
        <Agent
          action="inspect"
          animateOutfit
          outfit={isCustom ? detective : undefined}
          position={[0, -1.1, 0]}
          role="debugger"
          rotation-y={-0.28}
        />
      </Canvas>
      <button
        className="border px-3 py-2 text-sm"
        onClick={() => setIsCustom(!isCustom)}
        type="button"
      >
        {isCustom ? "Back to the preset" : "Swap in a sweater"}
      </button>
    </div>
  );
};
