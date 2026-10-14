import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { MissingRoute } from "@/components/not-found/missing-route";
import { StageScene } from "@/components/scene/stage-scene";
import { Dossier } from "@/components/site/dossier";

export const metadata: Metadata = {
  description: "This page does not exist. Head back to Ivo's home page.",
  robots: { follow: true, index: false },
  title: "404 · Module not found",
};

const NotFound = () => (
  <Dossier>
    <section
      aria-labelledby="not-found-title"
      className="grid w-full content-center gap-10 lg:grid-cols-12 lg:gap-6"
    >
      <div className="flex flex-col gap-8 lg:col-span-5">
        <p className="label text-graphite flex items-center gap-3">
          <span className="text-ink">[ ER-404 ]</span>
          <span>Route trace</span>
          <span
            aria-hidden
            className="border-rule-strong min-w-8 flex-1 border-b border-dotted"
          />
          <span className="tabular-nums">01 / 01</span>
        </p>
        <h1
          className="display text-6xl md:text-7xl xl:text-8xl"
          id="not-found-title"
        >
          404 — Module not found.
        </h1>
        <pre className="border-rule-strong overflow-x-auto border-l py-1 pl-4 font-mono text-xs/relaxed whitespace-pre-wrap">
          <code>
            <span className="text-ink">ERR_MODULE_NOT_FOUND </span>
            <MissingRoute />
            {"\n"}
            <span className="text-mist">{"  at router.resolve (app/)"}</span>
            {"\n"}
            <span className="text-mist">{"  at AG-04 · tracing"}</span>
          </code>
        </pre>
        <Link
          className="group label bg-ink text-paper hover:bg-clay inline-flex h-11 w-fit items-center gap-3 px-4 transition-colors"
          href="/"
        >
          <ArrowLeftIcon
            aria-hidden
            className="ease-out-quart size-3.5 transition-transform group-hover:-translate-x-0.5"
          />
          Back home
        </Link>
      </div>
      <div className="border-rule-strong relative border lg:col-span-7">
        <p className="label text-graphite border-rule flex justify-between gap-4 border-b px-4 py-2">
          <span>Fig. 404 · Debugging</span>
          <span>AG-04</span>
        </p>
        <StageScene
          className="aspect-4/3"
          label="The companion inspects a code panel, catches the bug and fixes the broken line"
          stage="debug"
        />
      </div>
    </section>
  </Dossier>
);

export default NotFound;
