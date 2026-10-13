"use client";

import Link from "next/link";

import { PanelHeading } from "@/components/site/panel-heading";
import { technicalButtonVariants } from "@/components/site/styles";
import { cn } from "@/lib/utils";

const RouteError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <main
    className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col justify-center gap-8 px-4 py-24 md:px-8"
    id="main"
  >
    <PanelHeading
      aside={error.digest}
      as="p"
      index="ERR"
      label="Runtime fault"
    />
    <span aria-hidden className="hazard-stripe text-ink block h-3 w-full" />
    <h1 className="display text-ink text-5xl md:text-7xl">
      This page failed to render.
    </h1>
    <p className="label text-graphite">The rest of the site still works.</p>
    <div className="flex flex-wrap gap-3">
      <button
        className={technicalButtonVariants({ tone: "solid" })}
        onClick={reset}
        type="button"
      >
        Retry
      </button>
      <Link className={cn(technicalButtonVariants())} href="/">
        Back to home
      </Link>
    </div>
  </main>
);

export default RouteError;
