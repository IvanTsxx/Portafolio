import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import {
  CornerMarks,
  HomeSectionShell,
  SectionHeading,
} from "@/components/home/primitives";
import { registryItems } from "@/lib/registry/registry";
import { siteConfig } from "@/lib/site/config";

const [leadRegistryItem] = registryItems;

export const RegistryTeaser = () => (
  <HomeSectionShell className="py-24 md:py-32" id="registry">
    <SectionHeading
      id="registry"
      lede="The pieces this site is built from, published as a shadcn registry so other projects install them instead of copying."
      title="Take the parts"
    />
    <div className="mt-12 grid gap-6 lg:grid-cols-12">
      <div className="border-rule bg-card/40 relative flex flex-col gap-6 border p-6 lg:col-span-5">
        <CornerMarks />
        <span className="label text-faint">Install</span>
        <pre className="bg-background border-rule overflow-x-auto border p-4 font-mono text-sm">
          <code>
            <span className="text-faint select-none">$ </span>
            bunx shadcn add {siteConfig.registryNamespace}/
            {leadRegistryItem?.name}
          </code>
        </pre>
        <p className="text-muted-foreground text-sm text-pretty">
          Components ship with their types, motion variants and reduced-motion
          fallbacks. Namespace{" "}
          <code className="text-foreground font-mono">
            {siteConfig.registryNamespace}
          </code>
          .
        </p>
        <Link
          className="group label bg-foreground text-background hover:bg-clay mt-auto inline-flex h-11 w-fit items-center gap-3 px-4 transition-colors"
          href="/registry"
        >
          Browse the registry
          <ArrowRightIcon
            aria-hidden
            className="ease-out-quart size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
      <ul className="border-rule border-t lg:col-span-7">
        {registryItems.map((item) => (
          <li key={item.name}>
            <Link
              className="group border-rule hover:bg-card/60 grid grid-cols-12 items-baseline gap-4 border-b py-5 transition-colors md:px-2"
              href={`/registry/${item.name}`}
            >
              <span className="label text-faint group-hover:text-clay col-span-3 transition-colors md:col-span-2">
                {item.categories[0]}
              </span>
              <code className="text-foreground col-span-9 font-mono text-sm md:col-span-4">
                {item.name}
              </code>
              <span className="text-muted-foreground col-span-12 text-sm md:col-span-6">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </HomeSectionShell>
);
