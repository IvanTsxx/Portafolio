import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import type { Experience } from "@/lib/site/experience";
import { experience } from "@/lib/site/experience";

import { FileDesk } from "./file-desk";
import { ledgerOf, openingEntryOf } from "./ledger";
import { letterOrigin, pulledAfter, pullPose } from "./poses";
import { deckStep } from "./use-deck";
import { WindowEnvelopes } from "./window-envelopes";

const job = (overrides: Partial<Experience> & Pick<Experience, "id">) => ({
  company: overrides.id,
  end: "2023-06",
  logo: "/logos/doctor-qali.webp",
  role: "Frontend Developer",
  stack: ["React"],
  start: "2023-01",
  summary: "HealthTech performance.",
  type: "Contract" as const,
  website: null,
  ...overrides,
});

const basement = job({
  company: "basement studio",
  end: null,
  id: "basement-studio",
  logo: "/logos/basement.webp",
  stack: ["Three.js"],
  start: "2026-04",
  summary: "Built the client site for a secret launch.",
  type: "Full-time",
  website: "https://basement.studio",
});

const doctorQali = job({ company: "Doctor Qali", id: "doctor-qali" });

const markupOf = (jobs: readonly Experience[]) =>
  renderToStaticMarkup(
    <FileDesk>
      <WindowEnvelopes entries={ledgerOf(jobs, "2026-10", "GH-02").entries} />
    </FileDesk>
  );

const letterTagOf = (markup: string, id: string) =>
  markup.match(
    new RegExp(`<div[^>]*id="envelope-letter-${id}"[^>]*>`, "u")
  )?.[0];

const envelopeTagOf = (markup: string, id: string) =>
  markup.match(
    new RegExp(`<button[^>]*aria-controls="envelope-letter-${id}"[^>]*>`, "u")
  )?.[0];

describe("window envelopes", () => {
  const markup = markupOf([doctorQali, basement]);

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

  test("stamps only the open job as current", () => {
    expect(markup.match(/>Current</gu)).toHaveLength(1);
  });

  test("marks itself as a buildable block", () => {
    expect(markup).toContain("data-build-block");
  });

  test("server renders the current job's letter already out", () => {
    expect(letterTagOf(markup, "basement-studio")).not.toContain("inert");
    expect(letterTagOf(markup, "basement-studio")).toContain(
      'aria-hidden="false"'
    );
    expect(envelopeTagOf(markup, "basement-studio")).toBeUndefined();
    expect(letterTagOf(markup, "doctor-qali")).toContain('inert=""');
    expect(envelopeTagOf(markup, "doctor-qali")).toContain(
      'aria-expanded="false"'
    );
  });

  test("leaves the current job out of the envelopes and puts the first one in the tab order", () => {
    expect(markup.match(/aria-controls="envelope-letter-/gu)).toHaveLength(1);
    expect(envelopeTagOf(markup, "doctor-qali")).toContain('tabindex="0"');
  });

  test("files every letter away when no job is current", () => {
    const past = markupOf([doctorQali, { ...basement, end: "2026-09" }]);
    expect(past.match(/inert=""/gu)).toHaveLength(2);
    expect(past).not.toContain('aria-expanded="true"');
  });
});

describe("opening letter", () => {
  test("is the newest job that has no end date", () => {
    const { entries } = ledgerOf(
      [
        job({ end: null, id: "older-current", start: "2024-02" }),
        doctorQali,
        job({ end: null, id: "newer-current", start: "2025-08" }),
        job({ end: "2026-09", id: "newest-past", start: "2026-01" }),
      ],
      "2026-10",
      "GH-02"
    );
    const opening = openingEntryOf(entries);
    expect(opening === null ? null : entries[opening]?.id).toBe(
      "newer-current"
    );
  });

  test("is Basement on the live data", () => {
    const { entries } = ledgerOf(experience, "2026-10", "GH-02");
    const opening = openingEntryOf(entries);
    expect(opening === null ? null : entries[opening]?.company).toBe(
      "basement studio"
    );
  });

  test("is none when every job has ended", () => {
    expect(openingEntryOf([{ isCurrent: false }])).toBeNull();
  });
});

describe("pulling", () => {
  test("pulls one letter at a time and folds it back on a second press", () => {
    expect(pulledAfter(null, 2)).toBe(2);
    expect(pulledAfter(2, 1)).toBe(1);
    expect(pulledAfter(1, 1)).toBeNull();
    expect([0, 1, 2].map((index) => pullPose(index, 1))).toEqual([
      "resting",
      "pulled",
      "resting",
    ]);
  });

  test("steps with the arrow keys and wraps at both ends", () => {
    expect(deckStep(0, "ArrowRight", 4)).toBe(1);
    expect(deckStep(0, "ArrowUp", 4)).toBe(3);
    expect(deckStep(3, "ArrowDown", 4)).toBe(0);
    expect(deckStep(1, "Enter", 4)).toBeNull();
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
