import { describe, expect, test } from "bun:test";

import snapshot from "@/lib/github/snapshot.json";

import { proofPosterOf } from "./proof-poster";

const POSTER_BYTE_BUDGET = 10_000;

describe("proof posters", () => {
  test("prints the same poster for the same repository", () => {
    expect(proofPosterOf("IvanTsxx/a", "TypeScript")).toEqual(
      proofPosterOf("IvanTsxx/a", "TypeScript")
    );
  });

  test("prints a different poster per repository and per language", () => {
    const base = proofPosterOf("IvanTsxx/a", "TypeScript");
    expect(proofPosterOf("IvanTsxx/b", "TypeScript").ink).not.toBe(base.ink);
    expect(proofPosterOf("IvanTsxx/a", "Python").ink).not.toBe(base.ink);
  });

  test("keeps every pinned poster inside the byte budget with both plates inked", () => {
    for (const repository of snapshot.pinned) {
      const poster = proofPosterOf(
        repository.nameWithOwner,
        repository.language ?? "Unknown"
      );
      expect(poster.ink.length).toBeGreaterThan(0);
      expect(poster.tint.length).toBeGreaterThan(0);
      expect(poster.ink.length + poster.tint.length).toBeLessThan(
        POSTER_BYTE_BUDGET
      );
    }
  });
});
