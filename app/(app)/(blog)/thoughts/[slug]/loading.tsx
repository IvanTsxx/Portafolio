import Link from "next/link";

import { Icons } from "@/shared/components/icons";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      {/* ReadingProgress + TOC no tienen sentido en loading */}

      <div className="py-10 w-full max-w-3xl mx-auto">
        {/* Back link (estático) */}
        <Link
          prefetch={false}
          href="/thoughts"
          className="text-[12px] text-muted-foreground mb-8 inline-block"
        >
          ← Thoughts
        </Link>

        {/* Language switcher placeholder */}
        <div className="mb-4">
          <Skeleton className="h-8 w-[140px] rounded-md" />
        </div>

        {/* Header */}
        <header className="grid grid-cols-1 gap-2">
          {/* title */}
          <Skeleton className="h-8 w-[80%] mb-3" />

          {/* description */}
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-[90%] mb-4" />

          {/* meta */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[10px]" />
            <Skeleton className="h-4 w-[80px]" />

            {/* tags */}
            <Skeleton className="h-5 w-[60px] rounded-sm" />
            <Skeleton className="h-5 w-[70px] rounded-sm" />
            <Skeleton className="h-5 w-[50px] rounded-sm" />
          </div>

          {/* reactions */}
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>

          <hr className="border-border mt-4 pb-2" />
        </header>

        {/* Article content */}
        <article className="my-12 space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[95%]" />
          <Skeleton className="h-5 w-[90%]" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[85%]" />

          {/* simulate code block */}
          <Skeleton className="h-32 w-full rounded-md" />

          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[92%]" />
          <Skeleton className="h-5 w-[88%]" />
        </article>

        {/* Footer (semi-estático) */}
        <div className="border-t border-border pt-6 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-[13px] text-muted-foreground">
              Written by{" "}
              <span className="text-foreground font-medium">
                Ivan Bongiovanni
              </span>
            </span>

            <div className="flex items-center gap-3">
              <Icons.Github className="size-6 opacity-50" />
              <Icons.Twitter className="size-6 opacity-50" />
              <Icons.Linkedin className="size-6 opacity-50" />
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mb-12 space-y-4">
          <Skeleton className="h-6 w-[120px]" />
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>

        {/* Related thoughts */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-[160px]" />
          <div className="grid gap-4">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}
