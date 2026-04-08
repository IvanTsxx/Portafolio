import { ReactionType } from "@/app/generated/prisma/enums";
import { getPostReactions } from "@/shared/lib/data";

import { ReactionButton } from "./reaction-button";

const REACTION_EMOJIS: Record<ReactionType, string> = {
  [ReactionType.FIRE]: "🔥",
  [ReactionType.HEART_BLACK]: "🖤",
  [ReactionType.HEART_RED]: "❤️",
  [ReactionType.ROCKET]: "🚀",
  [ReactionType.THUMBS_UP]: "👍",
};

const REACTION_ORDER: ReactionType[] = [
  ReactionType.FIRE,
  ReactionType.HEART_BLACK,
  ReactionType.HEART_RED,
  ReactionType.ROCKET,
  ReactionType.THUMBS_UP,
];

interface ReactionsProps {
  slug: string;
}

export async function Reactions({ slug }: ReactionsProps) {
  const reactions = await getPostReactions(slug);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
        Reactions
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {REACTION_ORDER.map((type) => {
          const count = reactions.find((r) => r.type === type)?.count ?? 0;
          return (
            <ReactionButton
              key={type}
              slug={slug}
              type={type}
              count={count}
              emoji={REACTION_EMOJIS[type]}
            />
          );
        })}
      </div>
    </div>
  );
}
