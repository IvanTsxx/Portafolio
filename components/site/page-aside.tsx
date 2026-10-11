import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { PanelHeading } from "@/components/site/panel-heading";

const panelGridVariants = cva("grid gap-6", {
  defaultVariants: { columns: "double" },
  variants: {
    columns: {
      double: "md:grid-cols-2",
      single: "",
    },
  },
});

export const PageAside = ({
  children,
  code,
  columns,
  label,
}: {
  children: ReactNode;
  code: string;
  label: string;
} & VariantProps<typeof panelGridVariants>) => (
  <section aria-label={label} className="flex flex-col gap-6">
    <PanelHeading as="p" index={code} jp="頁" label={label} />
    <div className={panelGridVariants({ columns })}>{children}</div>
  </section>
);
