import { describe, expect, test } from "bun:test";

import { showcasesTheRig } from "@/lib/site/companion-roles";

const companionFile = "components/scene/companion-content.tsx";

const showcaseRoutes = {
  "components/agents/agent-lineup-scene.tsx": "/dev/agents",
  "components/lab/experiments/module-assembly/assembly-view.tsx":
    "/lab/module-assembly",
  "registry/ivan/components/agent-stage/agent-stage-scene.tsx":
    "/registry/agent-stage",
  "registry/ivan/examples/agent/action-ref.tsx": "/registry/agent",
  "registry/ivan/examples/agent/basic.tsx": "/registry/agent",
  "registry/ivan/examples/agent/outfit.tsx": "/registry/agent",
};

const rigRenderers = async () => {
  const glob = new Bun.Glob("{app,components,registry}/**/*.tsx");
  const found: string[] = [];
  for await (const file of glob.scan(".")) {
    const source = await Bun.file(file).text();
    if (/<Agent(?:\s|>|$)/mu.test(source)) {
      found.push(file);
    }
  }
  return found.toSorted();
};

describe("one agent on screen", () => {
  test("the companion is the only agent on site pages; every other rig lives on a showcase route that sends the companion away", async () => {
    const renderers = await rigRenderers();
    expect(renderers).toEqual(
      [companionFile, ...Object.keys(showcaseRoutes)].toSorted()
    );
    for (const route of Object.values(showcaseRoutes)) {
      expect(showcasesTheRig(route)).toBe(true);
    }
  });
});
