import { describe, expect, test } from "bun:test";

import type { ColumnBounds, Viewport } from "./companion-placement";
import {
  bubbleSide,
  castPresence,
  companionDock,
  dockGoal,
  ownVisibleShare,
  shouldYield,
} from "./companion-placement";

const columnWidth = 704;

const centeredColumn = (width: number): ColumnBounds => {
  const left = Math.max(16, (width - columnWidth) / 2);
  return { left, right: Math.min(width - 16, left + columnWidth) };
};

const viewportOf = (width: number, height = 800): Viewport => ({
  height,
  width,
});

describe("companion dock", () => {
  test("in the gutter the companion and its bubble never cross the column at any width", () => {
    for (let width = 320; width <= 2560; width += 8) {
      const viewport = viewportOf(width);
      const column = centeredColumn(width);
      const dock = companionDock(viewport, column);
      if (dock.kind !== "gutter") {
        continue;
      }
      expect(dock.x - dock.frame.agentWidth / 2).toBeGreaterThan(column.right);
      expect(dock.x + dock.frame.agentWidth / 2).toBeLessThanOrEqual(width);
      if (dock.bubble) {
        expect(dock.bubble.left).toBeGreaterThan(column.right);
        expect(dock.bubble.left + dock.bubble.maxWidth).toBeLessThanOrEqual(
          width
        );
        expect(dock.bubble.left + dock.bubble.tail).toBe(dock.x);
      }
    }
  });

  test("the reading-column layouts at 1440 and 1024 have room for a gutter companion with speech", () => {
    const wide = companionDock(viewportOf(1440, 900), centeredColumn(1440));
    const laptop = companionDock(viewportOf(1024, 768), centeredColumn(1024));
    expect(wide.kind).toBe("gutter");
    expect(laptop.kind).toBe("gutter");
    if (wide.kind === "gutter" && laptop.kind === "gutter") {
      expect(wide.frame.agentHeight).toBe(96);
      expect(wide.bubble?.maxWidth).toBe(256);
      expect(laptop.bubble).not.toBeNull();
    }
  });

  test("a phone has no gutter, so the companion docks in the corner mostly below the fold", () => {
    const viewport = viewportOf(390, 844);
    const dock = companionDock(viewport, { left: 16, right: 374 });
    expect(dock.kind).toBe("corner");
    if (dock.kind === "corner") {
      const head = dock.restY - dock.frame.agentHeight;
      expect(head).toBeGreaterThan(viewport.height - dock.frame.agentHeight);
      expect(dock.restY).toBeGreaterThan(viewport.height);
      expect(dock.x + dock.frame.agentWidth / 2).toBeLessThanOrEqual(390);
    }
  });

  test("the rest point leaves room under the header for the speech bubble", () => {
    const dock = companionDock(viewportOf(1440, 480), centeredColumn(1440));
    if (dock.kind !== "gutter") {
      throw new Error("expected a gutter dock");
    }
    expect(dock.restY - dock.frame.agentHeight).toBeGreaterThanOrEqual(152);
    expect(dock.restY).toBeLessThanOrEqual(480);
  });
});

describe("dock goal", () => {
  test("in the gutter the companion steps down and shrinks while a section cast is in view", () => {
    const dock = companionDock(viewportOf(1440, 900), centeredColumn(1440));
    const rest = dockGoal(dock, { isTucked: false, isYielding: false });
    const yielding = dockGoal(dock, { isTucked: false, isYielding: true });
    expect(rest.scale).toBe(1);
    expect(yielding.scale).toBeLessThan(rest.scale);
    expect(yielding.y).toBeGreaterThan(rest.y);
    expect(yielding.x).toBe(rest.x);
  });

  test("in the corner the companion disappears while scrolling or while a cast is in view", () => {
    const dock = companionDock(viewportOf(390, 844), { left: 16, right: 374 });
    expect(dockGoal(dock, { isTucked: false, isYielding: false }).scale).toBe(
      1
    );
    expect(dockGoal(dock, { isTucked: true, isYielding: false }).scale).toBe(0);
    expect(dockGoal(dock, { isTucked: false, isYielding: true }).scale).toBe(0);
  });
});

