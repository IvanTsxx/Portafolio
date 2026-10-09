"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

const RouteError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => (
  <section className="blueprint-grid mx-auto flex w-full max-w-screen-2xl flex-1 flex-col justify-center gap-6 px-4 py-24 md:px-6">
    <p className="label text-signal-rust">
      Runtime fault{error.digest ? ` · ${error.digest}` : ""}
    </p>
    <h1 className="display text-5xl md:text-7xl">
      A station stopped responding.
    </h1>
    <p className="text-muted-foreground max-w-prose">
      This part of the workshop failed to render. The rest of the site still
      works.
    </p>
    <div className="flex gap-3">
      <Button onClick={reset}>Retry</Button>
      <Button render={<Link href="/" />} variant="outline">
        Back to home
      </Button>
    </div>
  </section>
);

export default RouteError;
