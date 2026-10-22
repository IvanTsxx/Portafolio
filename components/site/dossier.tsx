import type { ReactNode } from "react";

import { BackCover } from "@/components/site/back-cover";
import { DossierEdge } from "@/components/site/dossier-edge";
import { GutterField } from "@/components/site/gutter-field/gutter-field";
import { RouteTabs } from "@/components/site/route-tabs";
import { RouteThumbIndex } from "@/components/site/thumb-index";

const backingSheetClassName =
  "bg-paper-deep border-rule-strong/40 absolute inset-0 border";

export const Dossier = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full flex-1 flex-col px-3 pt-6 md:px-8 lg:px-12 lg:pt-12">
    <GutterField />
    <div className="max-w-sheet relative mx-auto w-full" data-dossier-sheet="">
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
              <div className="relative flex flex-col gap-24">{children}</div>
            </div>
          </main>
          <DossierEdge />
        </div>
        <BackCover />
      </div>
    </div>
    <RouteThumbIndex />
  </div>
);
