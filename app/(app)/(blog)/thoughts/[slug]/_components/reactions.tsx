"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { togglePostReaction } from "@/shared/lib/actions/comments";
import { useSession } from "@/shared/lib/auth-client";
import { cn } from "@/shared/lib/utils";

const REACTION_EMOJIS: Record<string, string> = {
  fire: "🔥",
  heart_black: "🖤",
  heart_red: "❤️",
  rocket: "🚀",
  thumbs_up: "👍",
};

const REACTION_ORDER = [
  "fire",
  "heart_black",
  "heart_red",
  "rocket",
  "thumbs_up",
] as const;
type ReactionType = (typeof REACTION_ORDER)[number];

interface ReactionState {
  counts: Record<ReactionType, number>;
  users: Record<ReactionType, string[]>;
}

interface ReactionsProps {
  slug: string;
  initialReactions?: ReactionState;
}

function initState(): ReactionState {
  const counts = {} as Record<ReactionType, number>;
  const users = {} as Record<ReactionType, string[]>;

  for (const e of REACTION_ORDER) {
    counts[e] = 0;
    users[e] = [];
  }

  return { counts, users };
}

export function Reactions({ slug, initialReactions }: ReactionsProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.email ?? session?.user?.id ?? "";

  // Initial state comes from server via props — no client-side fetch needed.
  // Server Actions already call revalidatePath on mutation, so the next
  // server render will carry fresh data.
  const [state, setState] = useState<ReactionState>(
    () => initialReactions || initState()
  );

  const [isReacting, setIsReacting] = useState(false);

  async function handleReaction(type: ReactionType) {
    if (isReacting) return;
    setIsReacting(true);

    const formData = new FormData();
    formData.set("slug", slug);
    formData.set("type", type.toUpperCase());

    try {
      const result: {
        error?: string;
        removed?: boolean;
        added?: boolean;
        type?: string;
      } = await togglePostReaction(formData);

      if (!result.error) {
        const newType = (result.type ?? type).toLowerCase() as ReactionType;
        setState((prev) => {
          const next = {
            counts: { ...prev.counts },
            users: { ...prev.users },
          };

          if (result.removed) {
            next.counts[newType] = Math.max(0, (next.counts[newType] ?? 0) - 1);
            next.users[newType] = next.users[newType].filter(
              (id) => id !== currentUserId
            );
          } else if (result.added) {
            // Remove from previous reaction type if user had one
            for (const t of REACTION_ORDER) {
              if (t !== newType && next.users[t]?.includes(currentUserId)) {
                next.counts[t] = Math.max(0, (next.counts[t] ?? 0) - 1);
                next.users[t] = next.users[t].filter(
                  (id) => id !== currentUserId
                );
              }
            }
            next.counts[newType] = (next.counts[newType] ?? 0) + 1;
            next.users[newType] = [
              ...(next.users[newType] ?? []),
              currentUserId,
            ];
          }

          return next;
        });
      }
    } catch {
      toast.error("Failed to update reaction");
    } finally {
      setIsReacting(false);
    }
  }

  // Calculate total and user's reaction
  const userReactionType = REACTION_ORDER.find((type) =>
    state.users[type]?.includes(currentUserId)
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
        Reactions
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {REACTION_ORDER.map((type) => {
          const count = state.counts[type] ?? 0;
          const isActive = userReactionType === type;

          return (
            <motion.button
              key={type}
              onClick={() => handleReaction(type)}
              whileHover={{ scale: 1.05 }}
              animate={
                isActive
                  ? {
                      scale: [1, 1.15, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.25 }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 border text-sm transition-colors duration-150",
                isActive
                  ? "border-brand-green text-brand-green"
                  : "border-border text-foreground hover:border-foreground"
              )}
              aria-label={`React with ${REACTION_EMOJIS[type]}`}
              aria-pressed={isActive}
              disabled={isReacting}
            >
              <span>{REACTION_EMOJIS[type]}</span>
              <AnimatePresence mode="popLayout">
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="text-[12px]"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
