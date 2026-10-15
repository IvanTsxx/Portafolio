import { describe, expect, test } from "bun:test";

import { renderToStaticMarkup } from "react-dom/server";

import type { Experience } from "@/lib/site/experience";
import { experience } from "@/lib/site/experience";

import { conceptOf } from "./concept";
import { DictionaryIndex } from "./dictionary-index";
import { FileDesk } from "./file-desk";
import { FileStack } from "./file-stack";
import { ledgerOf } from "./ledger";
import { PunchedTape } from "./punched-tape";
import { codeOf, columnCodes, holesOf } from "./tape";
import { TypedResume } from "./typed-resume";
import { stampsOf, typeSchedule } from "./typing";

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

const ledger = ledgerOf(jobs, "2026-10", "GH-02");

const concepts = {
  a: <FileStack entries={ledger.entries} />,
  b: <TypedResume entries={ledger.entries} />,
  c: <PunchedTape ledger={ledger} />,
  d: <DictionaryIndex entries={ledger.entries} />,
};

const visibleText = (markup: string) =>
  markup
    .replaceAll(/<span class="sr-only">[^<]*<\/span>/gu, "")
    .replaceAll(/<[^>]+>/gu, "");

describe.each(Object.entries(concepts))("experience concept %s", (_, view) => {
  const markup = renderToStaticMarkup(<FileDesk>{view}</FileDesk>);

  test("opens one file per job", () => {
    expect(markup.match(/aria-haspopup="dialog"/gu)).toHaveLength(2);
  });

  test("shows only employer facts for Basement", () => {
    expect(markup).toContain("basement studio");
    expect(markup).toContain("Frontend Developer");
    expect(markup).not.toContain("secret");
    expect(markup).not.toContain("Three.js");
    expect(markup).not.toContain("HealthTech");
  });

  test("marks itself as a buildable block", () => {
    expect(markup).toContain("data-build-block");
  });
});

describe("typed résumé", () => {
  test("types every line in order without overlap", () => {
    const starts = typeSchedule(ledger.entries).flatMap((entry) =>
      entry.lines.map((line) => line.at)
    );
    expect(starts).toEqual(starts.toSorted((first, second) => first - second));
    expect(new Set(starts).size).toBe(starts.length);
  });

  test("stamps the current job and its contract type", () => {
    expect(ledger.entries.map(stampsOf)).toEqual([
      ["Current", "Full-time"],
      ["Contract"],
    ]);
  });

  test("keeps the typed text whole for readers", () => {
    const markup = renderToStaticMarkup(
      <FileDesk>
        <TypedResume entries={ledger.entries} />
      </FileDesk>
    );
    expect(markup).toContain(
      '<span class="sr-only">Apr 2026 → now · 7 mo</span>'
    );
    expect(visibleText(markup)).toContain("Current");
  });
});

describe("punched tape", () => {
  test("encodes letters as five-bit codes and spaces as blank columns", () => {
    expect(["A", "z", " ", "4"].map(codeOf)).toEqual([1, 26, 0, 0]);
    expect(columnCodes("AB", 6)).toEqual([1, 2, 0, 0, 1, 2]);
  });

  test("punches one hole per set bit", () => {
    expect(holesOf("C", 1).map((hole) => hole.row)).toEqual([5, 6]);
    expect(holesOf("O", 1).map((hole) => hole.row)).toEqual([2, 4, 5, 6]);
  });

  test("gives each stretch a length proportional to its tenure", () => {
    const [current, oldest] = ledger.entries;
    expect(current && oldest && current.bar.span / oldest.bar.span).toBeCloseTo(
      7 / 6
    );
  });
});

describe("review switch", () => {
  test("reads ?exp= and falls back to the file stack", () => {
    expect(["a", "b", "c", "d", "e", null].map(conceptOf)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "a",
      "a",
    ]);
  });
});

test("the live data feeds one stretch per role", () => {
  const live = ledgerOf(experience, "2026-10", "GH-03");
  const markup = renderToStaticMarkup(
    <FileDesk>
      <PunchedTape ledger={live} />
    </FileDesk>
  );
  expect(markup.match(/aria-haspopup="dialog"/gu)).toHaveLength(4);
});
