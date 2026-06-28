import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Icons } from "@/shared/components/icons";
import { SITE } from "@/shared/config/site";

const LINKS = [
  { href: SITE.twitter, icon: Icons.Twitter, label: "Twitter" },
  { href: SITE.github, icon: Icons.Github, label: "GitHub" },
  { href: SITE.linkedin, icon: Icons.Linkedin, label: "LinkedIn" },
];

export const HeroSocial = () => (
  <div className="grid grid-cols-1 gap-px sm:grid-cols-3 w-full border border-border">
    {LINKS.map(({ href, icon: Icon, label }, i) => (
      <Link
        prefetch={false}
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-hero-social
        className="group relative flex items-center justify-between gap-3 p-4 bg-background transition-colors hover:bg-muted/40"
      >
        {/* Green left accent bar on hover */}
        <span className="absolute left-0 top-0 h-full w-[2px] bg-brand-green scale-y-0 origin-bottom transition-transform duration-200 group-hover:scale-y-100" />

        <div className="flex items-center gap-3">
          <Icon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="font-mono text-sm tracking-wide">{label}</span>
        </div>

        <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-brand-green transition-colors" />

        {/* Divider between cols on sm+ */}
        {i < LINKS.length - 1 && (
          <span className="absolute right-0 top-2 bottom-2 w-px bg-border hidden sm:block" />
        )}
      </Link>
    ))}
  </div>
);
