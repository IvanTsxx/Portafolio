import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const SubHeading = ({
  aside,
  label,
}: {
  aside?: ReactNode;
  label: string;
}) => (
  <h3 className="label text-faint flex items-baseline gap-2 font-normal">
    <span>{label}</span>
    {aside ? (
      <span className="text-muted-foreground ml-auto tabular-nums">
        {aside}
      </span>
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
      "label border-border-strong text-muted-foreground inline-block max-w-full border border-dashed px-1.5 py-0.5 break-words normal-case",
      className
    )}
  >
    {children}
  </code>
);

export const SpecList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <ul className={cn("border-border border-t", className)}>{children}</ul>;

export const SpecRow = ({
  aside,
  children,
  name,
}: {
  aside?: ReactNode;
  children?: ReactNode;
  name: ReactNode;
}) => (
  <li className="border-border grid gap-x-6 gap-y-1 border-b py-3 md:grid-cols-[14rem_1fr_auto] md:items-center">
    <span className="label text-foreground break-words normal-case">
      {name}
    </span>
    <span className="text-muted-foreground min-w-0 text-sm leading-snug text-pretty">
      {children}
    </span>
    {aside ? (
      <span className="label text-faint normal-case tabular-nums">{aside}</span>
    ) : null}
  </li>
);
