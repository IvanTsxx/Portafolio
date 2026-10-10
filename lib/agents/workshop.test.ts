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
      expect(params.toString()).toBe(`agent=${role}`);
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
