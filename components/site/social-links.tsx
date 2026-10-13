import type { Icon } from "@phosphor-icons/react";
import {
  ArrowUpRightIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react/ssr";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { focusRingClassName } from "@/components/site/styles";
import { siteConfig } from "@/lib/site/config";
import type { Social, SocialId } from "@/lib/site/config";
import { cn } from "@/lib/utils";

const socialIcons = {
  email: EnvelopeSimpleIcon,
  github: GithubLogoIcon,
  linkedin: LinkedinLogoIcon,
  x: XLogoIcon,
} as const satisfies Record<SocialId, Icon>;

const socialListVariants = cva("", {
  defaultVariants: { variant: "inline" },
  variants: {
    variant: {
      footer: "grid grid-cols-2 gap-x-6",
      inline: "flex flex-wrap gap-x-6 gap-y-2",
    },
  },
});

const socialLinkVariants = cva(
  `group/social label text-ink ease-mechanical flex items-center gap-3 transition-colors duration-100 ${focusRingClassName}`,
  {
    defaultVariants: { variant: "inline" },
    variants: {
      variant: {
        footer: "min-h-11 py-1 md:min-h-9",
        inline: "group/ink min-h-11 gap-1",
      },
    },
  }
);

const iconFrameVariants = cva(
  "text-graphite pointer-fine:group-hover/social:text-ink ease-mechanical grid shrink-0 place-items-center transition-colors duration-100",
  {
    defaultVariants: { variant: "inline" },
    variants: {
      variant: {
        footer: "size-5",
        inline: "hidden",
      },
    },
  }
);

type SocialVariant = NonNullable<
  VariantProps<typeof socialLinkVariants>["variant"]
>;

const isExternal = (social: Social) => social.href.startsWith("http");

const SocialLink = ({
  social,
  variant,
}: {
  social: Social;
  variant: SocialVariant;
}) => {
  const Icon = socialIcons[social.id];
  return (
    <a
      className={socialLinkVariants({ variant })}
      href={social.href}
      rel={isExternal(social) ? "noopener" : undefined}
      target={isExternal(social) ? "_blank" : undefined}
    >
      <span aria-hidden className={iconFrameVariants({ variant })}>
        <Icon className="size-4" weight="light" />
      </span>
      <span className={cn("shrink-0", variant === "inline" && "ink-underline")}>
        {social.label}
      </span>
      <span className="sr-only">{social.handle}</span>
      <ArrowUpRightIcon
        aria-hidden
        className={cn(
          "size-3 shrink-0",
          variant === "footer"
            ? "text-mist group-hover/social:text-ink ease-out-quart transition-transform duration-200 group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5"
            : "text-mist"
        )}
      />
    </a>
  );
};

export const SocialLinks = ({
  className,
  ids,
  variant = "inline",
}: {
  className?: string;
  ids?: readonly SocialId[];
  variant?: SocialVariant;
}) => {
  const wanted = new Set<SocialId>(
    ids ?? siteConfig.socials.map(({ id }) => id)
  );
  const socials = siteConfig.socials.filter((social) => wanted.has(social.id));
  return (
    <ul className={cn(socialListVariants({ variant }), className)}>
      {socials.map((social) => (
        <li className="min-w-0" key={social.id}>
          <SocialLink social={social} variant={variant} />
        </li>
      ))}
    </ul>
  );
};
