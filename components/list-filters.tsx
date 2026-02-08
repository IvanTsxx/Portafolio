"use client";

import { ArrowUpDown, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SortOption = {
  value: string;
  label: string;
};

type FilterItem = {
  id: string;
  name: string;
  slug: string;
};

interface ListFiltersProps {
  filters: FilterItem[];
  filterKey: string;
  filterLabel: string;
  sortOptions: SortOption[];
  currentFilter?: string;
  currentSort?: string;
}

export function ListFilters({
  filters,
  filterKey,
  filterLabel,
  sortOptions,
  currentFilter,
  currentSort = "recent",
}: ListFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleFilterChange = (slug: string) => {
    startTransition(() => {
      const newValue = currentFilter === slug ? null : slug;
      router.push(`${pathname}?${createQueryString(filterKey, newValue)}`, {
        scroll: false,
      });
    });
  };

  const handleSortChange = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("sort", value)}`, {
        scroll: false,
      });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = currentFilter || currentSort !== "recent";

  return (
    <div
      className={`space-y-4 transition-opacity ${isPending ? "opacity-50" : ""}`}
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-muted-foreground text-sm">{filterLabel}:</span>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleFilterChange(item.slug)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition-all ${
                currentFilter === item.slug
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/30 bg-card/60 text-muted-foreground hover:border-primary/20 hover:text-foreground"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort + Clear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">Ordenar:</span>
          <div className="flex gap-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSortChange(option.value)}
                className={`rounded-lg px-2.5 py-1 text-sm transition-all ${
                  currentSort === option.value
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 size-3" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Active filter badge */}
      {currentFilter && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Filtro activo:</span>
          <Badge
            variant="secondary"
            className="cursor-pointer rounded-lg"
            onClick={() => handleFilterChange(currentFilter)}
          >
            {filters.find((f) => f.slug === currentFilter)?.name}
            <X className="ml-1 size-3" />
          </Badge>
        </div>
      )}
    </div>
  );
}
