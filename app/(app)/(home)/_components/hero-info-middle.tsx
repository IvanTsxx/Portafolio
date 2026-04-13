import { VerifiedIcon } from "lucide-react";

import { TextFlip } from "@/shared/components/text-flip";
import { USER } from "@/shared/config/user";

import { Avatar } from "./avatar";
import { HeroTitle } from "./hero-title";

export const HeroInfoMiddle = () => (
  <section className="flex flex-col gap-y-3">
    <HeroTitle />
    <div className="flex items-center gap-3">
      <Avatar />
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            {USER.displayName}
          </h2>
          <div>
            <VerifiedIcon className="size-4.5 text-brand-green" />
          </div>
        </div>
        <div className="min-h-6">
          <TextFlip className="text-muted-foreground text-sm" interval={2.5}>
            {USER.flipSentences.map((text) => (
              <span key={text}>{text}</span>
            ))}
          </TextFlip>
        </div>
      </div>
    </div>
  </section>
);
