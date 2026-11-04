"use client";

import { HeartIcon } from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";

import { reactionTotalsSchema } from "@/lib/reactions/kinds";

type Totals = Record<string, number>;

let totals: Totals | null = null;
let request: Promise<void> | null = null;
const listeners = new Set<() => void>();

const fetchTotals = async (): Promise<Totals> => {
  try {
    const response = await fetch("/api/reactions");
    if (!response.ok) {
      return {};
    }
    const parsed = reactionTotalsSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
};

const loadTotals = async () => {
  totals = await fetchTotals();
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  request ??= loadTotals();
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => totals;
const getServerSnapshot = () => null;

export const ReactionTally = ({ slug }: { slug: string }) => {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const total = snapshot?.[slug] ?? 0;
  if (total === 0) {
    return null;
  }
  return (
    <span className="label text-muted-foreground flex items-center gap-1.5 tabular-nums">
      <HeartIcon aria-hidden className="text-signal size-3.5" weight="fill" />
      {total}
      <span className="sr-only">reactions</span>
    </span>
  );
};
