import { describe, expect, test } from "bun:test";

import { companionCastFor } from "./companion-roles";

describe("companion cast per route", () => {
  test("each top-level section dresses the companion in one role", () => {
    expect(companionCastFor("/")).toEqual({
      action: "wave",
      role: "orchestrator",
    });
    expect(companionCastFor("/notes").role).toBe("researcher");
    expect(companionCastFor("/lab").role).toBe("builder");
    expect(companionCastFor("/registry").role).toBe("inspector");
    expect(companionCastFor("/design-system").role).toBe("architect");
  });

  test("detail pages keep the role of their section", () => {
    expect(companionCastFor("/notes/some-note")).toEqual(
      companionCastFor("/notes")
    );
    expect(companionCastFor("/lab/an-experiment/")).toEqual(
      companionCastFor("/lab")
    );
  });

  test("unknown routes and lookalike prefixes fall back to the home cast", () => {
    expect(companionCastFor("/notebook")).toEqual(companionCastFor("/"));
    expect(companionCastFor("/dev/agents")).toEqual(companionCastFor("/"));
  });
});
