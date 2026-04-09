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
        const { error } = await togglePostReaction({ slug, type });

        if (error) {
          toast.error(
            process.env.NODE_ENV === "development"
              ? error
              : "Something went wrong"
          );
        }
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
