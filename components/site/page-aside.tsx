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
  <section aria-label={label} className="contents">
    <PanelHeading
      as="p"
      className="max-lg:hidden lg:mt-4"
      index={code}
      jp="頁"
      label={label}
    />
    {children}
  </section>
);
