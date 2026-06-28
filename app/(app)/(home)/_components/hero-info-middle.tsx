import { VerifiedIcon } from "lucide-react";

import { TextFlip } from "@/shared/components/text-flip";
import { USER } from "@/shared/config/user";

import { Avatar } from "./avatar";

export const HeroInfoMiddle = () => (
  <section className="flex flex-col gap-y-4 w-full">
    {/* Avatar + name row */}
    <div className="flex items-center gap-4">
      <div data-hero-avatar>
        <Avatar />
      </div>

      <div className="flex flex-col gap-y-1 min-w-0">
        <div data-hero-name className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl truncate">
            {USER.displayName}
          </h1>
          <VerifiedIcon className="size-4.5 shrink-0 text-brand-green" />
        </div>

        <div data-hero-flip className="min-h-5">
          <TextFlip className="text-muted-foreground text-sm font-mono" interval={2.5}>
            {USER.flipSentences.map((text) => (
              <span key={text}>{text}</span>
            ))}
          </TextFlip>
        </div>
      </div>
    </div>
  </section>
);
