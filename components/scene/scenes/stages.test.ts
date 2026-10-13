import { describe, expect, test } from "bun:test";

import { agentActions } from "@/lib/agents/roles";
import { stageIds } from "@/lib/agents/stages";

import {
  boxTriangles,
  layoutRigs,
  mergeShadows,
  mergeStill,
  resetPoses,
  restPose,
  trianglesOf,
  writeRigs,
} from "./stage-mesh";
import { stageSpecs } from "./stages";

const budgetOf = (id: (typeof stageIds)[number]) => {
  const spec = stageSpecs[id];
  const still = mergeStill(spec.still);
  const shadows = mergeShadows(spec.shadows);
  const layout = layoutRigs(spec.rigs);
  expect(still).not.toBeNull();
  return {
    calls: 1 + (layout.count > 0 ? 1 : 0) + (shadows ? 1 : 0),
    instances: layout.count,
    triangles:
      trianglesOf(still) + layout.count * boxTriangles + trianglesOf(shadows),
  };
};

describe("stages", () => {
  test("every work step has a stage", () => {
    expect(Object.keys(stageSpecs).toSorted()).toEqual(
      [...stageIds].toSorted()
    );
  });

  test("a stage draws in at most three calls and stays under 12k triangles", () => {
    for (const id of stageIds) {
      const budget = budgetOf(id);
      expect(budget.calls).toBeLessThanOrEqual(3);
      expect(budget.triangles).toBeLessThan(12_000);
    }
  });

  test("every frame of the loop gives the companion a real action and moves the props", () => {
    for (const id of stageIds) {
      const spec = stageSpecs[id];
      const layout = layoutRigs(spec.rigs);
      const poses = spec.rigs.map(restPose);
      const frames = new Set<string>();
      for (let time = 0; time < spec.loopSeconds; time += 0.25) {
        resetPoses(poses);
        const action = spec.play(time, poses);
        expect(agentActions).toContain(action);
        const frame: string[] = [];
        writeRigs(spec.rigs, poses, layout, {
          color: (_, color) => frame.push(color.getHexString()),
          matrix: (_, matrix) =>
            frame.push(
              matrix.elements.map((value) => value.toFixed(3)).join(",")
            ),
        });
        frames.add(frame.join("|"));
      }
      expect(frames.size).toBeGreaterThan(spec.loopSeconds);
      expect(spec.keyTime).toBeLessThan(spec.loopSeconds);
    }
  });
});
