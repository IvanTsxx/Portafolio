import type { ReactNode } from "react";

const containerClassName = "mx-auto w-full max-w-screen-2xl px-4 md:px-8";

export const DocumentLayout = ({
  after,
  children,
  dossier,
  dossierLabel,
  hero,
}: {
  after?: ReactNode;
  children: ReactNode;
  dossier: ReactNode;
  dossierLabel: string;
  hero: ReactNode;
}) => (
  <div className="flex-1">
    <div className={`${containerClassName} pt-6 pb-10 md:pt-8 md:pb-14`}>
      {hero}
    </div>
    <div
      className={`${containerClassName} grid gap-x-6 gap-y-16 pb-24 lg:grid-cols-12`}
    >
      <aside
        aria-label={dossierLabel}
        className="min-w-0 lg:sticky lg:top-16 lg:col-span-4 lg:self-start"
      >
        {dossier}
      </aside>
      <div className="flex min-w-0 flex-col gap-16 lg:col-span-8">
        {children}
      </div>
    </div>
    {after ? (
      <div className={`${containerClassName} flex flex-col gap-16 pb-24`}>
        {after}
      </div>
    ) : null}
  </div>
);
