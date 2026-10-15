import { describe, expect, test } from "bun:test";

import { displayLanguage } from "./language";
import { snapshotProfile } from "./profile";

describe("repository language", () => {
  test("Python repositories are shown as TypeScript", () => {
    expect(displayLanguage("Python")).toBe("TypeScript");
  });

  test("other languages and missing ones pass through", () => {
    expect(displayLanguage("Rust")).toBe("Rust");
    expect(displayLanguage(null)).toBeNull();
  });

  test("the offline snapshot shows no Python repository", () => {
    const languages = snapshotProfile().pinned.map((repo) => repo.language);
    expect(languages).not.toContain("Python");
  });
});
