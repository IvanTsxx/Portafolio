import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { BackCover } from "@/components/site/back-cover";
import { RouteTabs } from "@/components/site/route-tabs";
import { RouteThumbIndex } from "@/components/site/thumb-index";

const frameVariants = cva("relative mx-auto w-full", {
  variants: {
    size: {
      detail: "max-w-6xl",
      document: "max-w-[calc(var(--container-column)+6rem)]",
    },
  },
});

const contentVariants = cva("relative mx-auto flex flex-col", {
  variants: {
    size: {
      detail: "gap-16",
      document: "max-w-column gap-24",
    },
  },
});

type DossierSize = NonNullable<VariantProps<typeof frameVariants>["size"]>;

const backingSheetClassName =
  "bg-paper-deep border-rule-strong/40 absolute inset-0 border";

export const Dossier = ({
  children,
  size,
}: {
  children: ReactNode;
  size: DossierSize;
}) => (
  <div className="flex w-full flex-1 flex-col px-3 pt-6 md:px-8 lg:px-12 lg:pt-12">
    <div className={frameVariants({ size })}>
      <RouteTabs />
      <div className="relative">
        <span
          aria-hidden
          className={`${backingSheetClassName} hatch translate-x-2 translate-y-2 md:translate-x-3 md:translate-y-3`}
        />
        <div className="relative">
          <span
            aria-hidden
            className={`${backingSheetClassName} translate-x-1 translate-y-1 md:translate-x-1.5 md:translate-y-1.5`}
          />
          <main
            className="border-rule-strong/50 bg-paper relative z-10 border"
            data-reading-column=""
            id="main"
          >
            <div className="px-4 pt-10 pb-24 md:px-12 md:pt-16 md:pb-32">
              <div className={contentVariants({ size })}>{children}</div>
            </div>
          </main>
        </div>
        <BackCover />
      </div>
    </div>
    {size === "document" ? <RouteThumbIndex /> : null}
  </div>
);
