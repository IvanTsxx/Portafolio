import { describe, expect, test } from "bun:test";

import { siteConfig } from "./config";
import { experience } from "./experience";
import { sectionScripts } from "./section-scripts";

const allLines = Object.values(sectionScripts).flatMap(
  (script) => script.lines
);

describe("section scripts", () => {
  test("the companion says at most two short lines per section", () => {
    for (const script of Object.values(sectionScripts)) {
      expect(script.lines.length).toBeLessThanOrEqual(2);
    }
    for (const line of allLines) {
      expect(line.length).toBeLessThanOrEqual(48);
      expect(line.endsWith(".")).toBe(true);
    }
  });

  test("lines narrate instead of repeating what the page prints", () => {
    const printed = [
      siteConfig.location,
      siteConfig.email,
      ...experience.map((job) => job.company),
      ...experience.flatMap((job) => job.stack),
    ];
    for (const line of allLines) {
      for (const fact of printed) {
        expect(line).not.toContain(fact);
      }
    }
  });

  test("the experience line counts the roles from the site data", () => {
    expect(sectionScripts.homeExperience.lines).toEqual([
      "Laying out four roles since 2023.",
    ]);
    expect(experience).toHaveLength(4);
  });
});
