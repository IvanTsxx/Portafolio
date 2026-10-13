import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { TickMark } from "@/components/profile/module";
import { specimenVariants } from "@/components/profile/specimen-variants";
import { cn } from "@/lib/utils";

export const SpecGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className="@container">
    <ul className={cn("border-rule grid border-t border-l", className)}>
      {children}
    </ul>
  </div>
);

export const SpecCell = ({
  children,
  className,
  code,
  footer,
  name,
  surface,
}: {
  children: ReactNode;
  className?: string;
  code: string;
  footer?: ReactNode;
  name: string;
  surface?: VariantProps<typeof specimenVariants>["surface"];
}) => (
  <li className={cn(specimenVariants({ surface }), "min-w-0", className)}>
    <TickMark />
    <p className="label flex items-baseline justify-between gap-2">
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="text-mist tabular-nums">{code}</span>
        <span className="text-ink">{name}</span>
      </span>
    </p>
    {children}
    {footer ? (
      <p className="label text-mist mt-auto break-words normal-case">
        {footer}
      </p>
    ) : null}
  </li>
);

export const SubHeading = ({
  aside,
  label,
}: {
  aside?: ReactNode;
  label: string;
}) => (
  <h3 className="label text-mist flex items-baseline gap-2 font-normal">
    <span>{label}</span>
    {aside ? (
      <span className="text-graphite ml-auto tabular-nums">{aside}</span>
    ) : null}
  </h3>
);

export const ClassTag = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <code
    className={cn(
      "label border-rule-strong text-graphite inline-block max-w-full border border-dashed px-1.5 py-0.5 break-words normal-case",
      className
    )}
  >
    {children}
  </code>
);

export const PreviewBox = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "border-rule bg-paper relative flex min-h-24 items-center justify-center overflow-hidden border p-3",
      className
    )}
  >
    {children}
  </div>
);
