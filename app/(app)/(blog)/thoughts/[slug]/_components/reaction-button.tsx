"use client";

import { toast } from "sonner";

import type { ReactionType } from "@/app/generated/prisma/enums";
import { togglePostReaction } from "@/shared/lib/actions/comments";

import { ReactionButtonClient } from "./reaction-button-client";

interface ReactionButtonProps {
  slug: string;
  type: ReactionType;
  count: number;
  emoji: string;
}

export function ReactionButton({
  slug,
  type,
  count,
  emoji,
}: ReactionButtonProps) {
  return (
    <form
      action={async () => {
        console.log("TOGGLING REACTION");

        console.log("type", type);

        const res = await togglePostReaction({ slug, type });

        toast.info("Reaction toggled", {
          description() {
            if (res.error) {
              return res.error;
            }

            if (res.added) {
              return "Reaction added";
            }

            if (res.removed) {
              return "Reaction removed";
            }
          },
        });

        console.log("res", res);
      }}
    >
      <ReactionButtonClient
        type={type}
        emoji={emoji}
        count={count}
        slug={slug}
      />
    </form>
  );
}
