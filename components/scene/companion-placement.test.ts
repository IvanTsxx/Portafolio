import { describe, expect, test } from "bun:test";

import type { ColumnBounds, Viewport } from "./companion-placement";
import {
  companionDock,
  dockGoal,
  ownVisibleShare,
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
