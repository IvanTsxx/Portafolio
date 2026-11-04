import { z } from "zod";

export const reactionKindIds = [
  "upvote",
  "love",
  "fire",
  "mind-blown",
  "learned",
  "clap",
] as const;

export type ReactionKind = (typeof reactionKindIds)[number];

export const reactionLabels = {
  clap: "Applause",
  fire: "Fire",
  learned: "Learned something",
  love: "Love it",
  "mind-blown": "Mind blown",
  upvote: "Upvote",
} as const satisfies Record<ReactionKind, string>;

export const reactionKindSchema = z.enum(reactionKindIds);

export type ReactionCounts = Record<ReactionKind, number>;

export const reactionSnapshotSchema = z.object({
  counts: z.record(reactionKindSchema, z.number().int().nonnegative()),
  mine: z.array(reactionKindSchema),
});

export type ReactionSnapshot = z.infer<typeof reactionSnapshotSchema>;

export const reactionTotalsSchema = z.record(
  z.string(),
  z.number().int().nonnegative()
);

export const emptyCounts = (): ReactionCounts => ({
  clap: 0,
  fire: 0,
  learned: 0,
  love: 0,
  "mind-blown": 0,
  upvote: 0,
});

export const toggleRequestSchema = z.strictObject({
  active: z.boolean(),
  kind: reactionKindSchema,
});

export const visitorIdSchema = z.uuid();
