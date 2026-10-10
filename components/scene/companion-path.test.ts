import { describe, expect, test } from "bun:test";

import type { TravelState } from "./companion-path";
import {
  anchorFor,
  companionFrame,
  hopOffset,
  ownVisibleShare,
  pickWaypoint,
  stepTravel,
} from "./companion-path";

const desktop = { height: 900, width: 1440 };
const phone = { height: 844, width: 390 };

const section = (top: number, bottom: number) => ({
  bottom,
  left: 0,
  right: desktop.width,
  top,
});

describe("pickWaypoint", () => {
  test("picks the waypoint covering most of the viewport", () => {
    const picked = pickWaypoint(
      [
        { key: "hero", rect: section(-700, 200) },
        { key: "work", rect: section(200, 1400) },
      ],
      desktop,
      null
    );
    expect(picked).toBe("work");
  });

  test("keeps the current waypoint until another clearly wins", () => {
    const candidates = [
      { key: "hero", rect: section(-500, 420) },
      { key: "work", rect: section(420, 1600) },
    ];
    expect(pickWaypoint(candidates, desktop, "hero")).toBe("hero");
    expect(pickWaypoint(candidates, desktop, null)).toBe("work");
  });

  test("holds the last waypoint when none is on screen", () => {
    const picked = pickWaypoint(
      [{ key: "footer", rect: section(2000, 2600) }],
      desktop,
      "work"
    );
    expect(picked).toBe("work");
  });
});

describe("anchorFor", () => {
  const frame = companionFrame(desktop);

  test("stands on the section's bottom edge at the requested side", () => {
    const right = anchorFor(section(100, 600), "right", desktop, frame);
    const left = anchorFor(section(100, 600), "left", desktop, frame);
    expect(right.y).toBe(588);
    expect(right.x).toBe(desktop.width - 12 - frame.agentWidth / 2);
    expect(left.x).toBe(12 + frame.agentWidth / 2);
  });

  test("rides the viewport bottom while a tall section fills the screen", () => {
    const anchor = anchorFor(section(-400, 3000), "right", desktop, frame);
    expect(anchor.y).toBe(desktop.height - 12);
  });

  test("never climbs under the header", () => {
    const anchor = anchorFor(section(-900, 20), "left", desktop, frame);
    expect(anchor.y).toBeGreaterThanOrEqual(56 + frame.agentHeight);
  });

  test("sits in the bottom right corner on phones whatever the side", () => {
    const compact = companionFrame(phone);
    const rect = { bottom: 500, left: 0, right: 390, top: 0 };
    expect(compact.isCompact).toBe(true);
    expect(anchorFor(rect, "left", phone, compact)).toEqual(
      anchorFor(rect, "right", phone, compact)
    );
    expect(anchorFor(rect, "left", phone, compact).y).toBe(phone.height - 12);
  });
});

const start = (): TravelState => ({
  hopPhase: 0,
  isTraveling: false,
  x: 100,
  y: 800,
});

describe("stepTravel", () => {
  test("walks to a far target over several frames instead of teleporting", () => {
    const state = start();
    const target = { x: 1300, y: 300 };
    stepTravel(state, target, 1 / 60, 1);
    expect(state.isTraveling).toBe(true);
    expect(state.x).toBeLessThan(200);
    let frames = 1;
    let peakHop = 0;
    while (state.isTraveling && frames < 600) {
      stepTravel(state, target, 1 / 60, 1);
      peakHop = Math.max(peakHop, hopOffset(state));
      frames += 1;
    }
    expect(frames).toBeGreaterThan(20);
    expect(frames).toBeLessThan(120);
    expect(peakHop).toBeGreaterThan(0.9);
    expect(state).toEqual({ hopPhase: 0, isTraveling: false, x: 1300, y: 300 });
  });

  test("glides without hopping for small target drift", () => {
    const state = start();
    stepTravel(state, { x: 110, y: 790 }, 1 / 60, 1);
    expect(state.isTraveling).toBe(false);
    expect(hopOffset(state)).toBe(0);
    expect(state.x).toBeGreaterThan(100);
  });
});

describe("ownVisibleShare", () => {
  test("measures how much of a scene is on screen", () => {
    expect(
      ownVisibleShare({ bottom: 700, left: 0, right: 400, top: 100 }, desktop)
    ).toBe(1);
    expect(
      ownVisibleShare({ bottom: 1200, left: 0, right: 400, top: 600 }, desktop)
    ).toBe(0.5);
  });
});
