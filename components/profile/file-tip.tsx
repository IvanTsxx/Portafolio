"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ReactElement, ReactNode, RefObject } from "react";

const fileTipVariants = cva(
  [
    "bg-paper text-ink border-rule-strong origin-(--transform-origin) border",
    "ease-out-quart transition-[scale,opacity] duration-200 data-ending-style:duration-150 data-instant:transition-none",
    "data-ending-style:opacity-0 data-starting-style:opacity-0",
    "motion-safe:data-ending-style:scale-98 motion-safe:data-starting-style:scale-98",
  ],
  {
    defaultVariants: { size: "note" },
    variants: {
      size: {
        hint: "label text-graphite px-2 py-1 tabular-nums",
        note: "flex w-72 max-w-(--available-width) flex-col gap-3 p-3",
      },
    },
  }
);

export const FileTipProvider = ({ children }: { children: ReactNode }) => (
  <Tooltip.Provider closeDelay={0} delay={300}>
    {children}
  </Tooltip.Provider>
);

export const FileTip = ({
  anchor,
  children,
  content,
  size,
}: {
  anchor?: RefObject<Element | null>;
  children: ReactElement;
  content: ReactNode;
} & VariantProps<typeof fileTipVariants>) => (
  <Tooltip.Root>
    <Tooltip.Trigger render={children} />
    <Tooltip.Portal>
      <Tooltip.Positioner
        align="start"
        anchor={anchor}
        className="z-40"
        collisionPadding={16}
        side="top"
        sideOffset={8}
      >
        <Tooltip.Popup className={fileTipVariants({ size })}>
          {content}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
);

export const TipLine = ({
  label,
  children,
}: {
  children: ReactNode;
  label: string;
}) => (
  <div className="flex flex-col gap-1">
    <span className="label text-mist">{label}</span>
    {children}
  </div>
);
