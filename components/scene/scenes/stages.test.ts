import { describe, expect, test } from "bun:test";

import type { Box3, Matrix4 } from "three";
import { PerspectiveCamera, Vector3 } from "three";

import { agentActions } from "@/lib/agents/roles";
import { stageIds } from "@/lib/agents/stages";

import {
  boxTriangles,
  fitStageCamera,
  layoutRigs,
  mergeShadows,
  mergeStill,
  resetPoses,
  restPose,
  stageFov,
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

const stageAspects = [16 / 9, 4 / 3];
const frameMargin = 0.97;

const outOfFrame = (camera: PerspectiveCamera, points: readonly Vector3[]) =>
  points.some((point) => {
    const ndc = point.clone().project(camera);
    return Math.abs(ndc.x) > frameMargin || Math.abs(ndc.y) > frameMargin;
  });

const boxCorners = (matrix: Matrix4) =>
  [-0.5, 0.5].flatMap((x) =>
    [-0.5, 0.5].flatMap((y) =>
      [-0.5, 0.5].map((z) => new Vector3(x, y, z).applyMatrix4(matrix))
    )
  );

const boundsCorners = (box: Box3) =>
  [box.min.x, box.max.x].flatMap((x) =>
    [box.min.y, box.max.y].flatMap((y) =>
      [box.min.z, box.max.z].map((z) => new Vector3(x, y, z))
    )
  );

describe("stage framing", () => {
  test("no prop leaves the frame at any moment of the loop", () => {
    for (const aspect of stageAspects) {
      for (const id of stageIds) {
        const spec = stageSpecs[id];
        const camera = new PerspectiveCamera(stageFov, aspect, 0.1, 100);
        fitStageCamera(camera, spec);
        const still = mergeStill(spec.still);
        still?.computeBoundingBox();
        const stillBox = still?.boundingBox;
        expect(stillBox).toBeDefined();
        if (stillBox) {
          expect({
            clipped: outOfFrame(camera, boundsCorners(stillBox)),
            id,
          }).toEqual({ clipped: false, id });
        }
        const layout = layoutRigs(spec.rigs);
        const poses = spec.rigs.map(restPose);
        for (let time = 0; time < spec.loopSeconds; time += 0.05) {
          resetPoses(poses);
          spec.play(time, poses);
          let clipped = false;
          writeRigs(spec.rigs, poses, layout, {
            color: () => {},
            matrix: (_, matrix) => {
              clipped ||= outOfFrame(camera, boxCorners(matrix));
            },
          });
          expect({ clipped, id, time: Number(time.toFixed(2)) }).toEqual({
            clipped: false,
            id,
            time: Number(time.toFixed(2)),
          });
        }
      }
    }
  });
});
