import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const LeaderList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <dl className={cn("flex flex-col", className)}>{children}</dl>;

export const LeaderRow = ({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) => (
  <div
    className={cn(
      "label flex flex-wrap items-baseline gap-x-2 py-2",
      className
    )}
  >
    <dt className="text-mist after:border-rule-strong flex flex-auto items-baseline gap-x-2 after:mb-1 after:h-px after:min-w-4 after:flex-1 after:self-end after:border-b after:border-dotted">
      <span className="shrink-0">{label}</span>
    </dt>
    <dd className="text-ink ml-auto max-w-full text-right break-words normal-case">
      {children}
    </dd>
  </div>
);
