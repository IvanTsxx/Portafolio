import Link from "next/link";

import { PanelHeading } from "@/components/site/panel-heading";
import { focusRingClassName, linkClassName } from "@/components/site/styles";
import { primaryRoutes, siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";

const footerRoutes = primaryRoutes.filter((route) => route.href !== "/");

export const SiteFooter = () => (
  <footer className="mx-auto mt-24 w-full max-w-screen-2xl px-4 pb-8 md:px-8">
    <PanelHeading aside="2026" as="p" index="END" jp="奥付" label="Colophon" />
    <div className="mt-6 grid gap-8 md:grid-cols-12">
      <div className="flex flex-col gap-2 md:col-span-5">
        <p className="font-wordmark text-2xl leading-none italic">
          {siteConfig.name}
        </p>
        <p className="label text-mist">
          {siteConfig.role} / {siteConfig.location}
        </p>
      </div>
      <nav aria-label="Footer" className="md:col-span-3">
        <ul className="label grid grid-cols-2 gap-x-6 gap-y-1">
          {footerRoutes.map((route) => (
            <li key={route.href}>
              <Link
                className={cn(
                  linkClassName,
                  "inline-flex min-h-11 items-center md:min-h-8"
                )}
                href={route.href}
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <ul className="label grid grid-cols-2 gap-x-6 gap-y-1 md:col-span-4">
        {siteConfig.socials.map((social) => (
          <li key={social.href}>
            <a
              className={cn(
                linkClassName,
                "inline-flex min-h-11 items-center md:min-h-8"
              )}
              href={social.href}
              rel="noopener"
              target="_blank"
            >
              {social.label}
            </a>
          </li>
        ))}
        <li className="col-span-2">
          <a
            className={cn(
              focusRingClassName,
              "text-mist hover:text-ink ease-mechanical inline-flex min-h-11 items-center normal-case transition-colors duration-100 md:min-h-8"
            )}
            href={`mailto:${siteConfig.email}`}
          >
            {siteConfig.email}
          </a>
        </li>
      </ul>
    </div>
    <div className="mt-8 flex flex-col gap-3">
      <span aria-hidden className="hazard-stripe text-ink block h-1.5" />
      <p className="label text-mist">
        Mascots are an independent homage, not affiliated with Anthropic.
      </p>
    </div>
  </footer>
);
