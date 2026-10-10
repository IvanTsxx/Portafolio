import type {
  Outfit,
  OutfitPieceId,
  OutfitSlot,
} from "@/components/agents/outfit";
import {
  isOutfitPiece,
  outfitPieceIds,
  outfitSlots,
  outfitsMatch,
  rolePresets,
} from "@/components/agents/outfit";

import type { AgentAction, AgentRole } from "./roles";
import { agentActions, agentProfiles, agentRoles } from "./roles";

export interface WorkshopState {
  action: AgentAction;
  outfit: Outfit;
  role: AgentRole;
}

export const defaultWorkshopRole = "builder" satisfies AgentRole;

export const presetState = (role: AgentRole): WorkshopState => ({
  action: agentProfiles[role].signatureActions[0],
  outfit: rolePresets[role],
  role,
});

export const defaultWorkshopState = presetState(defaultWorkshopRole);

const roleParam = "agent";
const actionParam = "action";

const isAgentRole = (value: unknown): value is AgentRole =>
  agentRoles.some((role) => role === value);

const isAgentAction = (value: unknown): value is AgentAction =>
  agentActions.some((action) => action === value);

const pieceParam = <Slot extends OutfitSlot>(
  params: URLSearchParams,
  slot: Slot,
  fallback: OutfitPieceId<Slot>
): OutfitPieceId<Slot> => {
  const value = params.get(slot);
  return isOutfitPiece(slot, value) ? value : fallback;
};

export const parseWorkshopParams = (params: URLSearchParams): WorkshopState => {
  const roleValue = params.get(roleParam);
  const role = isAgentRole(roleValue) ? roleValue : defaultWorkshopRole;
  const preset = presetState(role);
  const actionValue = params.get(actionParam);
  return {
    action: isAgentAction(actionValue) ? actionValue : preset.action,
    outfit: {
      face: pieceParam(params, "face", preset.outfit.face),
      head: pieceParam(params, "head", preset.outfit.head),
      held: pieceParam(params, "held", preset.outfit.held),
      offhand: pieceParam(params, "offhand", preset.outfit.offhand),
      torso: pieceParam(params, "torso", preset.outfit.torso),
    },
    role,
  };
};

export const writeWorkshopParams = (
  params: URLSearchParams,
  state: WorkshopState
) => {
  const next = new URLSearchParams(params);
  for (const key of [roleParam, actionParam, ...outfitSlots]) {
    next.delete(key);
  }
  next.set(roleParam, state.role);
  for (const slot of outfitSlots) {
    if (state.outfit[slot] !== rolePresets[state.role][slot]) {
      next.set(slot, state.outfit[slot]);
    }
  }
  if (state.action !== presetState(state.role).action) {
    next.set(actionParam, state.action);
  }
  return next;
};

export const matchingPreset = (outfit: Outfit) =>
  agentRoles.find((role) => outfitsMatch(rolePresets[role], outfit)) ?? null;

const pick = <Value>(values: readonly Value[], random: () => number) =>
  values[Math.floor(random() * values.length)] ?? values[0];

const randomPiece = <Slot extends OutfitSlot>(
  slot: Slot,
  random: () => number
): OutfitPieceId<Slot> =>
  pick<OutfitPieceId<Slot>>(outfitPieceIds[slot], random) ??
  rolePresets[defaultWorkshopRole][slot];

const rollOutfit = (random: () => number): Outfit => ({
  face: randomPiece("face", random),
  head: randomPiece("head", random),
  held: randomPiece("held", random),
  offhand: randomPiece("offhand", random),
  torso: randomPiece("torso", random),
});

const rerollLimit = 8;

export const randomOutfit = (
  current: Outfit,
  random: () => number = Math.random
): Outfit => {
  let outfit = rollOutfit(random);
  for (
    let attempt = 1;
    attempt < rerollLimit && outfitsMatch(outfit, current);
    attempt += 1
  ) {
    outfit = rollOutfit(random);
  }
  return outfit;
};

export const randomAction = (
  current: AgentAction,
  random: () => number = Math.random
): AgentAction => {
  const others = agentActions.filter((action) => action !== current);
  return pick(others, random) ?? current;
};
