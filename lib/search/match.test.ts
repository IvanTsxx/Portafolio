import { describe, expect, test } from "bun:test";

import { matchQuery, segmentText, tokenizeQuery } from "./match";

const title = (text: string) => ({ fuzzy: true, text, weight: 1 });

describe("matchQuery", () => {
  test("matches everything with no ranges and no score for a blank query", () => {
    expect(matchQuery("   ", [title("Worktrees as lanes")])).toEqual({
      ranges: [[]],
      score: 0,
    });
  });

  test("returns the matched range regardless of case", () => {
    const match = matchQuery("WORKTREE", [title("Worktrees as lanes")]);

    expect(match?.ranges).toEqual([[[0, 8]]]);
  });

  test("returns null when a query has no match", () => {
    expect(matchQuery("zebra", [title("Worktrees as lanes")])).toBeNull();
  });

  test("ranks a word start above a match inside a word", () => {
    const wordStart = matchQuery("lane", [title("Worktrees as lanes")]);
    const insideWord = matchQuery("lane", [title("Airplane")]);

    expect(wordStart?.score).toBeGreaterThan(insideWord?.score ?? 0);
  });

  test("ranks a prefix above a later word start", () => {
    const prefix = matchQuery("agent", [title("Agent workshop")]);
    const later = matchQuery("agent", [title("Workshop agent")]);

    expect(prefix?.score).toBeGreaterThan(later?.score ?? 0);
  });

  test("ranks an exact field above a longer field with the same prefix", () => {
    const exact = matchQuery("lab", [title("Lab")]);
    const longer = matchQuery("lab", [title("Lab experiments")]);

    expect(exact?.score).toBeGreaterThan(longer?.score ?? 0);
  });

  test("weights a title match above the same match in a lower weight field", () => {
    const inTitle = matchQuery("motion", [
      title("Motion systems"),
      { text: "", weight: 0.4 },
    ]);
    const inKeywords = matchQuery("motion", [
      title(""),
      { text: "Motion systems", weight: 0.4 },
    ]);

    expect(inTitle?.score).toBeGreaterThan(inKeywords?.score ?? 0);
  });

  test("requires every word and assigns each to the field it matched best", () => {
    const fields = [title("Worktrees as lanes"), { text: "Note", weight: 0.6 }];

    expect(matchQuery("worktrees note", fields)?.ranges).toEqual([
      [[0, 9]],
      [[0, 4]],
    ]);
    expect(matchQuery("worktrees zebra", fields)).toBeNull();
  });

  test("matches words in any order", () => {
    const match = matchQuery("lanes worktrees", [title("Worktrees as lanes")]);

    expect(match?.ranges).toEqual([
      [
        [0, 9],
        [13, 18],
      ],
    ]);
  });

  test("matches an in-order subsequence and marks only the matched characters", () => {
    const match = matchQuery("wktrs", [title("Worktrees")]);

    expect(match?.ranges).toEqual([
      [
        [0, 1],
        [3, 6],
        [8, 9],
      ],
    ]);
  });

  test("scores a tighter subsequence above a scattered one", () => {
    const tight = matchQuery("wktr", [title("Worktrees")]);
    const scattered = matchQuery("wktr", [title("Work a tree")]);

    expect(tight?.score).toBeGreaterThan(scattered?.score ?? 0);
  });

  test("matches a subsequence only in fields that opt in to fuzzy matching", () => {
    expect(matchQuery("wktrs", [{ text: "Worktrees", weight: 1 }])).toBeNull();
    expect(
      matchQuery("trees", [{ text: "Worktrees", weight: 1 }])
    ).not.toBeNull();
  });

  test("rejects a subsequence spread too thin across the text", () => {
    expect(matchQuery("pcfgr", [title("Product configurator")])).toBeNull();
  });

  test("never treats a query shorter than four characters as a subsequence", () => {
    expect(matchQuery("ws", [title("Worktrees as lanes")])).toBeNull();
    expect(matchQuery("lab", [title("Composable page builder")])).toBeNull();
    expect(matchQuery("as", [title("Worktrees as lanes")])?.ranges).toEqual([
      [[10, 12]],
    ]);
  });

  test("keeps ranges aligned to the original text when lowercasing changes its length", () => {
    const text = "İstanbul";
    const match = matchQuery("stanbul", [title(text)]);

    expect(match?.ranges).toEqual([[[1, 8]]]);
    expect(text.slice(1, 8)).toBe("stanbul");
  });
});

describe("tokenizeQuery", () => {
  test("splits on any whitespace and drops empty tokens", () => {
    expect(tokenizeQuery("  agent \t worktree\n")).toEqual([
      "agent",
      "worktree",
    ]);
    expect(tokenizeQuery("")).toEqual([]);
  });
});

describe("segmentText", () => {
  test("splits text into matched and unmatched runs that rebuild the original", () => {
    const segments = segmentText("Worktrees as lanes", [
      [0, 4],
      [13, 18],
    ]);

    expect(segments).toEqual([
      { matched: true, start: 0, text: "Work" },
      { matched: false, start: 4, text: "trees as " },
      { matched: true, start: 13, text: "lanes" },
    ]);
    expect(segments.map((segment) => segment.text).join("")).toBe(
      "Worktrees as lanes"
    );
  });

  test("merges overlapping and touching ranges", () => {
    expect(
      segmentText("abcdef", [
        [0, 3],
        [2, 4],
        [4, 5],
      ])
    ).toEqual([
      { matched: true, start: 0, text: "abcde" },
      { matched: false, start: 5, text: "f" },
    ]);
  });

  test("clamps ranges to the text and returns one unmatched run without ranges", () => {
    expect(segmentText("abc", [[1, 99]])).toEqual([
      { matched: false, start: 0, text: "a" },
      { matched: true, start: 1, text: "bc" },
    ]);
    expect(segmentText("abc", [])).toEqual([
      { matched: false, start: 0, text: "abc" },
    ]);
  });
});
