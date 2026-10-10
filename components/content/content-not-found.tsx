import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { PanelHeading } from "@/components/site/panel-heading";
import { technicalButtonVariants } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export const ContentNotFound = ({
  backHref,
  backLabel,
  description,
  title,
}: {
  backHref: string;
  backLabel: string;
  description: string;
  title: string;
}) => (
  <section className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col justify-center gap-8 px-4 py-24 md:px-8">
    <PanelHeading aside="404" as="p" index="ERR" jp="不明" label="Not found" />
    <span aria-hidden className="hazard-stripe text-ink block h-3 w-full" />
    <h1 className="display text-ink text-5xl md:text-7xl">{title}</h1>
    <p className="label text-graphite">{description}</p>
    <Link className={cn(technicalButtonVariants(), "w-fit")} href={backHref}>
      <ArrowLeft aria-hidden className="size-4" />
      {backLabel}
    </Link>
  </section>
);
