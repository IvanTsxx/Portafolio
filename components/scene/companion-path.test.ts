import { describe, expect, test } from "bun:test";

import type { TravelState } from "./companion-path";
import {
  anchorFor,
  companionFrame,
  hopOffset,
  ownVisibleShare,
  perchCandidates,
  perchPoint,
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

describe("perchCandidates", () => {
  const frame = companionFrame(desktop);
  const narrow = { bottom: 800, left: 300, right: 900, top: 100 };

  test("never offers the spot the companion stands on", () => {
    const current = { shift: 0, side: "right" } as const;
    const from = perchPoint(narrow, current, desktop, frame);
    const options = perchCandidates(narrow, current, from, desktop, frame);
    expect(options.length).toBeGreaterThan(0);
    for (const option of options) {
      const point = perchPoint(narrow, option, desktop, frame);
      expect(Math.abs(point.x - from.x)).toBeGreaterThanOrEqual(
        frame.agentWidth * 0.8
      );
    }
    expect(options).toContainEqual({ shift: 0, side: "left" });
  });

  test("keeps every option inside the viewport", () => {
    const current = { shift: 0, side: "right" } as const;
    const wide = section(100, 800);
    const from = perchPoint(wide, current, desktop, frame);
    for (const option of perchCandidates(wide, current, from, desktop, frame)) {
      const point = perchPoint(wide, option, desktop, frame);
      expect(point.x - frame.agentWidth / 2).toBeGreaterThanOrEqual(0);
      expect(point.x + frame.agentWidth / 2).toBeLessThanOrEqual(desktop.width);
    }
  });

  test("stays on the waypoint's own stretch of rule", () => {
    const current = { shift: 0, side: "right" } as const;
    const from = perchPoint(narrow, current, desktop, frame);
    for (const option of perchCandidates(
      narrow,
      current,
      from,
      desktop,
      frame
    )) {
      const point = perchPoint(narrow, option, desktop, frame);
      expect(point.x - frame.agentWidth / 2).toBeGreaterThanOrEqual(
        narrow.left
      );
      expect(point.x + frame.agentWidth / 2).toBeLessThanOrEqual(narrow.right);
    }
  });

  test("skips the far side of a page-wide waypoint", () => {
    const current = { shift: 0, side: "right" } as const;
    const wide = section(100, 800);
    const from = perchPoint(wide, current, desktop, frame);
    const options = perchCandidates(wide, current, from, desktop, frame);
    expect(options).not.toContainEqual({ shift: 0, side: "left" });
  });

  test("hops along the bottom edge on phones", () => {
    const compact = companionFrame(phone);
    const current = { shift: 0, side: "right" } as const;
    const rect = { bottom: 2000, left: 0, right: phone.width, top: -400 };
    const from = perchPoint(rect, current, phone, compact);
    const options = perchCandidates(rect, current, from, phone, compact);
    expect(options.length).toBeGreaterThan(0);
    for (const option of options) {
      const point = perchPoint(rect, option, phone, compact);
      expect(point.y).toBe(from.y);
      expect(point.x).toBeLessThan(from.x);
    }
  });
});
