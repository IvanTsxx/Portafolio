"use client";

import { useFormStatus } from "react-dom";

import type { ReactionType } from "@/app/generated/prisma/enums";
import { cn } from "@/shared/lib/utils";

interface ReactionButtonClientProps {
  type: ReactionType;
  emoji: string;
  count: number;
  slug: string;
}

export function ReactionButtonClient({
  type,
  emoji,
  count,
  slug,
}: ReactionButtonClientProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="type" value={type} />
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 border text-sm transition-colors duration-150",
          pending
            ? "border-brand-green text-brand-green"
            : "border-border text-foreground hover:border-foreground"
        )}
        aria-label={`React with ${emoji}`}
      >
        <span>{emoji}</span>
        {count > 0 && <span className="text-[12px]">{count}</span>}
      </button>
    </>
  );
}
