import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import type { Experience } from "@/lib/site/experience";
import { experience } from "@/lib/site/experience";

import { conceptOf } from "./concept";
import { DrawerPull } from "./drawer-pull";
import { FileDesk } from "./file-desk";
import { FileStack } from "./file-stack";
import { FolderDrawer } from "./folder-drawer";
import { ledgerOf } from "./ledger";
import {
  deskSlot,
  folderPose,
  letterOrigin,
  pulledAfter,
  pullPose,
  putBack,
  tearOff,
} from "./poses";
import { Talonario } from "./talonario";
import { deckStep } from "./use-deck";
import { WindowEnvelopes } from "./window-envelopes";

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
  g: <FolderDrawer entries={entries} />,
  h: <DrawerPull entries={entries} />,
  i: <Talonario entries={entries} />,
  j: <WindowEnvelopes entries={entries} />,
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

describe.each(["g", "h", "i", "j"] as const)("experience concept %s", (key) => {
  test("keeps every item but one out of the tab order", () => {
    const markup = renderToStaticMarkup(<FileDesk>{concepts[key]}</FileDesk>);
    expect(markup.match(/tabindex="-1"/gu)).toHaveLength(entries.length - 1);
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

describe.each(["h", "i", "j"] as const)("inline concept %s", (key) => {
  const markup = renderToStaticMarkup(<FileDesk>{concepts[key]}</FileDesk>);

  test("files every sheet away until one is pulled", () => {
    expect(markup.match(/inert=""/gu)).toHaveLength(2);
  });

  test("pulls with a control that names what it opens", () => {
    expect(markup).toContain("aria-controls=");
  });
});

describe("drawer pull and envelopes", () => {
  test("pulls one item at a time and files it back on a second press", () => {
    expect(pulledAfter(null, 2)).toBe(2);
    expect(pulledAfter(2, 1)).toBe(1);
    expect(pulledAfter(1, 1)).toBeNull();
    expect([0, 1, 2].map((index) => pullPose(index, 1))).toEqual([
      "resting",
      "pulled",
      "resting",
    ]);
  });

  test("grows each letter from its own envelope column", () => {
    expect(letterOrigin(0)).toEqual({
      "--from-narrow": "25%",
      "--from-wide": "12.5%",
    });
    expect(letterOrigin(3)).toEqual({
      "--from-narrow": "75%",
      "--from-wide": "87.5%",
    });
  });
});

describe("talonario", () => {
  test("stacks torn tickets newest on top and lifts a re-torn one", () => {
    const torn = tearOff(tearOff(tearOff([], 0), 2), 0);
    expect(torn).toEqual([2, 0]);
    expect(Number(deskSlot(0, torn).zIndex)).toBeGreaterThan(
      Number(deskSlot(2, torn).zIndex)
    );
  });

  test("leaves bound tickets off the desk and puts one back", () => {
    expect(deskSlot(1, [2, 0])).toEqual({ zIndex: 0 });
    expect(putBack([2, 0, 1], 0)).toEqual([2, 1]);
  });
});

describe("review switch", () => {
  test("reads ?exp= and falls back to the file stack", () => {
    expect(
      ["a", "g", "h", "i", "j", "b", "e", "f", null].map(conceptOf)
    ).toEqual(["a", "g", "h", "i", "j", "a", "a", "a", "a"]);
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
