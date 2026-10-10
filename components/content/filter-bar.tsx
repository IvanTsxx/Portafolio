"use client";

import { useId } from "react";

import { chipClassName } from "@/components/site/styles";
import type { FacetCount } from "@/lib/content/facets";

export const FilterBar = ({
  active,
  facets,
  label,
  onChange,
  shown,
  total,
}: {
  active: string;
  facets: readonly FacetCount[];
  label: string;
  onChange: (facet: string) => void;
  shown: number;
  total: number;
}) => {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      <p className="label text-mist shrink-0" id={labelId}>
        {label}
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
          <span className="tabular-nums">{String(total).padStart(2, "0")}</span>
        </button>
        {facets.map((facet) => (
          <button
            aria-pressed={active === facet.name}
            className={chipClassName}
            key={facet.name}
            onClick={() => onChange(active === facet.name ? "" : facet.name)}
            type="button"
          >
            {facet.name}
            <span className="tabular-nums">
              {String(facet.count).padStart(2, "0")}
            </span>
          </button>
        ))}
      </fieldset>
      <p aria-live="polite" className="sr-only">
        Showing {shown} of {total}
      </p>
    </div>
  );
};
