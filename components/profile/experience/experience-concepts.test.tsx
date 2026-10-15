import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import type { Experience } from "@/lib/site/experience";
import { experience } from "@/lib/site/experience";

import { conceptOf } from "./concept";
import { FannedCards } from "./fanned-cards";
import { FileDesk } from "./file-desk";
import { FileStack } from "./file-stack";
import { FolderDrawer } from "./folder-drawer";
import { ledgerOf } from "./ledger";
import { fanSlot, folderPose, sheetPose } from "./poses";
import { RingBinder } from "./ring-binder";
import { deckStep } from "./use-deck";

const jobs: Experience[] = [
  {
    company: "basement studio",
    end: null,
    id: "basement-studio",
    logo: "/logos/basement.webp",
    role: "Frontend Developer",
    stack: ["Three.js"],
    start: "2026-04",
    summary: "Built the client site for a secret launch.",
    type: "Full-time",
    website: "https://basement.studio",
  },
  {
    company: "Doctor Qali",
    end: "2023-06",
    id: "doctor-qali",
    logo: "/logos/doctor-qali.webp",
    role: "Frontend Developer",
    stack: ["React"],
    start: "2023-01",
    summary: "HealthTech performance.",
    type: "Contract",
    website: null,
  },
];

const { entries } = ledgerOf(jobs, "2026-10", "GH-02");

const concepts = {
  a: <FileStack entries={entries} />,
  e: <RingBinder entries={entries} />,
  f: <FannedCards entries={entries} />,
  g: <FolderDrawer entries={entries} />,
};

describe.each(Object.entries(concepts))("experience concept %s", (_, view) => {
  const markup = renderToStaticMarkup(<FileDesk>{view}</FileDesk>);

  test("opens one file per job", () => {
    expect(markup.match(/aria-haspopup="dialog"/gu)).toHaveLength(2);
  });

  test("shows only employer facts for Basement", () => {
    expect(markup).toContain("basement studio");
    expect(markup).toContain("Frontend Developer");
    expect(markup).toContain("Apr 2026");
    expect(markup).toContain("Full-time");
    expect(markup).not.toContain("secret");
    expect(markup).not.toContain("Three.js");
    expect(markup).not.toContain("HealthTech");
  });

  test("marks itself as a buildable block", () => {
    expect(markup).toContain("data-build-block");
  });
});

describe.each(["e", "f", "g"] as const)("experience concept %s", (key) => {
  test("lets exactly one item take keyboard focus", () => {
    const markup = renderToStaticMarkup(<FileDesk>{concepts[key]}</FileDesk>);
    expect(markup.match(/tabindex="0"/gu)).toHaveLength(1);
  });
});

describe("deck keys", () => {
  test("steps with the arrow keys and wraps at both ends", () => {
    expect(deckStep(0, "ArrowRight", 4)).toBe(1);
    expect(deckStep(0, "ArrowUp", 4)).toBe(3);
    expect(deckStep(3, "ArrowDown", 4)).toBe(0);
    expect(deckStep(1, "Enter", 4)).toBeNull();
  });
});

describe("ring binder", () => {
  test("turns earlier sheets flat against the rings and above the open sheet", () => {
    const turned = sheetPose(-1, false);
    const open = sheetPose(0, false);
    expect(turned.transform).toContain("scaleX(0)");
    expect(Number(turned.zIndex)).toBeGreaterThan(Number(open.zIndex));
  });

  test("fades instead of turning when motion is reduced", () => {
    expect(sheetPose(-1, true)).toEqual({ opacity: 0, zIndex: 29 });
  });
});

describe("fanned cards", () => {
  test("centres the fan and keeps the focused card on top", () => {
    const slots = [0, 1, 2, 3].map((index) => fanSlot(index, 1, 4));
    expect(slots.map((slot) => slot["--slot"])).toEqual([-1.5, -0.5, 0.5, 1.5]);
    const layers = slots.map((slot) => Number(slot.zIndex));
    expect(Math.max(...layers)).toBe(layers[1] ?? Number.NaN);
  });
});

describe("folder drawer", () => {
  test("parts the folders in front of the pulled one and leaves the rest", () => {
    expect([0, 1, 2, 3].map((index) => folderPose(index, 2))).toEqual([
      "parted",
      "parted",
      "lifted",
      "resting",
    ]);
  });
});

describe("review switch", () => {
  test("reads ?exp= and falls back to the file stack", () => {
    expect(["a", "e", "f", "g", "b", "c", "d", null].map(conceptOf)).toEqual([
      "a",
      "e",
      "f",
      "g",
      "a",
      "a",
      "a",
      "a",
    ]);
  });
});

test("the live data files one folder per role", () => {
  const live = ledgerOf(experience, "2026-10", "GH-03");
  const markup = renderToStaticMarkup(
    <FileDesk>
      <FolderDrawer entries={live.entries} />
    </FileDesk>
  );
  expect(markup.match(/aria-haspopup="dialog"/gu)).toHaveLength(4);
});
