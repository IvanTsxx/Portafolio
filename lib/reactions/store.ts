import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Redis } from "@upstash/redis";
import { z } from "zod";

import { emptyCounts, reactionKindIds, reactionKindSchema } from "./kinds";
import type { ReactionKind, ReactionSnapshot } from "./kinds";

export interface ReactionStore {
  totals: (slugs: readonly string[]) => Promise<Record<string, number>>;
  read: (slug: string, visitor: string | null) => Promise<ReactionSnapshot>;
  toggle: (
    slug: string,
    kind: ReactionKind,
    visitor: string,
    active: boolean
  ) => Promise<ReactionSnapshot>;
}

const memberKey = (slug: string, kind: ReactionKind) =>
  `reactions:${slug}:${kind}`;

export const createRedisStore = (redis: Redis): ReactionStore => {
  const read = async (slug: string, visitor: string | null) => {
    const pipeline = redis.pipeline();
    for (const kind of reactionKindIds) {
      pipeline.scard(memberKey(slug, kind));
    }
    if (visitor) {
      for (const kind of reactionKindIds) {
        pipeline.sismember(memberKey(slug, kind), visitor);
      }
    }
    const results = await pipeline.exec<number[]>();
    const counts = emptyCounts();
    const mine: ReactionKind[] = [];
    for (const [position, kind] of reactionKindIds.entries()) {
      counts[kind] = results[position] ?? 0;
      if (visitor && results[reactionKindIds.length + position] === 1) {
        mine.push(kind);
      }
    }
    return { counts, mine };
  };
  return {
    read,
    toggle: async (slug, kind, visitor, active) => {
      await (active
        ? redis.sadd(memberKey(slug, kind), visitor)
        : redis.srem(memberKey(slug, kind), visitor));
      return read(slug, visitor);
    },
    totals: async (slugs) => {
      const pipeline = redis.pipeline();
      for (const slug of slugs) {
        for (const kind of reactionKindIds) {
          pipeline.scard(memberKey(slug, kind));
        }
      }
      const results = await pipeline.exec<number[]>();
      return Object.fromEntries(
        slugs.map((slug, position) => [
          slug,
          results
            .slice(
              position * reactionKindIds.length,
              (position + 1) * reactionKindIds.length
            )
            .reduce((sum, count) => sum + count, 0),
        ])
      );
    },
  };
};

const reactionLedgerSchema = z.record(
  z.string(),
  z.partialRecord(reactionKindSchema, z.array(z.string()))
);

type ReactionLedger = z.infer<typeof reactionLedgerSchema>;

const snapshotOf = (
  ledger: ReactionLedger,
  slug: string,
  visitor: string | null
): ReactionSnapshot => {
  const counts = emptyCounts();
  const mine: ReactionKind[] = [];
  for (const kind of reactionKindIds) {
    const members = ledger[slug]?.[kind] ?? [];
    counts[kind] = members.length;
    if (visitor && members.includes(visitor)) {
      mine.push(kind);
    }
  }
  return { counts, mine };
};

const settle = async (pending: Promise<unknown>) => {
  try {
    await pending;
    return true;
  } catch {
    return false;
  }
};

const totalOf = (snapshot: ReactionSnapshot) =>
  Object.values(snapshot.counts).reduce((sum, count) => sum + count, 0);

export const createFileStore = (filePath: string): ReactionStore => {
  let queue: Promise<boolean> = Promise.resolve(true);

  const load = async (): Promise<ReactionLedger> => {
    try {
      const parsed = reactionLedgerSchema.safeParse(
        JSON.parse(await readFile(filePath, "utf-8"))
      );
      return parsed.success ? parsed.data : {};
    } catch {
      return {};
    }
  };

  const serialize = <Result>(task: () => Promise<Result>) => {
    const current = (async () => {
      await queue;
      return task();
    })();
    queue = settle(current);
    return current;
  };

  return {
    read: async (slug, visitor) => snapshotOf(await load(), slug, visitor),
    toggle: (slug, kind, visitor, active) =>
      serialize(async () => {
        const data = await load();
        const entry = data[slug] ?? {};
        const members = new Set(entry[kind]);
        if (active) {
          members.add(visitor);
        } else {
          members.delete(visitor);
        }
        entry[kind] = [...members];
        data[slug] = entry;
        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
        return snapshotOf(data, slug, visitor);
      }),
    totals: async (slugs) => {
      const data = await load();
      return Object.fromEntries(
        slugs.map((slug) => [slug, totalOf(snapshotOf(data, slug, null))])
      );
    },
  };
};

const redisCredentials = () => {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { token, url } : null;
};

let store: ReactionStore | null | undefined;

export const getReactionStore = (): ReactionStore | null => {
  if (store !== undefined) {
    return store;
  }
  const credentials = redisCredentials();
  if (credentials) {
    store = createRedisStore(new Redis(credentials));
  } else if (process.env.NODE_ENV === "production") {
    store = null;
  } else {
    store = createFileStore(
      path.join(process.cwd(), ".data", "reactions.json")
    );
  }
  return store;
};
