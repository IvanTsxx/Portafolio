import Link from "next/link";

import { PostListItem } from "@/shared/components/blog/post-list-item";
import { getRecentThoughts } from "@/shared/lib/thoughts";

import { SectionHeader } from "./section-header";

export function ThoughtsPreviewSection() {
  const thoughts = getRecentThoughts();

  return (
    <section className="max-w-3xl mx-auto px-4 py-6">
      <SectionHeader
        label="Thoughts"
        action={
          <Link
            prefetch={false}
            href="/thoughts"
            className="  text-[11px] text-muted-foreground transition-colors hover:text-brand-green"
          >
            View all →
          </Link>
        }
      />

      {thoughts.length === 0 ? (
        <p className="  text-[13px] text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="flex flex-col">
          {thoughts.map((thought, index) => (
            <PostListItem key={thought.slug} thought={thought} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
