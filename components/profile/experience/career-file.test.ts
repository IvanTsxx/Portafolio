import { describe, expect, test } from "bun:test";

import type { Experience } from "@/lib/site/experience";
import { experience } from "@/lib/site/experience";

import { careerOf, lineText, tenureFile } from "./career";
import { readingOf } from "./clock-reading";
import { tourOf } from "./use-clock-tour";

const career = careerOf(experience, "2026-10");
const tenureOf = (company: string) =>
  career.tenures.find((tenure) => tenure.company === company);

const leakyEmployer: Experience = {
  company: "basement studio",
  end: null,
  id: "basement-studio",
  logo: "/logos/basement.webp",
  role: "Frontend Developer",
  stack: ["Next.js", "Three.js"],
  start: "2026-04",
  summary: "Built the client site for a secret launch.",
  type: "Full-time",
  website: "https://basement.studio",
};

describe("experience readout", () => {
  test("pairs the role with the job summary under attention", () => {
    const aliva = tenureOf("Aliva Shop");
    const line =
      "Frontend Developer · Led Q-commerce modernization: Angular to standalone + Signals, Ionic + Capacitor for iOS and Android.";
    expect(aliva && lineText(aliva)).toBe(line);
    expect(
      readingOf(
        { job: aliva?.step ?? -1, kind: "peek" },
        career.tenures,
        career.tenures.at(-1)
      )
    ).toEqual({
      href: null,
      key: "line-aliva-shop",
      lead: "Aliva Shop",
      trail: line,
    });
  });

  test("shows the current job at rest and the dates once a card is punched", () => {
    const current = career.tenures.at(-1);
    expect(readingOf({ kind: "idle" }, career.tenures, current)).toEqual({
      href: null,
      key: "idle",
      lead: "basement studio",
      trail: "Since Apr 2026",
    });
    expect(
      readingOf({ job: 0, kind: "held" }, career.tenures, current)
    ).toEqual({
      href: null,
      key: "held-doctor-qali",
      lead: "Doctor Qali",
      trail: "Jan 2023 → Jun 2023 · 6 mo",
    });
  });
});

describe("experience file", () => {
  test("files a job with its dates, length, summary, stack and site", () => {
    const tensolite = tenureOf("Tensolite SA");
    expect(tensolite && tenureFile(tensolite, "GH-03", 4)).toEqual({
      chips: { items: ["React", "Node.js", "Automation"], label: "Stack" },
      code: "GH-03 · File 02/04",
      fields: [
        { label: "Dates", span: "full", value: "Jul 2023 → Nov 2023" },
        { label: "Type", value: "Full-time" },
        { label: "Length", value: "5 months" },
      ],
      kicker: "Full Stack Developer",
      links: [{ href: "https://tensolite.com", label: "tensolite.com" }],
      note: {
        label: "Summary",
        text: "Internal ops tools: Excel import and export, PDF generation, workflow automation.",
      },
      title: "Tensolite SA",
    });
  });

  test("shows Basement only as the employer, even when the data carries more", () => {
    const [tenure] = careerOf([leakyEmployer], "2026-10").tenures;
    expect(tenure?.summary).toBeNull();
    expect(tenure?.stack).toEqual([]);
    expect(tenure && lineText(tenure)).toBe("Frontend Developer");
    const file = tenure && tenureFile(tenure, "GH-03", 1);
    expect(file).toEqual({
      chips: null,
      code: "GH-03 · File 01/01",
      fields: [
        { label: "Dates", span: "full", value: "Apr 2026 → now" },
        { label: "Type", value: "Full-time" },
        { label: "Length", value: "7 months so far" },
      ],
      kicker: "Frontend Developer",
      links: [{ href: "https://basement.studio", label: "basement.studio" }],
      note: null,
      title: "basement studio",
    });
    expect(JSON.stringify(file)).not.toContain("secret");
    expect(JSON.stringify(file)).not.toContain("Three.js");
  });
});

describe("experience tour", () => {
  test("glances at every card, punches the current one, holds it and returns it", () => {
    expect(tourOf(3, 2)).toEqual([
      { job: 0, kind: "peek" },
      { job: 1, kind: "peek" },
      { job: 2, kind: "peek" },
      { job: 2, kind: "punch" },
      { kind: "hold" },
      { kind: "return" },
    ]);
  });
});
