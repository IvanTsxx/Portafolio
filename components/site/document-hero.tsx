import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ReactNode } from "react";

import { AgentWaypoint } from "@/components/scene/agent-waypoint";
import type { AgentWaypointProps } from "@/components/scene/agent-waypoint";
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
      display: "text-6xl sm:text-7xl md:text-8xl xl:text-9xl",
      title: "text-5xl md:text-7xl",
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
  waypoint?: AgentWaypointProps;
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
  waypoint,
}: DocumentHeroProps) => (
  <header className="relative mx-auto w-full max-w-screen-2xl px-4 pt-6 pb-10 md:px-8 md:pt-8 md:pb-14">
    <div className="label border-rule-strong flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-b pb-2">
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

    <div className="mt-10 grid items-end gap-x-6 gap-y-8 md:mt-16 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col items-start gap-6 lg:col-span-8">
        <h1 className={titleVariants({ size })}>{title}</h1>
        {children}
      </div>
      {jp || lede ? (
        <div className="flex flex-col gap-4 lg:col-span-4">
          {jp ? (
            <p
              aria-hidden
              className="jp text-graphite text-5xl leading-none font-light tracking-widest select-none md:text-6xl"
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
    {waypoint ? <AgentWaypoint {...waypoint} /> : null}
  </header>
);
