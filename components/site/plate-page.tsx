import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const guideClassName =
  "guide-draw border-border guides:opacity-100 absolute inset-0 border-x opacity-0 transition-opacity duration-500";

const columnLabelClassName =
  "label text-faint measure:opacity-100 absolute top-4 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-500";

const glowClassName =
  "guide-glow guides:block pointer-events-none absolute inset-y-0 -inset-x-px hidden";

export const PlateGuides = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-x-0 -inset-y-16 hidden grid-cols-12 gap-8 lg:grid"
  >
    <span className="relative col-span-4">
      <span className={cn(guideClassName, "wait-0")} data-guide="">
        <span className={glowClassName} />
      </span>
      <span className={columnLabelClassName}>4 / 12</span>
    </span>
    <span className="relative col-span-8">
      <span className={cn(guideClassName, "wait-200")} data-guide="">
        <span className={glowClassName} />
      </span>
      <span className={columnLabelClassName}>8 / 12</span>
    </span>
  </div>
);

export const PlatePage = ({
  children,
  plate,
}: {
  children: ReactNode;
  plate: ReactNode;
}) => (
  <div className="reading-scope relative">
    <PlateGuides />
    <div className="relative grid gap-16 lg:grid-cols-12 lg:gap-8">
      <aside className="min-w-0 lg:col-span-4 lg:px-8">
        <div className="no-scrollbar max-h-sticky flex flex-col gap-10 lg:sticky lg:top-24 lg:-mx-3 lg:overflow-y-auto lg:px-3">
          {plate}
        </div>
      </aside>
      <div className="reading-subject flex min-w-0 flex-col gap-24 lg:col-span-8 lg:px-8">
        {children}
      </div>
    </div>
  </div>
);
