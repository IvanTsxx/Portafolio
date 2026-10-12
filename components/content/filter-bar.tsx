"use client";

import { useId } from "react";

import { dotItemClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export interface FilterFacet {
  count: number;
  label?: string;
  name: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

const FilterOption = ({
  count,
  isActive,
  label,
  onSelect,
}: {
  count: number;
  isActive: boolean;
  label: string;
  onSelect: () => void;
}) => (
  <button
    aria-pressed={isActive}
    className={cn(dotItemClassName, "text-left xl:w-full")}
    onClick={onSelect}
    type="button"
  >
    <span className="min-w-0 truncate">{label}</span>
    <span className="label text-mist ml-auto tabular-nums">{pad(count)}</span>
  </button>
);

export const FilterBar = ({
  active,
  facets,
  jp,
  label,
  onChange,
  total,
}: {
  active: string;
  facets: readonly FilterFacet[];
  jp?: string;
  label: string;
  onChange: (facet: string) => void;
  total: number;
}) => {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2">
      <p className="label text-mist" id={labelId}>
        {label}
        {jp ? <span className="jp ml-1">{jp}</span> : null}
      </p>
      <fieldset
        aria-labelledby={labelId}
        className="m-0 flex min-w-0 flex-wrap gap-x-6 border-0 p-0 xl:flex-col xl:gap-x-0"
      >
        <FilterOption
          count={total}
          isActive={active === ""}
          label="All"
          onSelect={() => onChange("")}
        />
        {facets.map((facet) => (
          <FilterOption
            count={facet.count}
            isActive={active === facet.name}
            key={facet.name}
            label={facet.label ?? facet.name}
            onSelect={() => onChange(active === facet.name ? "" : facet.name)}
          />
        ))}
      </fieldset>
    </div>
  );
};
