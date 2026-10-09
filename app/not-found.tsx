import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { MissingRoute } from "@/components/home/missing-route";
import { CornerMarks } from "@/components/home/primitives";
import { LazyDebuggerScene } from "@/components/home/scene/lazy-scenes";
import { primaryRoutes } from "@/lib/site/config";

const secondaryRoutes = primaryRoutes.filter((route) => route.href !== "/");

export const metadata: Metadata = {
  title: "404 · Module not found",
};

const NotFound = () => (
  <section
    aria-labelledby="not-found-title"
    className="min-h-below-header relative isolate mx-auto grid w-full max-w-screen-2xl items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-12 lg:gap-6"
  >
    <div
      aria-hidden
      className="blueprint-grid absolute inset-0 -z-10 mask-radial-from-20% mask-radial-to-80%"
    />
    <div className="flex flex-col gap-8 lg:col-span-6">
      <p className="label text-signal-rust">Error 404 · ERR_MODULE_NOT_FOUND</p>
      <h1
        className="display text-6xl md:text-7xl xl:text-8xl"
        id="not-found-title"
      >
        404 — Module not found.
      </h1>
      <pre className="border-rule bg-card/60 overflow-x-auto border p-4 font-mono text-xs/relaxed whitespace-pre-wrap">
        <code>
          <span className="text-signal-rust">error</span>
          <span className="text-muted-foreground"> Cannot resolve route </span>
          <MissingRoute />
          {"\n"}
          <span className="text-faint">
            {" "}
            at router.match (app/[...]/page.tsx)
          </span>
          {"\n"}
          <span className="text-faint">
            {" "}
            at workshop.resolve (blueprint unavailable)
          </span>
          {"\n\n"}
          <span className="text-muted-foreground">
            AG-04 is tracing it. The page may have moved, or never existed.
          </span>
        </code>
      </pre>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="group label bg-foreground text-background hover:bg-clay inline-flex h-11 items-center gap-3 px-4 transition-colors"
          href="/"
        >
          <ArrowLeftIcon
            aria-hidden
            className="ease-out-quart size-3.5 transition-transform group-hover:-translate-x-0.5"
          />
          Back to the workshop
        </Link>
      </div>
      <nav aria-label="Known routes">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {secondaryRoutes.map((route) => (
            <li key={route.href}>
              <Link
                className="label text-muted-foreground hover:text-foreground inline-flex h-11 items-center gap-2 transition-colors"
                href={route.href}
              >
                <span className="text-faint">{route.index}</span>
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
    <figure className="border-rule bg-card/40 relative m-0 aspect-4/3 border lg:col-span-6">
      <CornerMarks />
      <LazyDebuggerScene className="absolute inset-0" />
      <figcaption className="label text-faint pointer-events-none absolute inset-x-0 top-0 flex justify-between gap-4 p-4">
        <span>Fig. 404 · Broken route</span>
        <span>AG-04 · Debugger</span>
      </figcaption>
    </figure>
  </section>
);

export default NotFound;
