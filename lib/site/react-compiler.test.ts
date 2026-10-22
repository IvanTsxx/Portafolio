import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import nextConfig from "@/next.config";

const compiledDirectories = ["app", "components", "hooks", "lib"];

const sourceFilePattern = /\.(?:ts|tsx)$/u;

const manualMemoPattern = /\b(?:useMemo|useCallback|memo)\s*[(<]/u;

const sourceFiles = compiledDirectories.flatMap((directory) =>
  readdirSync(path.join(process.cwd(), directory), { recursive: true })
    .map(String)
    .filter(
      (file) => sourceFilePattern.test(file) && !file.endsWith(".test.ts")
    )
    .map((file) => path.join(directory, file))
);

describe("react compiler", () => {
  test("is on", () => {
    expect(nextConfig.reactCompiler).toBe(true);
  });

  test("site code leaves memoization to the compiler", () => {
    expect(
      sourceFiles.filter((file) =>
        manualMemoPattern.test(
          readFileSync(path.join(process.cwd(), file), "utf-8")
        )
      )
    ).toEqual([]);
  });
});
