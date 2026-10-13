import { describe, expect, test } from "bun:test";

import { LEVER_REST } from "./clock-layout";
import {
  deskOf,
  feed,
  isAirborne,
  leverAngle,
  release,
  stepDesk,
} from "./clock-motion";
import type { Desk } from "./clock-motion";

const HOMES = [-210, -186, -162, -42];
const FRAME = 1 / 60;

const runUntil = (desk: Desk, done: (desk: Desk) => boolean, calm = false) => {
  const seen: string[] = [];
  let frames = 0;
  while (frames < 1200 && !done(desk)) {
    stepDesk(desk, FRAME, calm);
    const phase = desk.flight?.phase ?? "home";
    if (seen.at(-1) !== phase) {
      seen.push(phase);
    }
    frames += 1;
  }
  return { frames, seen };
};

const isHeld = (desk: Desk) => desk.flight?.phase === "held";

describe("time clock desk", () => {
  test("feeds a card up, across, down into the slot and stamps it", () => {
    const desk = deskOf(HOMES);
    feed(desk, 0);
    const { frames, seen } = runUntil(desk, isHeld);
    expect(seen).toEqual(["rise", "travel", "drop", "stamp", "held"]);
    expect(frames).toBeLessThan(200);
  });

  test("pulls the lever only while stamping", () => {
    const desk = deskOf(HOMES);
    feed(desk, 2);
    let pulled = 0;
    runUntil(desk, (state) => {
      if (state.flight?.phase === "stamp") {
        pulled = Math.max(pulled, leverAngle(state.flight));
      } else {
        expect(leverAngle(state.flight)).toBe(LEVER_REST);
      }
      return isHeld(state);
    });
    expect(pulled).toBeGreaterThan(LEVER_REST + 40);
    expect(leverAngle(desk.flight)).toBe(LEVER_REST);
  });

  test("returns the held card before feeding the next one", () => {
    const desk = deskOf(HOMES);
    feed(desk, 0);
    runUntil(desk, isHeld);
    feed(desk, 3);
    const { seen } = runUntil(
      desk,
      (state) => state.flight?.job === 3 && isHeld(state)
    );
    expect(seen).toEqual([
      "lift",
      "back",
      "lower",
      "rise",
      "travel",
      "drop",
      "stamp",
      "held",
    ]);
  });

  test("puts the card back in its pocket on release", () => {
    const desk = deskOf(HOMES);
    feed(desk, 1);
    runUntil(desk, isHeld);
    release(desk);
    runUntil(desk, (state) => state.flight === null);
    expect(desk.flight).toBeNull();
    expect(isAirborne(desk.flight)).toBe(false);
  });

  test("turns back mid-rise without leaving the pocket", () => {
    const desk = deskOf(HOMES);
    feed(desk, 1);
    stepDesk(desk, FRAME, false);
    release(desk);
    const { seen } = runUntil(desk, (state) => state.flight === null);
    expect(seen).toEqual(["lower", "home"]);
  });

  test("jumps straight to the stamped card under reduced motion", () => {
    const desk = deskOf(HOMES);
    feed(desk, 0);
    stepDesk(desk, FRAME, true);
    expect(desk.flight?.phase).toBe("held");
    release(desk);
    stepDesk(desk, FRAME, true);
    expect(desk.flight).toBeNull();
  });
});
