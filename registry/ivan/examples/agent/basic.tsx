"use client";

import { NeutralToneMapping } from "three";

import { Canvas } from "@/components/registry-docs/demos/agent-canvas-view";
import { Agent } from "@/registry/ivan/components/agent/agent";

export const Example = () => (
  <Canvas
    camera={{ fov: 30, position: [0, 0, 9] }}
    className="h-72 w-full max-w-md"
    gl={{ toneMapping: NeutralToneMapping }}
  >
    <ambientLight intensity={1.4} />
    <directionalLight intensity={2.2} position={[-3, 6, 6]} />
    <Agent
      action="inspect"
      position={[0, -1.1, 0]}
      role="debugger"
      rotation-y={-0.28}
    />
  </Canvas>
);
