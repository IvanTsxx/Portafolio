"use client";
import {
  TOCItem as PrimitiveTOCItem,
  type TOCItemType,
} from "fumadocs-core/toc";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { type ComponentProps, useRef } from "react";
import { cn } from "../../lib/cn";
import { mergeRefs } from "../../lib/merge-refs";
import { TocThumb, useTOCItems } from "./index";

export function TOCItems({ ref, className, ...props }: ComponentProps<"div">) {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useTOCItems();
  const { text } = useI18n();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-fd-card p-3 text-fd-muted-foreground text-xs">
        {text.tocNoHeadings}
      </div>
    );
  }

  return (
    <>
      <TocThumb
        className="absolute top-(--fd-top) h-(--fd-height) w-0.5 rounded-e-sm bg-fd-primary transition-[top,height] ease-linear"
        containerRef={containerRef}
      />
      <div
        className={cn(
          "flex flex-col border-fd-foreground/10 border-s",
          className
        )}
        ref={mergeRefs(ref, containerRef)}
        {...props}
      >
        {items.map((item) => (
          <TOCItem item={item} key={item.url} />
        ))}
      </div>
    </>
  );
}

function TOCItem({ item }: { item: TOCItemType }) {
  return (
    <PrimitiveTOCItem
      className={cn(
        "prose wrap-anywhere py-1.5 text-fd-muted-foreground text-sm transition-colors first:pt-0 last:pb-0 data-[active=true]:text-fd-primary",
        item.depth <= 2 && "ps-3",
        item.depth === 3 && "ps-6",
        item.depth >= 4 && "ps-8"
      )}
      href={item.url}
    >
      {item.title}
    </PrimitiveTOCItem>
  );
}
