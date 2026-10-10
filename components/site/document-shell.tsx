import type { ReactNode } from "react";

import { DossierDisclosure } from "@/components/site/dossier-disclosure";

export const DocumentShell = ({
  aside,
  children,
  dossier,
  handle,
  name,
}: {
  aside: ReactNode;
  children: ReactNode;
  dossier: ReactNode;
  handle: string;
  name: string;
}) => (
  <div className="mx-auto grid w-full max-w-screen-2xl flex-1 gap-x-6 gap-y-10 px-4 pt-6 pb-24 md:px-8 md:pt-8 lg:grid-cols-12 lg:items-start">
    <aside
      aria-label="Profile"
      className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-12 lg:col-span-4 lg:-mt-8 lg:-ml-2 lg:max-h-[calc(100svh-3rem)] lg:[scrollbar-width:thin] lg:overflow-y-auto lg:py-8 lg:pr-3 lg:pl-2"
      data-document-dossier
    >
      <DossierDisclosure handle={handle} name={name}>
        {dossier}
      </DossierDisclosure>
      {aside}
    </aside>
    <div className="flex min-w-0 flex-col gap-16 lg:col-span-8">{children}</div>
  </div>
);
