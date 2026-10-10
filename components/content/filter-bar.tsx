"use client";

import { useId } from "react";

import { chipClassName } from "@/components/site/styles";

export interface FilterFacet {
  count: number;
  label?: string;
  name: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

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
    <div className="flex flex-col gap-3">
      <p className="label text-mist" id={labelId}>
        {label}
        {jp ? <span className="jp ml-1">{jp}</span> : null}
      </p>
      <fieldset
        aria-labelledby={labelId}
        className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0"
      >
        <button
          aria-pressed={active === ""}
          className={chipClassName}
          onClick={() => onChange("")}
          type="button"
        >
          All
          <span className="tabular-nums">{pad(total)}</span>
        </button>
        {facets.map((facet) => (
          <button
            aria-pressed={active === facet.name}
            className={chipClassName}
            key={facet.name}
            onClick={() => onChange(active === facet.name ? "" : facet.name)}
            type="button"
          >
            {facet.label ?? facet.name}
            <span className="tabular-nums">{pad(facet.count)}</span>
          </button>
        ))}
      </fieldset>
    </div>
  );
};
