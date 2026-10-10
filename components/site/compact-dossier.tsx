import type { ReactNode } from "react";

import { PortraitPlate } from "@/components/profile/portrait-plate";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { focusRingClassName } from "@/components/site/styles";
import { siteConfig } from "@/lib/site/config";
import { experience } from "@/lib/site/experience";
import { cn } from "@/lib/utils";

export const PORTRAIT_SRC = "/profile/portrait.jpg";

const monogram = siteConfig.name
  .split(/\s+/u)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

export const DossierStrip = ({
  code,
  revision = "Rev 4.2",
}: {
  code: string;
  revision?: string;
}) => (
  <div className="label border-rule-strong flex items-baseline justify-between border-b pb-2">
    <span className="flex items-baseline gap-3">
      <span className="text-mist tabular-nums">[ {code} ]</span>
      <span className="text-ink">Dossier</span>
      <span className="jp text-mist">身元</span>
    </span>
    <span className="text-mist">{revision}</span>
  </div>
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

const currentRole = experience.find((entry) => entry.end === null);

export const CompactDossier = ({
  children,
  code,
}: {
  children?: ReactNode;
  code: string;
}) => (
  <section aria-label="Dossier" className="flex flex-col gap-6">
    <DossierStrip code={code} />
    <div className="grid grid-cols-[6rem_1fr] items-end gap-4 lg:grid-cols-[8rem_1fr]">
      <PortraitPlate
        label={`Dithered portrait of ${siteConfig.name}`}
        monogram={monogram}
        size="compact"
        src={PORTRAIT_SRC}
      />
      <div className="flex min-w-0 flex-col gap-1 pb-2">
        <p className="text-ink text-2xl leading-tight font-light tracking-tight text-balance">
          {siteConfig.name}
        </p>
        <p className="label text-graphite normal-case">@{siteConfig.handle}</p>
      </div>
    </div>
    <LeaderList>
      <LeaderRow jp="役割" label="Role">
        {siteConfig.role}
      </LeaderRow>
      {currentRole ? (
        <LeaderRow jp="所属" label="Company">
          {currentRole.company}
        </LeaderRow>
      ) : null}
      <LeaderRow jp="所在地" label="Location">
        {siteConfig.location}
      </LeaderRow>
    </LeaderList>
    {children}
  </section>
);
