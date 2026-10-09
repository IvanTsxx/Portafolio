import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";

import { ContactAssembly } from "@/components/home/contact-assembly";
import { HomeSectionShell } from "@/components/home/primitives";
import { homeSection } from "@/lib/home/sections";
import { siteConfig } from "@/lib/site/config";

const section = homeSection("contact");

export const Contact = () => (
  <HomeSectionShell className="py-24 md:py-32" id="contact">
    <ContactAssembly className="blueprint-dots">
      <div className="grid gap-12 p-6 md:p-12 lg:grid-cols-12 lg:p-16">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <p className="label text-faint" data-assembly-content>
            <span className="text-clay">{section.index}</span>
            <span className="px-2">/</span>
            {section.label}
          </p>
          <h2
            className="display text-6xl md:text-7xl xl:text-8xl"
            data-assembly-content
            id="contact-title"
          >
            Open a ticket.
          </h2>
          <p
            className="text-muted-foreground max-w-lg text-base text-pretty"
            data-assembly-content
          >
            Interfaces, motion, real-time 3D, and the agent workflows behind
            them. Send the brief, the deadline and what success looks like.
          </p>
          <a
            className="group display hover:text-clay decoration-rule-strong hover:decoration-clay w-fit text-3xl break-all underline decoration-1 underline-offset-8 transition-colors md:text-5xl"
            data-assembly-content
            href={`mailto:${siteConfig.email}`}
          >
            {siteConfig.email}
          </a>
        </div>
        <div className="flex flex-col justify-end gap-8 lg:col-span-4">
          <ul className="border-rule border-t" data-assembly-content>
            {siteConfig.socials.map((social) => (
              <li key={social.href}>
                <a
                  className="group border-rule hover:text-foreground text-muted-foreground flex min-h-12 items-center justify-between border-b transition-colors"
                  href={social.href}
                  rel="noopener"
                  target="_blank"
                >
                  <span className="text-base">{social.label}</span>
                  <ArrowUpRightIcon
                    aria-hidden
                    className="group-hover:text-clay ease-out-quart size-4 transition-[color,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
          <p className="label text-faint" data-assembly-content>
            {siteConfig.location} · UTC−03 · {siteConfig.studio}
          </p>
        </div>
      </div>
    </ContactAssembly>
  </HomeSectionShell>
);
