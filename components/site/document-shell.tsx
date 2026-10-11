import type { ReactNode } from "react";

import { DossierDisclosure } from "@/components/site/dossier-disclosure";

export const DocumentShell = ({
  children,
  dossier,
  handle,
}: {
  children: ReactNode;
  dossier: ReactNode;
  handle: string;
}) => (
  <div className="mx-auto grid w-full max-w-screen-2xl flex-1 gap-x-6 gap-y-10 px-4 pt-6 pb-24 md:px-8 md:pt-8 lg:grid-cols-12 lg:items-start">
    <aside
      aria-label="Profile"
      className="lg:dossier-fits:sticky lg:dossier-fits:top-20 flex min-w-0 flex-col gap-6 lg:col-span-4"
      data-document-dossier
    >
      <DossierDisclosure handle={handle}>{dossier}</DossierDisclosure>
    </aside>
    <div className="flex min-w-0 flex-col gap-16 lg:col-span-8">{children}</div>
  </div>
);
