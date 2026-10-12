import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ReactNode } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export interface DocumentMeta {
  label: string;
  value: string;
}

const titleVariants = cva("display text-ink text-balance", {
  defaultVariants: { size: "display" },
  variants: {
    size: {
      display: "text-6xl @xl:text-7xl @3xl:text-8xl @6xl:text-9xl",
      title: "text-5xl @3xl:text-6xl @5xl:text-7xl",
    },
  },
});

interface DocumentHeroProps extends VariantProps<typeof titleVariants> {
  annotation?: string;
  back?: { href: string; label: string };
  children?: ReactNode;
  code: string;
  jp?: string;
  lede?: ReactNode;
  meta?: readonly DocumentMeta[];
  title: ReactNode;
}

export const DocumentHero = ({
  annotation,
  back,
  children,
  code,
  jp,
  lede,
  meta,
  size,
  title,
}: DocumentHeroProps) => (
  <header className="border-rule @container relative w-full border-b pb-16">
    <div className="label flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
      <span className="flex flex-wrap items-center gap-x-6 gap-y-1">
        {back ? (
          <Link
            className={cn(
              focusRingClassName,
              "text-ink hover:text-graphite ease-mechanical -my-2 inline-flex min-h-11 items-center gap-2 transition-colors duration-100 md:min-h-8"
            )}
            href={back.href}
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            {back.label}
          </Link>
        ) : null}
        {[{ label: "Doc", value: code }, ...(meta ?? [])].map((item) => (
          <span className="flex gap-2" key={item.label}>
            <span className="text-mist">{item.label}</span>
            <span className="text-ink tabular-nums">{item.value}</span>
          </span>
        ))}
      </span>
      {annotation ? (
        <span className="jp text-graphite">{annotation}</span>
      ) : null}
    </div>

    <div className="mt-12 grid items-end gap-x-6 gap-y-8 md:mt-16 @3xl:grid-cols-12">
      <div className="flex min-w-0 flex-col items-start gap-6 @3xl:col-span-8">
        <h1 className={titleVariants({ size })}>{title}</h1>
        {children}
      </div>
      {jp || lede ? (
        <div className="flex flex-col gap-4 @3xl:col-span-4">
          {jp ? (
            <p
              aria-hidden
              className="jp text-graphite text-5xl leading-none font-light tracking-widest select-none @3xl:text-6xl"
            >
              {jp}
            </p>
          ) : null}
          <span
            aria-hidden
            className="hazard-stripe text-ink block h-1.5 w-24"
          />
          {lede ? <p className="label text-graphite">{lede}</p> : null}
        </div>
      ) : null}
    </div>
  </header>
);
