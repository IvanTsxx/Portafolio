import { describe, expect, test } from "bun:test";

import { companionCastFor, showcasesTheRig } from "./companion-roles";

describe("companion cast per route", () => {
  test("each top-level section dresses the companion in one role", () => {
    expect(companionCastFor("/")).toEqual({
      action: "wave",
      role: "orchestrator",
    });
    expect(companionCastFor("/notes").role).toBe("researcher");
    expect(companionCastFor("/experiments").role).toBe("builder");
    expect(companionCastFor("/registry").role).toBe("inspector");
    expect(companionCastFor("/design-system").role).toBe("architect");
  });

  test("detail pages keep the role of their section", () => {
    expect(companionCastFor("/notes/some-note")).toEqual(
      companionCastFor("/notes")
    );
    expect(companionCastFor("/experiments/an-experiment/")).toEqual(
      companionCastFor("/experiments")
    );
  });

  test("unknown routes and lookalike prefixes fall back to the home cast", () => {
    expect(companionCastFor("/notebook")).toEqual(companionCastFor("/"));
    expect(companionCastFor("/unknown/page")).toEqual(companionCastFor("/"));
  });

  test("pages that show the rig itself keep the companion off, so one agent is ever on screen", () => {
    expect(showcasesTheRig("/registry/agent")).toBe(true);
    expect(showcasesTheRig("/registry/agent-stage/")).toBe(true);
    expect(showcasesTheRig("/registry")).toBe(false);
    expect(showcasesTheRig("/registry/magnetic-button")).toBe(false);
    expect(showcasesTheRig("/experiments/dot-grid")).toBe(false);
    expect(showcasesTheRig("/")).toBe(false);
  });
});
