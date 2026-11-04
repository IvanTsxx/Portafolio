"use client";

import Link from "next/link";

import { technicalButtonVariants } from "@/components/site/styles";

const RouteError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <main
    className="max-w-frame min-h-hero mx-auto flex w-full flex-1 flex-col justify-center gap-8 px-5 py-24 md:px-8"
    id="main"
  >
    <p className="label text-faint flex items-center gap-4">
      <span>Runtime fault</span>
      <span aria-hidden className="bg-border h-px w-12" />
      {error.digest ? (
        <span className="tabular-nums">{error.digest}</span>
      ) : null}
    </p>
    <h1 className="display text-display text-foreground">
      This page failed to <em className="text-muted-foreground">render</em>.
    </h1>
    <p className="text-muted-foreground text-sm">
      The rest of the site still works.
    </p>
    <div className="flex flex-wrap gap-3">
      <button
        className={technicalButtonVariants({ tone: "solid" })}
        onClick={reset}
        type="button"
      >
        Retry
      </button>
      <Link className={technicalButtonVariants()} href="/">
        Back to home
      </Link>
    </div>
  </main>
);

export default RouteError;
