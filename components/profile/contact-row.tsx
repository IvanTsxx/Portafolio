import { CompanionLines } from "@/components/scene/companion-lines";
import { SocialLinks } from "@/components/site/social-links";
import { siteConfig } from "@/lib/site/config";
import { sectionScripts } from "@/lib/site/section-scripts";

const { homeContact } = sectionScripts;

export const ContactRow = () => (
  <section
    aria-labelledby="contact-heading"
    className="border-rule-strong relative flex flex-col gap-6 border-t pt-6"
    id="contact"
  >
    <span aria-hidden className="hazard-stripe text-ink block h-3 w-full" />
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="label text-mist" id="contact-heading">
          [ GH-08 ] Contact <span className="jp">連絡</span>
        </h2>
        <a
          className="display text-ink decoration-graphite/40 hover:decoration-ink text-3xl break-all underline decoration-1 underline-offset-8 transition-[text-decoration-color] duration-100 sm:text-4xl md:text-6xl"
          href={`mailto:${siteConfig.email}`}
        >
          {siteConfig.email}
        </a>
      </div>
      <SocialLinks ids={["github", "x", "linkedin"]} variant="contact" />
    </div>
    <CompanionLines lines={homeContact.lines} />
  </section>
);
