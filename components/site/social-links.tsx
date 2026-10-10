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

const socialMarks = {
  email: { Icon: EnvelopeSimpleIcon, jp: "連絡" },
  github: { Icon: GithubLogoIcon, jp: "開発" },
  linkedin: { Icon: LinkedinLogoIcon, jp: "経歴" },
  x: { Icon: XLogoIcon, jp: "発信" },
} as const satisfies Record<SocialId, { Icon: Icon; jp: string }>;

const socialListVariants = cva("", {
  defaultVariants: { variant: "inline" },
  variants: {
    variant: {
      contact: "flex flex-wrap gap-2",
      dossier: "border-rule flex flex-col border-t",
      footer: "grid grid-cols-2 gap-x-6",
      inline: "flex flex-wrap gap-2",
    },
  },
});

const socialLinkVariants = cva(
  `group/social label text-ink ease-mechanical flex items-center gap-3 transition-colors duration-100 ${focusRingClassName}`,
  {
    defaultVariants: { variant: "inline" },
    variants: {
      variant: {
        contact:
          "border-rule-strong pointer-fine:hover:border-ink pointer-fine:hover:bg-ink pointer-fine:hover:text-paper h-11 border pr-4 pl-1.5",
        dossier:
          "border-rule pointer-fine:hover:bg-paper-deep/60 min-h-11 border-b py-1.5",
        footer: "min-h-11 py-1 md:min-h-9",
        inline:
          "border-rule-strong pointer-fine:hover:border-ink min-h-11 border pr-3 pl-1.5",
      },
    },
  }
);

const iconFrameVariants = cva(
  "border-rule-strong ease-mechanical grid shrink-0 place-items-center border transition-colors duration-100",
  {
    defaultVariants: { variant: "inline" },
    variants: {
      variant: {
        contact:
          "pointer-fine:group-hover/social:border-paper/60 group-focus-visible/social:border-ink size-8",
        dossier:
          "pointer-fine:group-hover/social:border-ink pointer-fine:group-hover/social:bg-ink pointer-fine:group-hover/social:text-paper size-8",
        footer:
          "pointer-fine:group-hover/social:border-ink pointer-fine:group-hover/social:bg-ink pointer-fine:group-hover/social:text-paper size-7",
        inline:
          "pointer-fine:group-hover/social:border-ink pointer-fine:group-hover/social:bg-ink pointer-fine:group-hover/social:text-paper size-8",
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
  const { Icon, jp } = socialMarks[social.id];
  const showsHandle = variant === "dossier";
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
      <span className="shrink-0">{social.label}</span>
      {showsHandle ? (
        <>
          <span aria-hidden className="jp text-mist shrink-0">
            {jp}
          </span>
          <span
            aria-hidden
            className="border-rule-strong mt-2 h-px min-w-4 flex-1 self-center border-b border-dotted"
          />
          <span className="min-w-0 truncate normal-case">{social.handle}</span>
        </>
      ) : (
        <span className="sr-only">{social.handle}</span>
      )}
      <ArrowUpRightIcon
        aria-hidden
        className={cn(
          "ease-out-quart size-3 shrink-0 transition-transform duration-200 group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5",
          variant === "footer" && "text-mist group-hover/social:text-ink"
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
