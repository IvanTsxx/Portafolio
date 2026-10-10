import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";

import { siteConfig } from "@/lib/site/config";

export const ContactRow = () => (
  <section
    aria-labelledby="contact-heading"
    className="border-rule-strong flex flex-col gap-6 border-t pt-6"
    id="contact"
  >
    <span aria-hidden className="hazard-stripe text-ink block h-3 w-full" />
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="label text-mist" id="contact-heading">
          [ GH-10 ] Contact <span className="jp">連絡</span>
        </h2>
        <a
          className="display text-ink decoration-graphite/40 hover:decoration-ink text-3xl break-all underline decoration-1 underline-offset-8 transition-[text-decoration-color] duration-100 sm:text-4xl md:text-6xl"
          href={`mailto:${siteConfig.email}`}
        >
          {siteConfig.email}
        </a>
      </div>
      <ul className="flex flex-wrap gap-2">
        {siteConfig.socials.map((social) => (
          <li key={social.href}>
            <a
              className="label border-rule-strong text-ink ease-mechanical pointer-fine:hover:border-ink pointer-fine:hover:bg-ink pointer-fine:hover:text-paper flex h-11 items-center gap-2 border px-4 transition-colors duration-100"
              href={social.href}
              rel="noopener"
              target="_blank"
            >
              {social.label}
              <ArrowUpRightIcon aria-hidden className="size-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
