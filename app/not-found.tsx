import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { MoonPoster } from "@/components/home/moon-poster";
import { MissingRoute } from "@/components/not-found/missing-route";
import { PageFrame } from "@/components/site/page-frame";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description: "This page does not exist. Head back to Ivo's home page.",
  robots: { follow: true, index: false },
  title: "404 · Off the map",
};

const NotFound = () => (
  <PageFrame>
    <section
      aria-labelledby="not-found-title"
      className="min-h-hero grid w-full content-center items-center gap-16 lg:grid-cols-12"
    >
      <div className="flex flex-col gap-8 lg:col-span-6">
        <p className="label text-faint flex items-center gap-4">
          <span className="tabular-nums">404</span>
          <span aria-hidden className="bg-border h-px w-12" />
          <span>Off the map</span>
        </p>
        <h1 className="display text-hero text-foreground" id="not-found-title">
          Nothing <em className="text-muted-foreground">out here</em>.
        </h1>
        <p className="label text-muted-foreground">
          <MissingRoute />
        </p>
        <Link
          className={cn(
            "group/back border-border-strong hover:border-foreground hover:bg-foreground hover:text-background text-foreground rounded-pill inline-flex min-h-11 w-fit items-center gap-3 border px-5 text-sm transition-colors duration-300",
            focusRingClassName
          )}
          href="/"
        >
          <ArrowLeftIcon
            aria-hidden
            className="ease-out-expo size-3.5 transition-transform duration-500 group-hover/back:-translate-x-1"
          />
          Back home
        </Link>
      </div>
      <div className="text-faint mx-auto w-full max-w-md lg:col-span-5 lg:col-start-8">
        <MoonPoster className="size-full opacity-60" />
      </div>
    </section>
  </PageFrame>
);

export default NotFound;
