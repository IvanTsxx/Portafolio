"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const fileIndexOf = (target: EventTarget | null) => {
  const link =
    target instanceof Element
      ? target.closest<HTMLAnchorElement>("a[data-file]")
      : null;
  const index = Number(link?.dataset.file);
  return link && Number.isInteger(index) ? index : null;
};

export const ShelfStage = ({
  covers,
  shelf,
}: {
  covers: readonly { cover: ReactNode; id: string }[];
  shelf: ReactNode;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    const show = (event: Event) => {
      const index = fileIndexOf(event.target);
      if (index !== null) {
        setActive(index);
      }
    };
    const showOnMouse = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        show(event);
      }
    };
    element.addEventListener("focusin", show);
    element.addEventListener("pointerover", showOnMouse);
    return () => {
      element.removeEventListener("focusin", show);
      element.removeEventListener("pointerover", showOnMouse);
    };
  }, []);

  return (
    <div
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-8"
      ref={root}
    >
      <div className="min-w-0 lg:flex-1">{shelf}</div>
      <div aria-hidden className="grid lg:w-80 lg:shrink-0" data-build-block>
        {covers.map(({ cover, id }, index) => (
          <div
            className={cn(
              "ease-out-quart col-start-1 row-start-1 flex transition-[opacity,translate] duration-200",
              index === active
                ? "opacity-100"
                : "pointer-events-none opacity-0 motion-safe:translate-y-1"
            )}
            key={id}
          >
            {cover}
          </div>
        ))}
      </div>
    </div>
  );
};
