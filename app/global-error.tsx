"use client";

import "./globals.css";
import { PanelHeading } from "@/components/site/panel-heading";
import { technicalButtonVariants } from "@/components/site/styles";
import { fontClassNames } from "@/lib/fonts";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <html className={fontClassNames} lang="en">
    <body className="mx-auto flex min-h-svh w-full max-w-screen-2xl flex-col justify-center gap-8 px-4 py-24 md:px-8">
      <PanelHeading
        aside={error.digest}
        as="p"
        index="ERR"
        jp="障害"
        label="System fault"
      />
      <span aria-hidden className="hazard-stripe text-ink block h-3 w-full" />
      <h1 className="display text-ink text-5xl md:text-7xl">
        The site failed to load.
      </h1>
      <div>
        <button
          className={technicalButtonVariants({ tone: "solid" })}
          onClick={reset}
          type="button"
        >
          Retry
        </button>
      </div>
    </body>
  </html>
);

export default GlobalError;
