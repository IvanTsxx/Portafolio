import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderMeta {
  label: string;
  value: string;
}

export const PageHeader = ({
  className,
  code,
  jp,
  lede,
  meta,
  title,
}: {
  className?: string;
  code: string;
  jp: string;
  lede?: ReactNode;
  meta?: readonly PageHeaderMeta[];
  title: string;
}) => (
  <header
    className={cn(
      "mx-auto w-full max-w-screen-2xl px-4 pt-6 pb-10 md:px-8 md:pt-8 md:pb-14",
      className
    )}
  >
    <div className="label border-rule-strong flex flex-wrap gap-x-6 gap-y-1 border-b pb-2">
      <span className="flex gap-2">
        <span className="text-mist">Doc</span>
        <span className="text-ink tabular-nums">{code}</span>
      </span>
      {meta?.map((item) => (
        <span className="flex gap-2" key={item.label}>
          <span className="text-mist">{item.label}</span>
          <span className="text-ink tabular-nums">{item.value}</span>
        </span>
      ))}
    </div>
    <div className="mt-10 grid items-end gap-x-6 gap-y-8 md:mt-16 lg:grid-cols-12">
      <h1 className="display text-ink text-5xl sm:text-7xl lg:col-span-8 lg:text-9xl">
        {title}
      </h1>
      <div className="flex flex-col gap-4 lg:col-span-4">
        <p
          aria-hidden
          className="jp text-graphite text-5xl leading-none font-light tracking-[0.2em] select-none md:text-6xl"
        >
          {jp}
        </p>
        <span aria-hidden className="hazard-stripe text-ink block h-1.5 w-24" />
        {lede ? <p className="label text-graphite">{lede}</p> : null}
      </div>
    </div>
  </header>
);
