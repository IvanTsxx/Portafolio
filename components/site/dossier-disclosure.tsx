"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";
import type { ReactNode } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const DossierDisclosure = ({
  children,
  handle,
  name,
}: {
  children: ReactNode;
  handle: string;
  name: string;
}) => {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const monogram = name
    .split(/\s+/u)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group/dossier flex flex-col gap-6" data-open={open}>
      <button
        aria-controls={bodyId}
        aria-expanded={open}
        className={cn(
          "border-rule-strong ease-mechanical pointer-fine:hover:bg-paper-deep/60 flex min-h-14 w-full items-center gap-3 border p-1.5 pr-4 text-left transition-colors duration-100 lg:hidden",
          focusRingClassName
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span
          aria-hidden
          className="label bg-ink text-paper grid size-11 shrink-0 place-items-center"
        >
          {monogram}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-ink truncate text-lg leading-tight font-light tracking-tight">
            {name}
          </span>
          <span className="label text-graphite truncate normal-case">
            @{handle}
          </span>
        </span>
        <span className="label text-ink ml-auto flex shrink-0 items-center gap-2">
          {open ? "Close" : "Dossier"}
          <span className="jp text-mist">身元</span>
          <PlusIcon
            aria-hidden
            className="ease-out-quart size-4 transition-transform duration-200 group-data-[open=true]/dossier:rotate-45"
            weight="light"
          />
        </span>
      </button>
      <div
        className="hidden group-data-[open=true]/dossier:block lg:block"
        id={bodyId}
      >
        {children}
      </div>
    </div>
  );
};
