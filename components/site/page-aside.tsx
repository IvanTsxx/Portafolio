import type { ReactNode } from "react";

import { PanelHeading } from "@/components/site/panel-heading";

export const PageAside = ({
  children,
  code,
  label,
}: {
  children: ReactNode;
  code: string;
  label: string;
}) => (
  <section aria-label={label} className="flex flex-col gap-6">
    <PanelHeading as="p" index={code} jp="頁" label={label} />
    <div className="grid gap-6 md:grid-cols-2">{children}</div>
  </section>
);
