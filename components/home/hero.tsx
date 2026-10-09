import { ArrowDownIcon, ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { HeroChoreography } from "@/components/home/hero-choreography";
import {
  CornerMarks,
  HomeSectionShell,
  StatusDot,
} from "@/components/home/primitives";
import { LazyHeroScene } from "@/components/home/scene/lazy-scenes";
import { agentRoles } from "@/lib/agents/roles";
import { siteConfig } from "@/lib/site/config";

const heroSpecs = [
  { term: "Based in", value: `${siteConfig.location} · UTC−03` },
  { term: "Builds with", value: "Next.js, R3F, GSAP, Tailwind v4" },
  { term: "Ships through", value: "Linear → Conductor → worktrees" },
] as const;

const headlineLineClass =
  "block motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:fill-mode-both motion-safe:duration-1000 motion-safe:ease-out-expo";

export const Hero = () => (
  <HomeSectionShell className="relative isolate overflow-hidden" id="system">
    <div
      aria-hidden
      className="blueprint-grid absolute inset-0 -z-10 mask-b-from-30% mask-b-to-100%"
    />
    <HeroChoreography className="min-h-below-header flex flex-col">
      <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-12 lg:gap-6 lg:py-10">
        <div className="lg:col-span-5">
          <p
            className="label text-muted-foreground flex items-center gap-2 motion-safe:invisible"
            data-hero-reveal
          >
            <StatusDot />
            {siteConfig.role} · {siteConfig.location}
          </p>
          <h1
            className="display mt-6 text-6xl sm:text-7xl 2xl:text-8xl"
            id="system-title"
          >
            <span className="block overflow-hidden pb-1">
              <span className={headlineLineClass}>Interactive</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className={`${headlineLineClass} motion-safe:delay-75`}>
                interfaces,
              </span>
            </span>
            <span className="text-muted-foreground block overflow-hidden pb-1">
              <span className={`${headlineLineClass} motion-safe:delay-150`}>
                built in an
              </span>
            </span>
            <span className="text-muted-foreground block overflow-hidden pb-1">
              <span className={`${headlineLineClass} motion-safe:delay-200`}>
                agent workshop.
              </span>
            </span>
          </h1>
          <p
            className="text-muted-foreground mt-8 max-w-md text-base text-pretty motion-safe:invisible"
            data-hero-reveal
          >
            I&apos;m {siteConfig.name}, a frontend engineer. I build interfaces,
            motion and real-time 3D for the web, and orchestrate AI agents
            across isolated worktrees to ship them. They assist. I design the
            system and own every decision.
          </p>
          <div
            className="mt-10 flex flex-wrap items-center gap-3 motion-safe:invisible"
            data-hero-reveal
          >
            <Link
              className="group label bg-foreground text-background hover:bg-clay inline-flex h-11 items-center gap-3 px-4 transition-colors"
              href="/work"
            >
              Selected work
              <ArrowRightIcon
                aria-hidden
                className="ease-out-quart size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              className="group label border-rule-strong text-foreground hover:border-foreground inline-flex h-11 items-center gap-3 border px-4 transition-colors"
              href="#workshop"
            >
              How the workshop runs
              <ArrowDownIcon
                aria-hidden
                className="ease-out-quart size-3.5 transition-transform group-hover:translate-y-0.5"
              />
            </a>
          </div>
        </div>
        <figure
          className="border-rule bg-card/40 relative m-0 aspect-4/3 border motion-safe:invisible lg:col-span-7"
          data-hero-frame
        >
          <CornerMarks />
          <LazyHeroScene className="absolute inset-0" />
          <figcaption className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4">
            <span className="label text-faint">Fig. 01 · Workstation</span>
            <span className="label text-faint text-right">
              {agentRoles.length} roles · 1 owner
            </span>
          </figcaption>
          <div
            aria-hidden
            className="label text-faint pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4"
          >
            <span className="tabular-nums">26.81° S · 65.22° W</span>
            <span>Illustrative</span>
          </div>
        </figure>
      </div>
      <div className="relative pb-8">
        <div
          aria-hidden
          className="bg-rule-strong absolute inset-x-0 top-0 h-px motion-safe:invisible"
          data-hero-rule
        />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 pt-6 md:grid-cols-4">
          {heroSpecs.map((spec) => (
            <div
              className="flex flex-col gap-2 motion-safe:invisible"
              data-hero-reveal
              key={spec.term}
            >
              <dt className="label text-faint">{spec.term}</dt>
              <dd className="text-foreground text-sm">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </HeroChoreography>
  </HomeSectionShell>
);
