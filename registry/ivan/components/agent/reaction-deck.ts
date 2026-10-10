import type { AgentReaction } from "./types";
import { agentReactions } from "./types";

import type { HopPlan } from "./actions";

const swapAt = (deck: AgentReaction[], from: number, to: number) => {
  const held = deck[from];
  const other = deck[to];
  if (held === undefined || other === undefined) {
    return;
  }
  deck[from] = other;
  deck[to] = held;
};

const shuffled = (random: () => number) => {
  const deck = [...agentReactions];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    swapAt(deck, index, Math.floor(random() * (index + 1)));
  }
  return deck;
};

export const createReactionDeck = (random: () => number = Math.random) => {
  let deck: AgentReaction[] = [];
  let last: AgentReaction | null = null;
  return (): AgentReaction => {
    if (deck.length === 0) {
      deck = shuffled(random);
      if (deck.at(-1) === last) {
        swapAt(deck, 0, deck.length - 1);
      }
    }
    const next = deck.pop() ?? agentReactions[0];
    last = next;
    return next;
  };
};

export const createHopPlanner = (random: () => number = Math.random) => {
  let side = random() < 0.5 ? -1 : 1;
  return (): HopPlan => {
    side = -side;
    const reach = 0.32 + random() * 0.18;
    return {
      reachX: side * reach,
      reachZ: (random() - 0.5) * 0.24,
      turn: side * 0.85,
    };
  };
};
