"use client";
import type { VariantProps } from "class-variance-authority";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "../../lib/cn";

interface SearchToggleProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  hideIfDisabled?: boolean;
}

export function SearchToggle({
  hideIfDisabled,
  size = "icon-sm",
  variant = "ghost",
  ...props
}: SearchToggleProps) {
  const { setOpenSearch, enabled } = useSearchContext();
  if (hideIfDisabled && !enabled) {
    return null;
  }

  return (
    <button
      aria-label="Open Search"
      className={cn(
        buttonVariants({
          size,
          variant,
        }),
        props.className
      )}
      data-search=""
      onClick={() => {
        setOpenSearch(true);
      }}
      type="button"
    >
      <Search />
    </button>
  );
}

export function LargeSearchToggle({
  hideIfDisabled,
  ...props
}: ComponentProps<"button"> & {
  hideIfDisabled?: boolean;
}) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (hideIfDisabled && !enabled) {
    return null;
  }

  return (
    <button
      data-search-full=""
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-fd-muted-foreground text-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring",
        props.className
      )}
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <Search className="size-4" />
      {text.search}
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey.map((k, i) => (
          <kbd className="rounded-md border bg-fd-background px-1.5" key={i}>
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}
