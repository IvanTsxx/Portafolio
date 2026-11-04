"use client";

import type { Icon } from "@phosphor-icons/react";
import {
  ArrowFatUpIcon,
  FireIcon,
  HandsClappingIcon,
  HeartIcon,
  LightbulbIcon,
  ShootingStarIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { focusRingClassName } from "@/components/site/styles";
import {
  emptyCounts,
  reactionKindIds,
  reactionLabels,
  reactionSnapshotSchema,
} from "@/lib/reactions/kinds";
import type { ReactionKind, ReactionSnapshot } from "@/lib/reactions/kinds";
import { cn } from "@/lib/utils";

const reactionIcons = {
  clap: HandsClappingIcon,
  fire: FireIcon,
  learned: LightbulbIcon,
  love: HeartIcon,
  "mind-blown": ShootingStarIcon,
  upvote: ArrowFatUpIcon,
} as const satisfies Record<ReactionKind, Icon>;

const burstRotations = [
  "rotate-0",
  "rotate-60",
  "rotate-120",
  "rotate-180",
  "rotate-240",
  "rotate-300",
] as const;

type BarState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ready"; snapshot: ReactionSnapshot };

const endpointFor = (slug: string) => `/api/reactions/${slug}`;

const readSnapshot = async (response: Response) => {
  if (!response.ok) {
    return null;
  }
  const parsed = reactionSnapshotSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
};

const applyToggle = (
  snapshot: ReactionSnapshot,
  kind: ReactionKind,
  active: boolean
): ReactionSnapshot => ({
  counts: {
    ...snapshot.counts,
    [kind]: Math.max(0, snapshot.counts[kind] + (active ? 1 : -1)),
  },
  mine: active
    ? [...snapshot.mine, kind]
    : snapshot.mine.filter((entry) => entry !== kind),
});

const Burst = () => (
  <span aria-hidden className="pointer-events-none absolute inset-0">
    {burstRotations.map((rotation) => (
      <span
        className={cn("absolute inset-0 grid place-items-center", rotation)}
        key={rotation}
      >
        <span className="burst-dot bg-signal size-1 rounded-full" />
      </span>
    ))}
  </span>
);

export const ReactionBar = ({ slug }: { slug: string }) => {
  const [state, setState] = useState<BarState>({ status: "loading" });
  const [lastActivated, setLastActivated] = useState<{
    kind: ReactionKind;
    nonce: number;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const snapshot = await readSnapshot(
          await fetch(endpointFor(slug), { signal: controller.signal })
        );
        setState(
          snapshot ? { snapshot, status: "ready" } : { status: "unavailable" }
        );
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "unavailable" });
        }
      }
    };
    load();
    return () => controller.abort();
  }, [slug]);

  if (state.status === "unavailable") {
    return null;
  }

  const snapshot =
    state.status === "ready"
      ? state.snapshot
      : { counts: emptyCounts(), mine: [] };

  const toggle = async (kind: ReactionKind) => {
    if (state.status !== "ready") {
      return;
    }
    const previous = state.snapshot;
    const active = !previous.mine.includes(kind);
    setState({
      snapshot: applyToggle(previous, kind, active),
      status: "ready",
    });
    if (active) {
      setLastActivated((current) => ({
        kind,
        nonce: (current?.nonce ?? 0) + 1,
      }));
    }
    try {
      const confirmed = await readSnapshot(
        await fetch(endpointFor(slug), {
          body: JSON.stringify({ active, kind }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        })
      );
      setState({ snapshot: confirmed ?? previous, status: "ready" });
    } catch {
      setState({ snapshot: previous, status: "ready" });
    }
  };

  const mine = new Set(snapshot.mine);

  return (
    <ul
      aria-busy={state.status === "loading"}
      aria-label="Reactions"
      className="flex flex-wrap gap-2"
    >
      {reactionKindIds.map((id) => {
        const label = reactionLabels[id];
        const ReactionIcon = reactionIcons[id];
        const isMine = mine.has(id);
        const count = snapshot.counts[id];
        const burstKey =
          lastActivated !== null && lastActivated.kind === id
            ? lastActivated.nonce
            : null;
        return (
          <li key={id}>
            <button
              aria-label={`${label}, ${count}`}
              aria-pressed={isMine}
              className={cn(
                "group/reaction border-border text-muted-foreground hover:border-border-strong hover:text-foreground aria-pressed:border-signal aria-pressed:bg-signal/10 aria-pressed:text-foreground rounded-pill relative flex min-h-11 items-center gap-2 border px-4 text-sm transition-[color,background-color,border-color,scale] duration-200 active:scale-95 disabled:opacity-60",
                focusRingClassName
              )}
              disabled={state.status === "loading"}
              onClick={() => toggle(id)}
              title={label}
              type="button"
            >
              <span className="relative grid size-5 place-items-center">
                <ReactionIcon
                  aria-hidden
                  className={cn(
                    "group-aria-pressed/reaction:text-signal ease-out-expo size-4.5 transition-transform duration-200 group-hover/reaction:-translate-y-0.5",
                    burstKey === null ? "" : "pop-in"
                  )}
                  key={burstKey ?? "idle"}
                  weight={isMine ? "fill" : "regular"}
                />
                {burstKey === null ? null : <Burst key={burstKey} />}
              </span>
              <span className="relative h-5 min-w-4 overflow-hidden tabular-nums">
                <span className="count-roll block" key={count}>
                  {state.status === "loading" ? "·" : count}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
