import { siteConfig } from "@/lib/site/config";

export const SiteFooter = () => (
  <footer className="border-rule border-t">
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
      <p className="label text-faint">
        {siteConfig.name} · {siteConfig.location} · Mascots are an independent
        homage, not affiliated with Anthropic.
      </p>
      <ul className="flex gap-4">
        {siteConfig.socials.map((social) => (
          <li key={social.href}>
            <a
              className="label text-muted-foreground hover:text-clay transition-colors"
              href={social.href}
              rel="noopener"
              target="_blank"
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </footer>
);
