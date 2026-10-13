import { describe, expect, test } from "bun:test";

import type { Experience } from "@/lib/site/experience";
import { experience } from "@/lib/site/experience";

import { durationText, ledgerOf, monthStampOf } from "./ledger";

const ledger = ledgerOf(experience, "2026-10", "GH-03");
const entryOf = (company: string) =>
  ledger.entries.find((entry) => entry.company === company);

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

describe("employment ledger", () => {
  test("lists jobs newest first and numbers them in hiring order", () => {
    expect(ledger.entries.map((entry) => entry.company)).toEqual([
      "basement studio",
      "Aliva Shop",
      "Tensolite SA",
      "Doctor Qali",
    ]);
    expect(ledger.entries.map((entry) => entry.ordinal)).toEqual([
      "04",
      "03",
      "02",
      "01",
    ]);
  });

  test("places each bar by its real months on a scale from January of the first year to now", () => {
    const scale = 46;
    expect(ledger.entries.map((entry) => entry.bar)).toEqual([
      { isOpen: true, span: 7 / scale, start: 39 / scale },
      { isOpen: false, span: 11 / scale, start: 29 / scale },
      { isOpen: false, span: 5 / scale, start: 6 / scale },
      { isOpen: false, span: 6 / scale, start: 0 },
    ]);
  });

  test("runs the current job to the right edge of the ruler", () => {
    const [current] = ledger.entries;
    expect(current && current.bar.start + current.bar.span).toBe(1);
    expect(current?.dates).toBe("Apr 2026 → now");
  });

  test("marks every year on the ruler and ends it at now", () => {
    expect(ledger.ruler.map((mark) => mark.label)).toEqual([
      "2023",
      "2024",
      "2025",
      "2026",
      "Now",
    ]);
    expect(ledger.ruler.at(-1)?.at).toBe(1);
    expect(ledger.gridlines).toEqual([0, 12 / 46, 24 / 46, 36 / 46]);
  });

  test("drops a year label that would collide with now", () => {
    const january = ledgerOf(experience, "2027-01", "GH-03");
    expect(january.ruler.map((mark) => mark.label)).toEqual([
      "2023",
      "2024",
      "2025",
      "2026",
      "Now",
    ]);
  });

  test("counts both the first and the last month of a job", () => {
    expect(ledger.entries.map((entry) => entry.length)).toEqual([
      "7 mo",
      "11 mo",
      "5 mo",
      "6 mo",
    ]);
  });

  test("writes lengths in years and months", () => {
    expect(durationText(1)).toBe("1 mo");
    expect(durationText(12)).toBe("1 yr");
    expect(durationText(14)).toBe("1 yr 2 mo");
    expect(durationText(36)).toBe("3 yr");
  });

  test("stamps a date as year and month", () => {
    expect(monthStampOf(new Date(2026, 9, 12))).toBe("2026-10");
    expect(monthStampOf(new Date(2027, 0, 1))).toBe("2027-01");
  });
});

describe("employment file", () => {
  test("files a job with its dates, length, summary, stack and site", () => {
    const tensolite = entryOf("Tensolite SA");
    expect(tensolite?.spoken).toBe(
      "Tensolite SA, Full Stack Developer, Jul 2023 to Nov 2023, 5 months, Full-time"
    );
    expect(tensolite?.detail).toEqual({
      stack: ["React", "Node.js", "Automation"],
      summary:
        "Internal ops tools: Excel import and export, PDF generation, workflow automation.",
    });
    expect(tensolite?.file).toEqual({
      chips: { items: ["React", "Node.js", "Automation"], label: "Stack" },
      code: "GH-03 · File 02/04",
      fields: [
        { label: "Dates", span: "full", value: "Jul 2023 → Nov 2023" },
        { label: "Type", value: "Full-time" },
        { label: "Length", value: "5 mo" },
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
    const [entry] = ledgerOf([leakyEmployer], "2026-10", "GH-03").entries;
    expect(entry?.detail).toBeNull();
    expect(entry?.file).toEqual({
      chips: null,
      code: "GH-03 · File 01/01",
      fields: [
        { label: "Dates", span: "full", value: "Apr 2026 → now" },
        { label: "Type", value: "Full-time" },
        { label: "Length", value: "7 mo so far" },
      ],
      kicker: "Frontend Developer",
      links: [{ href: "https://basement.studio", label: "basement.studio" }],
      note: null,
      title: "basement studio",
    });
    const everything = JSON.stringify(entry);
    expect(everything).not.toContain("secret");
    expect(everything).not.toContain("Three.js");
  });
});
