import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createFileStore } from "./store";

const freshStore = () =>
  createFileStore(
    path.join(mkdtempSync(path.join(tmpdir(), "reactions-")), "store.json")
  );

describe("file reaction store", () => {
  test("counts each visitor once per reaction", async () => {
    const store = freshStore();
    await store.toggle("ascii", "love", "visitor-a", true);
    await store.toggle("ascii", "love", "visitor-a", true);
    const snapshot = await store.toggle("ascii", "love", "visitor-b", true);
    expect(snapshot.counts.love).toBe(2);
  });

  test("reports which reactions belong to the visitor", async () => {
    const store = freshStore();
    await store.toggle("ascii", "fire", "visitor-a", true);
    await store.toggle("ascii", "upvote", "visitor-b", true);
    const snapshot = await store.read("ascii", "visitor-a");
    expect(snapshot.mine).toEqual(["fire"]);
  });

  test("removes a reaction when toggled off", async () => {
    const store = freshStore();
    await store.toggle("ascii", "clap", "visitor-a", true);
    const snapshot = await store.toggle("ascii", "clap", "visitor-a", false);
    expect(snapshot.counts.clap).toBe(0);
    expect(snapshot.mine).toEqual([]);
  });

  test("keeps counts across store instances on the same file", async () => {
    const filePath = path.join(
      mkdtempSync(path.join(tmpdir(), "reactions-")),
      "store.json"
    );
    await createFileStore(filePath).toggle("ascii", "learned", "v", true);
    const snapshot = await createFileStore(filePath).read("ascii", null);
    expect(snapshot.counts.learned).toBe(1);
  });

  test("serializes concurrent toggles without losing votes", async () => {
    const store = freshStore();
    await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        store.toggle("ascii", "upvote", `visitor-${index}`, true)
      )
    );
    const snapshot = await store.read("ascii", null);
    expect(snapshot.counts.upvote).toBe(20);
  });
});
