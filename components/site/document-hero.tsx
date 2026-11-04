import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export interface DocumentMeta {
  label: string;
  value: string;
}

interface DocumentHeroProps {
  back?: { href: string; label: string };
  children?: ReactNode;
  code: string;
  lede?: ReactNode;
  meta?: readonly DocumentMeta[];
  size?: "display" | "title";
  title: ReactNode;
}

export const DocumentHero = ({
  back,
  children,
  code,
  lede,
  meta,
  title,
}: DocumentHeroProps) => (
  <header className="flex flex-col gap-8">
    <div className="label rise-in flex flex-wrap items-center gap-x-5 gap-y-2">
      {back ? (
        <Link
          className={cn(
            focusRingClassName,
            "group/back text-foreground hover:text-muted-foreground -my-2 inline-flex min-h-11 items-center gap-2 transition-colors duration-200 md:min-h-8"
          )}
          href={back.href}
        >
          <ArrowLeftIcon
            aria-hidden
            className="ease-out-expo size-3.5 transition-transform duration-300 group-hover/back:-translate-x-1"
          />
          {back.label}
        </Link>
      ) : null}
      <span className="text-faint tabular-nums">{code}</span>
    </div>
    <h1 className="mask-line">
      <span className="display text-title text-foreground mask-up block">
        {title}
      </span>
    </h1>
    {lede ? (
      <p className="text-muted-foreground rise-in wait-200 text-sm leading-relaxed">
        {lede}
      </p>
    ) : null}
    {meta && meta.length > 0 ? (
      <dl className="label rise-in wait-300 flex flex-col">
        {meta.map((item) => (
          <div
            className="border-border flex items-baseline justify-between gap-4 border-b py-2 first:border-t"
            key={item.label}
          >
            <dt className="text-faint">{item.label}</dt>
            <dd className="text-foreground text-right tabular-nums">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    ) : null}
    {children ? (
      <div className="rise-in wait-400 flex min-w-0 flex-col items-start gap-4">
        {children}
      </div>
    ) : null}
  </header>
);
