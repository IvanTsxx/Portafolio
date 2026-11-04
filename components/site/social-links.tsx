import type { Icon } from "@phosphor-icons/react";
import {
  ArrowUpRightIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
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
  x: XLogoIcon,
} as const satisfies Record<SocialId, Icon>;

const socialListVariants = cva("", {
  defaultVariants: { variant: "inline" },
  variants: {
    variant: {
      footer: "grid grid-cols-2 gap-x-6",
      icons: "-ml-2.5 flex items-center gap-1",
      inline: "flex flex-wrap gap-x-6 gap-y-2",
    },
  },
});

const socialLinkVariants = cva(
  `group/social label text-foreground ease-mechanical flex items-center gap-3 transition-colors duration-100 ${focusRingClassName}`,
  {
    defaultVariants: { variant: "inline" },
    variants: {
      variant: {
        footer: "min-h-11 py-1 md:min-h-9",
        icons:
          "text-muted-foreground hover:text-signal grid size-10 place-items-center",
        inline: "group/ink min-h-11 gap-1",
      },
    },
  }
);

const iconFrameVariants = cva(
  "text-muted-foreground pointer-fine:group-hover/social:text-foreground ease-mechanical grid shrink-0 place-items-center transition-colors duration-100",
  {
    defaultVariants: { variant: "inline" },
    variants: {
      variant: {
        footer: "size-5",
        icons:
          "pointer-fine:group-hover/social:text-signal size-5 text-inherit",
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
      <span
        className={cn(
          "shrink-0",
          variant === "inline" && "ink-underline",
          variant === "icons" && "sr-only"
        )}
      >
        {social.label}
      </span>
      <span className="sr-only">{social.handle}</span>
      {variant === "icons" ? null : (
        <ArrowUpRightIcon
          aria-hidden
          className={cn(
            "size-3 shrink-0",
            variant === "footer"
              ? "text-faint group-hover/social:text-foreground ease-out-quart transition-transform duration-200 group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5"
              : "text-faint"
          )}
        />
      )}
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
