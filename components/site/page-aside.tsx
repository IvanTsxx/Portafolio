import type { ReactNode } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const PageAside = ({
  children,
  code,
  label,
}: {
  children: ReactNode;
  code: string;
  label: string;
}) => (
  <aside
    aria-label={label}
    className="xl:w-aside xl:absolute xl:inset-y-0 xl:right-full xl:mr-12"
  >
    <div className="flex flex-col gap-8 xl:sticky xl:top-24">
      <p className="label text-mist tabular-nums">
        [ {code} ] {label} <span className="jp">頁</span>
      </p>
      {children}
    </div>
  </aside>
);

export const AsidePanel = ({
  children,
  collapsible = false,
  jp,
  label,
}: {
  children: ReactNode;
  collapsible?: boolean;
  jp: string;
  label: string;
}) => {
  const heading = (
    <>
      {label} <span className="jp ml-1">{jp}</span>
    </>
  );
  if (!collapsible) {
    return (
      <div className="flex flex-col gap-3">
        <p className="label text-mist">{heading}</p>
        {children}
      </div>
    );
  }
  return (
    <>
      <details className="group/panel border-rule border-y xl:hidden">
        <summary
          className={cn(
            "label text-graphite flex min-h-11 cursor-pointer items-center after:ml-auto after:content-['+'] group-open/panel:after:content-['−']",
            focusRingClassName
          )}
        >
          {heading}
        </summary>
        <div className="pb-4">{children}</div>
      </details>
      <div className="hidden flex-col gap-3 xl:flex">
        <p className="label text-mist">{heading}</p>
        {children}
      </div>
    </>
  );
};
