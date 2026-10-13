import type { ReactNode } from "react";

export const DocumentShell = ({ children }: { children: ReactNode }) => (
  <div className="w-full flex-1 px-4 pt-12 pb-32 md:px-8 md:pt-20">
    <div
      className="max-w-column relative mx-auto flex flex-col gap-24"
      data-reading-column=""
    >
      {children}
    </div>
  </div>
);
