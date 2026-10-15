import { describe, expect, test } from "bun:test";

import { rackPoseOf } from "./rack-pose";

const posesOf = (count: number, active: number, open: number | null) =>
  Array.from({ length: count }, (_, index) => rackPoseOf(index, active, open));

const slidOut = (poses: readonly string[]) =>
  poses.filter((pose) => pose === "out" || pose === "peeking");

describe("rack pose", () => {
  test("hovering another tape while one is open only nudges it", () => {
    expect(posesOf(4, 1, 2)).toEqual(["rest", "nudged", "out", "rest"]);
  });

  test("keeps exactly one tape out for every hover while a tape is open", () => {
    for (let active = 0; active < 5; active += 1) {
      expect(slidOut(posesOf(5, active, 3))).toEqual(["out"]);
    }
  });

  test("hovering the open tape keeps it out", () => {
    expect(posesOf(3, 2, 2)).toEqual(["rest", "rest", "out"]);
  });

  test("with nothing open the hovered tape peeks out alone", () => {
    expect(posesOf(3, 0, null)).toEqual(["peeking", "rest", "rest"]);
  });
});
