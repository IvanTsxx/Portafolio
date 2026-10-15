import { describe, expect, test } from "bun:test";

import type { ColumnBounds, Viewport } from "./companion-placement";
import {
  bubbleMaxWidth,
  bubbleSide,
  companionBodyShare,
  companionDock,
  dockGoal,
  headBubbleSlot,
  sheetShadow,
} from "./companion-placement";

const columnWidth = 800;

const centeredColumn = (width: number): ColumnBounds => {
  const left = Math.max(16, (width - columnWidth) / 2);
  return { left, right: Math.min(width - 16, left + columnWidth) };
};

const viewportOf = (width: number, height = 800): Viewport => ({
  height,
  width,
});

const trackFor = (column: ColumnBounds, offset: number) => ({
  bottom: 852,
  left: column.right + offset,
  top: 96,
});

describe("companion size", () => {
  test("at every width the companion stays between 48 and 56 px tall", () => {
    for (let width = 320; width <= 2560; width += 8) {
      const column = centeredColumn(width);
      const viewport = viewportOf(width);
      for (const dock of [
        companionDock(viewport, column),
        companionDock(viewport, column, trackFor(column, 88)),
      ]) {
        expect(dock.frame.agentHeight).toBeGreaterThanOrEqual(48);
        expect(dock.frame.agentHeight).toBeLessThanOrEqual(56);
        expect(dock.frame.agentWidth).toBeLessThan(dock.frame.agentHeight);
      }
    }
  });
});

describe("companion dock", () => {
  test("in the gutter the companion and its bubble clear the sheet and its backing sheets at any width", () => {
    for (let width = 320; width <= 2560; width += 8) {
      const viewport = viewportOf(width);
      const column = centeredColumn(width);
      const dock = companionDock(viewport, column);
      if (dock.kind !== "gutter") {
        continue;
      }
      expect(dock.x - dock.frame.agentWidth / 2).toBeGreaterThan(
        column.right + sheetShadow
      );
      expect(dock.x + dock.frame.agentWidth / 2).toBeLessThanOrEqual(width);
      if (dock.bubble) {
        expect(dock.bubble.left).toBeGreaterThan(column.right + sheetShadow);
        expect(dock.bubble.left + dock.bubble.maxWidth).toBeLessThanOrEqual(
          width
        );
        expect(dock.bubble.left + dock.bubble.tail).toBe(dock.x);
      }
    }
  });

  test("a wide screen gives the gutter companion its full size and a bubble of its own", () => {
    const wide = companionDock(viewportOf(1440, 900), centeredColumn(1440));
    expect(wide.kind).toBe("gutter");
    if (wide.kind === "gutter") {
      expect(wide.frame.agentHeight).toBe(56);
      expect(wide.bubble?.maxWidth).toBe(bubbleMaxWidth);
    }
  });

  test("on a phone the companion peeks from the bottom right corner with 60 to 70% of its body above the edge", () => {
    for (const [width, height] of [
      [320, 568],
      [375, 667],
      [390, 844],
      [430, 932],
    ] as const) {
      const viewport = viewportOf(width, height);
      const dock = companionDock(viewport, { left: 16, right: width - 16 });
      if (dock.kind !== "corner") {
        throw new Error("expected a corner dock");
      }
      const body = dock.frame.agentHeight * companionBodyShare;
      const top = dock.restY - body;
      const shownShare = (viewport.height - top) / body;
      expect(shownShare).toBeGreaterThanOrEqual(0.6);
      expect(shownShare).toBeLessThanOrEqual(0.7);
      expect(dock.restY).toBeGreaterThan(viewport.height);
      expect(dock.x + dock.frame.agentWidth / 2).toBeLessThanOrEqual(width);
    }
  });

  test("the rest point leaves room under the header for the speech bubble", () => {
    const dock = companionDock(viewportOf(1440, 480), centeredColumn(1440));
    if (dock.kind !== "gutter") {
      throw new Error("expected a gutter dock");
    }
    expect(dock.restY - dock.frame.agentHeight).toBeGreaterThanOrEqual(136);
    expect(dock.restY).toBeLessThanOrEqual(480);
  });
});

describe("dock goal", () => {
  test("in the gutter the companion rests at full scale", () => {
    const dock = companionDock(viewportOf(1440, 900), centeredColumn(1440));
    expect(dockGoal(dock, { isTucked: false }).scale).toBe(1);
  });

  test("in the corner the companion disappears while scrolling", () => {
    const dock = companionDock(viewportOf(390, 844), { left: 16, right: 374 });
    expect(dockGoal(dock, { isTucked: false }).scale).toBe(1);
    expect(dockGoal(dock, { isTucked: true }).scale).toBe(0);
  });
});

describe("rail dock", () => {
  test("on the rail the companion rides between the backing sheets and the rail, never over either", () => {
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
      expect(dock.x - dock.frame.agentWidth / 2).toBeGreaterThan(
        column.right + sheetShadow
      );
      expect(dock.x + dock.frame.agentWidth / 2).toBeLessThan(track.left);
      expect(dock.bubble?.left ?? Number.POSITIVE_INFINITY).toBeGreaterThan(
        column.right + sheetShadow
      );
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
    expect(dockGoal(dock, { isTucked: false, railShare: 0 }).y - half).toBe(96);
    expect(dockGoal(dock, { isTucked: false, railShare: 1 }).y - half).toBe(
      852
    );
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
});

describe("speech bubble", () => {
  test("near the top of the screen the bubble drops below the companion instead of hiding under the header", () => {
    expect(bubbleSide(400)).toBe("above");
    expect(bubbleSide(100)).toBe("below");
  });

  test("away from the dock the bubble follows the head and never leaves the screen", () => {
    for (const x of [0, 40, 400, 1000, 1430]) {
      const slot = headBubbleSlot(viewportOf(1440, 900), x);
      if (!slot) {
        throw new Error("expected a head slot");
      }
      expect(slot.left).toBeGreaterThanOrEqual(12);
      expect(slot.left + slot.maxWidth).toBeLessThanOrEqual(1428);
      expect(slot.left + slot.tail).toBe(x);
    }
    expect(headBubbleSlot(viewportOf(320, 600), 160)?.maxWidth).toBe(224);
  });
});
