"use client";

import { useState } from "react";

import { AgentScene } from "@/components/scene/agent-scene";
import { chipClassName } from "@/components/site/styles";
import type { AgentSceneId } from "@/lib/agents/scenes";
import type { AgentSceneSpec } from "@/lib/design-system/agents";
import { cn } from "@/lib/utils";

export const SceneStage = ({
  scenes,
}: {
  scenes: readonly AgentSceneSpec[];
}) => {
  const [activeId, setActiveId] = useState<AgentSceneId>(
    scenes[0]?.id ?? "feature"
  );
  const active = scenes.find((scene) => scene.id === activeId) ?? scenes[0];

  return (
    <div className="@container">
      <div className="grid gap-4 @3xl:grid-cols-[1fr_16rem]">
        <figure className="border-rule bg-paper-deep/40 m-0 flex flex-col border">
          <AgentScene
            label={`${active?.label ?? "Agent"} scene: agents at work`}
            scene={activeId}
          />
          <figcaption className="label border-rule flex items-baseline justify-between border-t px-4 py-2">
            <span className="flex items-baseline gap-2">
              <span className="text-mist tabular-nums">{active?.code}</span>
              <span aria-live="polite" className="text-ink">
                {active?.label}
              </span>
            </span>
            <span className="text-mist normal-case">
              {active?.cast.join(", ")}
            </span>
          </figcaption>
        </figure>
        <ul className="flex flex-col gap-2">
          {scenes.map((scene) => (
            <li key={scene.id}>
              <button
                aria-pressed={scene.id === activeId}
                className={cn(chipClassName, "w-full justify-between")}
                onClick={() => setActiveId(scene.id)}
                type="button"
              >
                <span className="flex items-baseline gap-2">
                  <span className="tabular-nums opacity-60">{scene.code}</span>
                  {scene.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
