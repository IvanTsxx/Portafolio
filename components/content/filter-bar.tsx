"use client";

import { useEffect, useId, useRef, useState } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export interface FilterFacet {
  count: number;
  label?: string;
  name: string;
}

interface IndicatorBox {
  height: number;
  left: number;
  top: number;
  width: number;
}

const useActiveIndicator = (activeKey: string) => {
  const track = useRef<HTMLFieldSetElement>(null);
  const [box, setBox] = useState<IndicatorBox | null>(null);

  useEffect(() => {
    const element = track.current;
    if (!element) {
      return;
    }
    const measure = () => {
      const active = element.querySelector<HTMLElement>(
        `[data-filter-key="${CSS.escape(activeKey)}"]`
      );
      setBox(
        active
          ? {
              height: active.offsetHeight,
              left: active.offsetLeft,
              top: active.offsetTop,
              width: active.offsetWidth,
            }
          : null
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [activeKey]);

  return { box, track };
};

export const FilterBar = ({
  active,
  facets,
  label,
  onChange,
  total,
}: {
  active: string;
  facets: readonly FilterFacet[];
  label: string;
  onChange: (facet: string) => void;
  total: number;
}) => {
  const labelId = useId();
  const { box, track } = useActiveIndicator(active);
  const options = [{ count: total, label: "All", name: "" }, ...facets];

  return (
    <div className="flex min-w-0 items-center gap-4">
      <p className="label text-faint shrink-0" id={labelId}>
        {label}
      </p>
      <fieldset
        aria-labelledby={labelId}
        className="no-scrollbar relative -my-1 flex min-w-0 items-center gap-1 overflow-x-auto border-0 p-0 py-1"
        ref={track}
      >
        <span
          aria-hidden
          className={cn(
            "bg-foreground ease-out-expo rounded-pill pointer-events-none absolute top-0 left-0 transition-[translate,width,height,opacity] duration-500",
            box ? "opacity-100" : "opacity-0"
          )}
          style={{
            height: box?.height ?? 0,
            translate: `${box?.left ?? 0}px ${box?.top ?? 0}px`,
            width: box?.width ?? 0,
          }}
        />
        {options.map((option) => {
          const isActive = active === option.name;
          return (
            <button
              aria-pressed={isActive}
              data-filter-key={option.name}
              className={cn(
                "text-muted-foreground hover:text-foreground aria-pressed:text-background rounded-pill relative z-10 flex h-8 shrink-0 items-center gap-1.5 px-3 text-sm leading-none transition-colors duration-300 active:scale-95",
                focusRingClassName
              )}
              key={option.name || "all"}
              onClick={() =>
                onChange(isActive && option.name !== "" ? "" : option.name)
              }
              type="button"
            >
              <span className="whitespace-nowrap">
                {option.label ?? option.name}
              </span>
              <span className="label leading-none tracking-normal tabular-nums opacity-60">
                {option.count}
              </span>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
};
