import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import {
  HomeSectionShell,
  SampleTag,
  SectionHeading,
} from "@/components/home/primitives";
import { experiments } from "@/lib/home/content";

export const Experiments = () => (
  <HomeSectionShell className="py-24 md:py-32" id="experiments">
    <SectionHeading
      aside={
        <Link
          className="label text-muted-foreground hover:text-foreground inline-flex h-11 items-center gap-2 transition-colors"
          href="/lab"
        >
          Open the lab
          <ArrowUpRightIcon aria-hidden className="size-3.5" />
        </Link>
      }
      id="experiments"
      lede="Small studies that never needed a client. Shaders, motion and physics, kept until a real project wants them."
      title="From the lab"
    />
    <ul className="border-rule mt-12 border-t">
      {experiments.map((experiment) => (
        <li key={experiment.slug}>
          <Link
            className="group border-rule hover:bg-card/60 grid grid-cols-12 items-baseline gap-4 border-b py-6 transition-colors md:px-2"
            href={`/lab/${experiment.slug}`}
          >
            <span className="label text-faint group-hover:text-clay col-span-3 transition-colors md:col-span-2">
              {experiment.code}
            </span>
            <span className="display col-span-9 text-3xl md:col-span-4 md:text-4xl">
              {experiment.title}
            </span>
            <span className="text-muted-foreground col-span-12 text-sm md:col-span-4">
              {experiment.note}
            </span>
            <span className="col-span-12 flex items-center justify-start gap-3 md:col-span-2 md:justify-end">
              <span className="label text-faint">{experiment.medium}</span>
              {experiment.sample ? <SampleTag /> : null}
              <ArrowUpRightIcon
                aria-hidden
                className="text-faint group-hover:text-foreground size-4 transition-colors"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </HomeSectionShell>
);
