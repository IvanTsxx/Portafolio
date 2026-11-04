import type { ReactNode } from "react";

export const PageFrame = ({ children }: { children: ReactNode }) => (
  <main
    className="max-w-frame relative mx-auto flex w-full flex-1 flex-col gap-24 px-5 pt-10 md:px-8 md:pt-16"
    data-reading-column=""
    id="main"
  >
    {children}
  </main>
);
