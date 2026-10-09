import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

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
  <section className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col justify-center gap-6 px-4 py-24 md:px-6">
    <p className="label text-muted-foreground tabular-nums">404</p>
    <h1 className="display text-6xl md:text-8xl">{title}</h1>
    <p className="text-muted-foreground max-w-xl text-lg text-pretty">
      {description}
    </p>
    <Link
      className="label text-foreground hover:text-clay inline-flex min-h-11 w-fit items-center gap-2 transition-colors"
      href={backHref}
    >
      <ArrowLeft aria-hidden className="size-4" />
      {backLabel}
    </Link>
  </section>
);
