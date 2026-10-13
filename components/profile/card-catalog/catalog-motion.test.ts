import { describe, expect, test } from "bun:test";

import type { CardRoute } from "./catalog-geometry";
import {
  HOLD_SECONDS,
  poseAt,
  SEATED_AT,
  startRead,
  stepRead,
} from "./catalog-motion";

const route: CardRoute = {
  carry: 40,
  clearsFrom: 56,
  drop: -2,
  hover: 24,
  shift: 30,
  slide: 92,
};

const run = (read: ReturnType<typeof startRead>, seconds: number) => {
  const events: string[] = [];
  for (let time = 0; time < seconds; time += 1 / 60) {
    const event = stepRead(read, 1 / 60, false);
    if (event) {
      events.push(event);
    }
  }
  return events;
};

describe("card read route", () => {
  test("starts where the hovered card is lifted and ends seated in the slot", () => {
    expect(poseAt(route, 0, 1)).toEqual([0, 0, 24]);
    expect(poseAt(route, SEATED_AT, 1)).toEqual([30, 92, -2]);
  });

  test("clears the tray wall before sliding and slides before shifting", () => {
    const [, slideAtRise, liftAtRise] = poseAt(route, 1, 0);
    expect(slideAtRise).toBe(0);
    expect(liftAtRise).toBe(40);
    const [shiftAtSlide, slideDone, liftAtSlide] = poseAt(route, 2, 0);
    expect(shiftAtSlide).toBe(0);
    expect(slideDone).toBe(92);
    expect(liftAtSlide).toBe(40);
  });

  test("seats once, holds, then returns home", () => {
    const read = startRead(2);
    const going = run(read, 0.9);
    expect(going).toEqual(["seated"]);
    expect(read.phase).toBe("seated");
    const back = run(read, HOLD_SECONDS + 1);
    expect(back).toEqual(["done"]);
    expect(read.u).toBe(0);
  });

  test("jumps straight to the slot under reduced motion", () => {
    const read = startRead(0);
    expect(stepRead(read, 1 / 60, true)).toBe("seated");
    expect(read.u).toBe(SEATED_AT);
  });
});
