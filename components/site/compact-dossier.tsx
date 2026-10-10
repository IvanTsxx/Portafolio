import type { ReactNode } from "react";

import { PanelHeading } from "@/components/site/panel-heading";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const PORTRAIT_SRC = "/profile/portrait.jpg";

export const DossierStrip = ({
  code,
  revision = "Rev 4.2",
}: {
  code: string;
  revision?: string;
}) => (
  <PanelHeading
    as="p"
    aside={revision}
    index={code}
    jp="身元"
    label="Dossier"
  />
);

export const DossierPanel = ({
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
      <details className="group/panel border-rule-strong border lg:hidden">
        <summary
          className={cn(
            "label text-graphite flex min-h-11 cursor-pointer items-center px-4 after:ml-auto after:content-['+'] group-open/panel:after:content-['−']",
            focusRingClassName
          )}
        >
          {heading}
        </summary>
        <div className="px-4 pb-3">{children}</div>
      </details>
      <div className="hidden flex-col gap-3 lg:flex">
        <p className="label text-mist">{heading}</p>
        {children}
      </div>
    </>
  );
};
