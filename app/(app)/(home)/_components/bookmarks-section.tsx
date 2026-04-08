import { Bookmark, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { LoadMoreItemsWrapper } from "@/shared/components/load-more-items-wrapper";
import { BOOKMARKS } from "@/shared/config/bookmarks";

import { SectionHeader } from "./section-header";

export function BookmarksSection() {
  return (
    <section>
      <SectionHeader label="Bookmarks" />
      <LoadMoreItemsWrapper max={3}>
        {BOOKMARKS.map((bookmark, i) => (
          <li className="list-none" key={bookmark.id}>
            <Link
              prefetch={false}
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-3 py-2.5 transition-colors hover:text-brand-green ${
                i < BOOKMARKS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <Bookmark
                className="h-[14px] w-[14px] shrink-0 text-muted-foreground transition-colors group-hover:text-brand-green"
                aria-hidden="true"
              />
              <span className="text-[13px] text-foreground transition-colors group-hover:text-brand-green">
                {bookmark.title}
              </span>
              <span className="text-[12px] text-muted-foreground">—</span>
              <span className="text-[12px] text-muted-foreground">
                {bookmark.author}
              </span>
              <ArrowUpRight
                className="ml-auto h-[14px] w-[14px] shrink-0 text-muted-foreground transition-colors group-hover:text-brand-green"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </LoadMoreItemsWrapper>
    </section>
  );
}
