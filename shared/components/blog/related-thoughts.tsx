import { formatDate } from "date-fns";
import Link from "next/link";

import type { Thought } from "@/shared/types/thought";

interface RelatedThoughtsProps {
  thoughts: Thought[];
}

export function RelatedThoughts({ thoughts }: RelatedThoughtsProps) {
  if (thoughts.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-border">
      <h2 className="text-[18px] font-medium mb-6">Continuar leyendo</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {thoughts.map((thought) => (
          <Link
            key={thought.slug}
            prefetch={false}
            href={`/thoughts/${thought.slug}`}
            target="_blank"
            className="group block p-4 rounded-lg border border-border hover:border-brand-green/60 transition-colors duration-150"
          >
            <h3 className="text-[14px] font-medium mb-2 line-clamp-2 group-hover:text-brand-green transition-colors duration-150">
              {thought.title}
            </h3>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span>{formatDate(thought.date, "MMM dd, yyyy")}</span>
              <span>·</span>
              <span>{thought.readingTime} min</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
