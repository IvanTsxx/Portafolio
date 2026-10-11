import { describe, expect, test } from "bun:test";

import {
  outfitPieceIds,
  outfitSlots,
  rolePresets,
} from "@/components/agents/outfit";

import { agentRoles } from "./roles";
import type { WorkshopState } from "./workshop";
import {
  defaultWorkshopState,
  matchingPreset,
  parseWorkshopParams,
  presetState,
  randomOutfit,
  withPiece,
  writeWorkshopParams,
} from "./workshop";

const roundTrip = (state: WorkshopState) =>
  parseWorkshopParams(writeWorkshopParams(new URLSearchParams(), state));

describe("workshop params", () => {
  test("restore a custom outfit and action from the URL they wrote", () => {
    const custom: WorkshopState = {
      action: "celebrate",
      outfit: {
        face: "pixel-shades",
        head: "mortarboard",
        held: "pointer",
        offhand: "clipboard",
        torso: "knit-sweater",
      },
      role: "debugger",
    };
    expect(roundTrip(custom)).toEqual(custom);
  });

  test("write only the role while the outfit and action match its preset", () => {
    for (const role of agentRoles) {
      const params = writeWorkshopParams(
        new URLSearchParams(),
        presetState(role)
      );
      const expected =
        role === defaultWorkshopState.role ? "" : `agent=${role}`;
      expect(params.toString()).toBe(expected);
    }
  });

  test("keep params that belong to other features", () => {
    const params = writeWorkshopParams(
      new URLSearchParams("tab=notes&head=goggles"),
      defaultWorkshopState
    );
    expect(params.get("tab")).toBe("notes");
    expect(params.has("head")).toBe(false);
  });

  test("fall back to the preset for unknown values", () => {
    const state = parseWorkshopParams(
      new URLSearchParams("agent=wizard&head=crown&action=fly&held=book")
    );
    expect(state).toEqual({
      ...defaultWorkshopState,
      outfit: { ...defaultWorkshopState.outfit, held: "book" },
    });
  });
});

describe("workshop outfits", () => {
  test("recognise every role preset and nothing for a mix", () => {
    for (const role of agentRoles) {
      expect(matchingPreset(rolePresets[role])).toBe(role);
    }
    expect(
      matchingPreset({ ...rolePresets.builder, head: "deerstalker" })
    ).toBeNull();
  });

  test("random outfits only use registered pieces and change the outfit", () => {
    let seed = 0.13;
    const random = () => {
      seed = (seed * 9301 + 0.49297) % 1;
      return seed;
    };
    let { outfit } = defaultWorkshopState;
    for (let roll = 0; roll < 50; roll += 1) {
      const next = randomOutfit(outfit, random);
      expect(next).not.toEqual(outfit);
      for (const slot of outfitSlots) {
        const registered: readonly string[] = outfitPieceIds[slot];
        expect(registered).toContain(next[slot]);
      }
      outfit = next;
    }
  });
});

describe("workshop hands", () => {
  const builder = presetState("builder").outfit;

  test("a two-handed piece frees the offhand", () => {
    const inspector = presetState("inspector").outfit;
    expect(withPiece(inspector, "held", "laptop")).toMatchObject({
      held: "laptop",
      offhand: "none",
    });
  });

  test("picking an offhand piece drops a two-handed piece", () => {
    expect(withPiece(builder, "offhand", "clipboard")).toMatchObject({
      held: "none",
      offhand: "clipboard",
    });
  });

  test("one-handed pieces keep the offhand", () => {
    const architect = presetState("architect").outfit;
    expect(withPiece(architect, "held", "pointer")).toMatchObject({
      held: "pointer",
      offhand: "blueprint-roll",
    });
  });

  test("urls and random outfits never hold two things with busy hands", () => {
    const parsed = parseWorkshopParams(
      new URLSearchParams("agent=builder&offhand=tablet")
    );
    expect(parsed.outfit.offhand).toBe("none");
    for (let seed = 0; seed < 200; seed += 1) {
      let value = seed / 200;
      const outfit = randomOutfit(builder, () => {
        value = (value * 9301 + 0.4927) % 1;
        return value;
      });
      const busy = outfit.held === "laptop" || outfit.held === "book";
      expect(busy && outfit.offhand !== "none").toBe(false);
    }
  });
});

describe("workshop reset", () => {
  test("the default state writes no params", () => {
    const params = writeWorkshopParams(
      new URLSearchParams("agent=debugger&head=goggles"),
      defaultWorkshopState
    );
    expect(params.size).toBe(0);
  });
});
