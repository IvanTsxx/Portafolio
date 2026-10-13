import { describe, expect, test } from "bun:test";

import {
  fastScrollSpeed,
  isFastScroll,
  narrate,
  silence,
} from "./companion-narration";
import type { Narration, NarratedSection } from "./companion-narration";
import { railMarkFor } from "./companion-rail";
import {
  activeSectionIndex,
  railLayout,
  sectionLandingOffset,
} from "./companion-rail-math";

const viewportHeight = 900;
const maxScroll = 6000;

const page = [
  { id: "intro", lines: ["Opening the file.", "Second look."], top: 0 },
  { id: "experience", lines: ["Laying out roles."], top: 1000 },
  { id: "pinned", lines: ["Pinning repos."], top: 2000 },
  { id: "matrix", lines: [], top: 3000 },
  { id: "workshop", lines: ["Fitting room.", "Link keeps it."], top: 4000 },
  { id: "contact", lines: ["Last page."], top: 5200 },
] as const;

const notched = page.slice(1);

const stops = page.map(({ top }) => Math.max(0, top - sectionLandingOffset));

const sectionAt = (scrollY: number): NarratedSection<string> | null => {
  const entry = page[activeSectionIndex(scrollY, viewportHeight, stops)];
  return entry ? { key: entry.id, lines: entry.lines } : null;
};

interface Frame {
  isPressed?: boolean;
  scrollY: number;
  velocity?: number;
}

const play = (frames: readonly Frame[]) => {
  let narration: Narration<string> = silence();
  return frames.map(({ isPressed = false, scrollY, velocity = 0 }) => {
    const told = narrate(narration, {
      isFast: isFastScroll(velocity),
      isPressed,
      section: sectionAt(scrollY),
    });
    ({ narration } = told);
    return told.isShown ? told.narration.line : null;
  });
};

const restingOn = (id: (typeof page)[number]["id"]) => {
  const index = page.findIndex((entry) => entry.id === id);
  return (stops[index] ?? 0) + 10;
};

describe("companion narration", () => {
  test("a section's line appears when it becomes active and stays while it is active", () => {
    expect(
      play([
        { scrollY: 0 },
        { scrollY: 200 },
        { scrollY: restingOn("experience") },
        { scrollY: restingOn("experience") + 600 },
      ])
    ).toEqual([
      "Opening the file.",
      "Opening the file.",
      "Laying out roles.",
      "Laying out roles.",
    ]);
  });

  test("the line swaps on the same scroll position where the next section becomes active", () => {
    const handover = (stops[2] ?? 0) - viewportHeight * 0.3;
    expect(
      play([{ scrollY: handover - 20 }, { scrollY: handover + 20 }])
    ).toEqual(["Laying out roles.", "Pinning repos."]);
  });

  test("a fast scroll hides the bubble and skips the sections it passes", () => {
    const lines = play([
      { scrollY: restingOn("experience") },
      { scrollY: restingOn("pinned"), velocity: fastScrollSpeed * 3 },
      { scrollY: restingOn("workshop") - 400, velocity: fastScrollSpeed * 2 },
      { scrollY: restingOn("workshop") },
    ]);
    expect(lines).toEqual(["Laying out roles.", null, null, "Fitting room."]);
    expect(lines).not.toContain("Pinning repos.");
  });

  test("scrolling back up narrates the earlier section again and rotates its lines", () => {
    expect(
      play([
        { scrollY: 0 },
        { scrollY: restingOn("experience") },
        { scrollY: 100, velocity: -fastScrollSpeed * 2 },
        { scrollY: 100 },
        { scrollY: restingOn("workshop"), velocity: fastScrollSpeed * 4 },
        { scrollY: restingOn("workshop") },
        { scrollY: restingOn("pinned") },
      ])
    ).toEqual([
      "Opening the file.",
      "Laying out roles.",
      null,
      "Second look.",
      null,
      "Fitting room.",
      "Pinning repos.",
    ]);
  });

  test("a section without lines silences the previous one", () => {
    expect(
      play([{ scrollY: restingOn("pinned") }, { scrollY: restingOn("matrix") }])
    ).toEqual(["Pinning repos.", null]);
  });

  test("nothing is said before the first section is reached", () => {
    const late = page.map((entry) =>
      Math.max(0, entry.top + 2000 - sectionLandingOffset)
    );
    const section = activeSectionIndex(0, viewportHeight, late);
    expect(section).toBe(-1);
    expect(
      narrate(silence<string>(), {
        isFast: false,
        isPressed: false,
        section: null,
      }).isShown
    ).toBe(false);
  });

  test("tapping the companion moves to the next line of the same section", () => {
    expect(
      play([
        { scrollY: restingOn("workshop") },
        { isPressed: true, scrollY: restingOn("workshop") },
        { scrollY: restingOn("workshop") },
      ])
    ).toEqual(["Fitting room.", "Link keeps it.", "Link keeps it."]);
  });

  test("the companion stands on the active notch's mark and moves in step with it", () => {
    const layout = railLayout({
      landingOffset: sectionLandingOffset,
      maxScroll,
      minGap: 0.05,
      sectionTops: notched.map(({ top }) => top),
    });
    const ids: readonly string[] = notched.map(({ id }) => id);
    const rail = { ids, marks: layout.marks };
    for (let scrollY = 0; scrollY <= maxScroll; scrollY += 50) {
      const active = sectionAt(scrollY)?.key ?? null;
      const notch = activeSectionIndex(scrollY, viewportHeight, layout.stops);
      expect(rail.ids[notch] ?? (active === "intro" ? "intro" : null)).toBe(
        active
      );
      expect(railMarkFor(rail, active)).toBe(
        notch === -1 ? 0 : (layout.marks[notch] ?? -1)
      );
    }
  });
});