describe("own visible share", () => {
  test("measures how much of a rect is on screen", () => {
    const viewport = viewportOf(1000, 800);
    expect(
      ownVisibleShare({ bottom: 400, left: 0, right: 100, top: 0 }, viewport)
    ).toBe(1);
    expect(
      ownVisibleShare({ bottom: 1000, left: 0, right: 100, top: 600 }, viewport)
    ).toBe(0.5);
    expect(
      ownVisibleShare({ bottom: 0, left: 0, right: 0, top: 0 }, viewport)
    ).toBe(0);
  });
});

const card = (top: number, height = 400) => ({
  bottom: top + height,
  left: 368,
  right: 1072,
  top,
});

describe("yield to section casts", () => {
  const viewport = viewportOf(1440, 900);
  test("a cast mostly on screen makes the companion yield", () => {
    expect(shouldYield([card(200)], viewport, false)).toBe(true);
  });

  test("a sliver of a cast at the edge does not", () => {
    expect(shouldYield([card(-300)], viewport, false)).toBe(false);
    expect(shouldYield([card(800)], viewport, false)).toBe(false);
  });

  test("a cast taller than the viewport counts once it fills most of the screen", () => {
    expect(shouldYield([card(-400, 2600)], viewport, false)).toBe(true);
    expect(castPresence(card(600, 2600), viewport)).toBeCloseTo(1 / 3, 5);
  });

  test("hysteresis keeps the yield until the cast is well off screen", () => {
    expect(castPresence(card(650), viewport)).toBeCloseTo(0.625, 5);
    expect(shouldYield([card(700)], viewport, false)).toBe(false);
    expect(shouldYield([card(700)], viewport, true)).toBe(true);
    expect(shouldYield([card(760)], viewport, true)).toBe(false);
  });

  test("no casts, no yield", () => {
    expect(shouldYield([], viewport, true)).toBe(false);
  });
});

const trackFor = (column: ColumnBounds, offset: number) => ({
  bottom: 852,
  left: column.right + offset,
  top: 128,
});

describe("rail dock", () => {
  test("on the rail the companion rides in the lane between the column and the rail, never over either", () => {
    for (const [width, offset] of [
      [1024, 88],
      [1280, 120],
      [1440, 120],
      [1920, 120],
    ] as const) {
      const column = centeredColumn(width);
      const track = trackFor(column, offset);
      const dock = companionDock(viewportOf(width, 900), column, track);
      expect(dock.kind).toBe("rail");
      if (dock.kind !== "rail") {
        continue;
      }
      expect(dock.x - dock.frame.agentWidth / 2).toBeGreaterThan(column.right);
      expect(dock.x + dock.frame.agentWidth / 2).toBeLessThan(track.left);
      expect(dock.bubble?.left).toBeGreaterThan(column.right);
    }
  });

  test("the rail position runs from the top of the track to the bottom and centres the companion on it", () => {
    const column = centeredColumn(1440);
    const dock = companionDock(
      viewportOf(1440, 900),
      column,
      trackFor(column, 120)
    );
    if (dock.kind !== "rail") {
      throw new Error("expected a rail dock");
    }
    const half = dock.frame.agentHeight / 2;
    const flags = { isTucked: false, isYielding: false };
    expect(dockGoal(dock, { ...flags, railShare: 0 }).y - half).toBe(128);
    expect(dockGoal(dock, { ...flags, railShare: 1 }).y - half).toBe(852);
  });

  test("a lane too narrow for the smallest companion falls back to the plain gutter dock", () => {
    const column = centeredColumn(1440);
    const dock = companionDock(
      viewportOf(1440, 900),
      column,
      trackFor(column, 40)
    );
    expect(dock.kind).toBe("gutter");
  });

  test("near the top of the screen the speech bubble drops below the companion instead of hiding under the header", () => {
    expect(bubbleSide(400)).toBe("above");
    expect(bubbleSide(100)).toBe("below");
  });
});
