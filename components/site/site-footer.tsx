import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { DetailControl } from "@/components/site/detail-control";
import { Monogram } from "@/components/site/monogram";
import { SocialLinks } from "@/components/site/social-links";
import { focusRingClassName } from "@/components/site/styles";
import { primaryRoutes, secondaryRoutes, siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";
import { PagePeelTrigger } from "@/registry/ivan/components/page-peel/page-peel";

const colophonYear = "2026";

const footerLinkClassName = cn(
  "text-muted-foreground hover:text-foreground flex min-h-11 items-center text-sm transition-colors duration-200 md:min-h-8",
  focusRingClassName
);

export const SiteFooter = () => (
  <footer className="max-w-frame relative mx-auto mt-24 w-full px-5 pb-10 md:px-8">
    <div aria-hidden className="hairline-x h-px" />
    <div className="grid gap-12 pt-12 md:grid-cols-12 md:pt-16">
      <div className="flex flex-col gap-8 md:col-span-7">
        <p className="spaced text-faint">Contact</p>
        <a
          className={cn(
            "group/mail display text-foreground text-display w-fit",
            focusRingClassName
          )}
          href={`mailto:${siteConfig.email}`}
        >
          <span className="ink-underline">Write to me</span>
          <ArrowUpRightIcon
            aria-hidden
            className="text-muted-foreground ease-out-expo ml-3 inline-block size-7 align-baseline transition-transform duration-500 group-hover/mail:translate-x-2 group-hover/mail:-translate-y-2 md:size-9"
            weight="thin"
          />
        </a>
        <p className="text-muted-foreground max-w-sm text-sm">
          {siteConfig.email}
        </p>
      </div>
      <nav
        aria-label="Footer"
        className="grid grid-cols-2 gap-8 md:col-span-5 md:grid-cols-3"
      >
        <div className="flex flex-col gap-2">
          <p className="label text-faint">Index</p>
          <ul>
            {primaryRoutes.map((route) => (
              <li key={route.href}>
                <Link className={footerLinkClassName} href={route.href}>
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <p className="label text-faint">More</p>
          <ul>
            {secondaryRoutes.map((route) => (
              <li key={route.href}>
                <Link className={footerLinkClassName} href={route.href}>
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <p className="label text-faint">Elsewhere</p>
          <SocialLinks className="flex flex-col" variant="footer" />
        </div>
      </nav>
    </div>
    <div className="label text-faint mt-16 flex flex-wrap items-center justify-between gap-4">
      <Link
        aria-label={`${siteConfig.nickname}, home`}
        className={cn("group/home -m-1 p-1", focusRingClassName)}
        href="/"
      >
        <Monogram
          className="text-foreground ease-out-expo size-5 transition-transform duration-500 group-hover/home:-rotate-6"
          weight="small"
        />
      </Link>
      <span>{siteConfig.location}</span>
      <DetailControl />
      <span className="tabular-nums">© {colophonYear}</span>
    </div>
    <PagePeelTrigger
      className={cn(
        "label text-foreground sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:bottom-0 focus-visible:left-5 focus-visible:flex focus-visible:min-h-10 focus-visible:items-center md:focus-visible:left-8",
        focusRingClassName
      )}
    >
      View the underside
    </PagePeelTrigger>
  </footer>
);
