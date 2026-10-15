import { CompanionLines } from "@/components/scene/companion-lines";
import { HeroField } from "@/components/site/hero-field";
import { SocialLinks } from "@/components/site/social-links";
import type { GithubIdentity } from "@/lib/github/model";
import { siteConfig } from "@/lib/site/config";
import { sectionScripts } from "@/lib/site/section-scripts";

import { PortraitPlate } from "./portrait-plate";

const portraitSrc = "/avatar";

const monogram = siteConfig.name
  .split(/\s+/u)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

export const ProfileIntro = ({ identity }: { identity: GithubIdentity }) => {
  const { homeIntro } = sectionScripts;

  return (
    <header
      aria-labelledby="intro-heading"
      className="border-rule relative isolate flex flex-col gap-8 border-b pb-16"
      id="intro"
    >
      <HeroField seed="GH-02" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="w-32 shrink-0 sm:w-40">
          <PortraitPlate
            label={`Dithered portrait of ${siteConfig.nickname}`}
            monogram={monogram}
            size="compact"
            src={portraitSrc}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <p className="label text-mist tabular-nums">Dossier</p>
          <h1
            className="display text-ink text-6xl sm:text-7xl"
            id="intro-heading"
          >
            {siteConfig.nickname}
            <span className="jp text-graphite ml-4 align-top text-2xl font-light tracking-widest">
              {siteConfig.nicknameKana}
            </span>
          </h1>
          <p className="label text-graphite">
            {siteConfig.name} · @{identity.login}
          </p>
        </div>
      </div>

      <p className="text-ink max-w-column text-xl leading-snug font-light text-pretty sm:text-2xl">
        {siteConfig.role} in {siteConfig.location}.
      </p>

      <SocialLinks />
      <CompanionLines lines={homeIntro.lines} />
    </header>
  );
};
