import { describe, expect, test } from "bun:test";

import { parseCommitLog } from "./revision";

describe("commit log", () => {
  test("reads hash and subject per line and drops empty or private lines", () => {
    expect(
      parseCommitLog(
        "58bbfad\tRemove six notes\n\nabc1234\tShip the Basement case\n9117a11\tAdd shared-canvas skill"
      )
    ).toEqual([
      { hash: "58bbfad", subject: "Remove six notes" },
      { hash: "9117a11", subject: "Add shared-canvas skill" },
    ]);
  });

  test("an unreadable log is empty", () => {
    expect(parseCommitLog()).toEqual([]);
    expect(parseCommitLog("")).toEqual([]);
  });
});
