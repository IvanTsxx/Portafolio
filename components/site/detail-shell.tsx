import type { ReactNode } from "react";

export const DetailShell = ({ children }: { children: ReactNode }) => (
  <div
    className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-16 px-4 pt-6 pb-24 md:px-8 md:pt-8"
    data-reading-column=""
  >
    {children}
  </div>
);
