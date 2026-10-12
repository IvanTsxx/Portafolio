import { describe, expect, test } from "bun:test";

import { siteConfig } from "./config";
import { experience } from "./experience";
import { sectionScripts } from "./section-scripts";

describe("section scripts", () => {
  test("the intro speaks the location and the current job from the site data", () => {
    expect(sectionScripts.homeIntro.lines).toEqual([
      "From Tucumán, Argentina.",
      "Frontend Developer at basement studio since Apr 2026.",
    ]);
    expect(siteConfig.location).toBe("Tucumán, Argentina");
  });

  test("the experience lines count every job and name each past stack", () => {
    const [count, ...stacks] = sectionScripts.homeExperience.lines;
    expect(count).toBe(`${experience.length} roles since 2023.`);
    expect(stacks).toEqual([
      "Aliva Shop: Angular · Ionic · Signals · Capacitor.",
      "Tensolite SA: React · Node.js · Automation.",
      "Doctor Qali: React · Performance · Architecture.",
    ]);
  });

  test("every section that builds plays the build action", () => {
    for (const script of Object.values(sectionScripts)) {
      if (script.reveal === "build") {
        expect(script.action).toBe("build");
      }
    }
  });
});
