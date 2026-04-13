import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { Icons } from "@/shared/components/icons";
import { SITE } from "@/shared/config/site";

export const HeroSocial = () => (
  <div className="grid grid-cols-1 gap-px sm:grid-cols-3 items-center w-full">
    {[
      {
        href: SITE.twitter,
        icon: Icons.Twitter,
        label: "Twitter",
      },
      {
        href: SITE.github,
        icon: Icons.Github,
        label: "GitHub",
      },
      {
        href: SITE.linkedin,
        icon: Icons.Linkedin,
        label: "LinkedIn",
      },
    ].map(({ href, icon: Icon, label }) => (
      <Link
        prefetch={false}
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 border-border border h-full p-4 hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <Icon className="size-5" />
          <span className="font-medium">{label}</span>
        </div>
        <ExternalLink className="size-4 text-muted-foreground" />
      </Link>
    ))}
  </div>
);
