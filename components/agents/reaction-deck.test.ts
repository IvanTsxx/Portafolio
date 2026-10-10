import { describe, expect, test } from "bun:test";

import { agentReactions } from "@/lib/agents/roles";

import { createReactionDeck } from "./reaction-deck";

const seeded = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return state / 2_147_483_648;
  };
};

describe("createReactionDeck", () => {
  test("never deals the same reaction twice in a row", () => {
    for (const seed of [1, 7, 42, 99, 1234]) {
      const deal = createReactionDeck(seeded(seed));
      let previous = deal();
      for (let draw = 0; draw < 400; draw += 1) {
        const current = deal();
        expect(current).not.toBe(previous);
        previous = current;
      }
    }
  });

  test("deals every reaction once per pass", () => {
    const deal = createReactionDeck(seeded(3));
    const pass = new Set(agentReactions.map(() => deal()));
    expect(pass).toEqual(new Set(agentReactions));
  });

  test("still alternates when the random source is constant", () => {
    const deal = createReactionDeck(() => 0);
    const draws = Array.from({ length: 32 }, () => deal());
    for (let index = 1; index < draws.length; index += 1) {
      expect(draws[index]).not.toBe(draws[index - 1]);
    }
  });
});
