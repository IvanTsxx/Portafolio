import { DossierStrip, PORTRAIT_SRC } from "@/components/site/compact-dossier";
import { SocialLinks } from "@/components/site/social-links";
import type { GithubIdentity } from "@/lib/github/model";
import { siteConfig } from "@/lib/site/config";

import { PortraitPlate } from "./portrait-plate";

const readoutsOf = (identity: GithubIdentity) => [
  { label: "Followers", value: identity.followers },
  { label: "Following", value: identity.following },
  { label: "Repos", value: identity.repositories },
  { label: "Starred", value: identity.starred },
];

export const IdentityDossier = ({ identity }: { identity: GithubIdentity }) => {
  const monogram = siteConfig.name
    .split(/\s+/u)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <section
      aria-labelledby="dossier-heading"
      className="@container flex flex-col gap-4"
    >
      <div className="hidden lg:block">
        <DossierStrip code="GH-02" />
      </div>

      <div className="flex items-start gap-4">
        <div className="w-36 shrink-0 @sm:w-44">
          <PortraitPlate
            label={`Dithered portrait of ${siteConfig.nickname}`}
            monogram={monogram}
            size="compact"
            src={PORTRAIT_SRC}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1 pt-2">
          <h2
            className="text-ink text-2xl leading-tight font-light tracking-tight text-balance @sm:text-3xl"
            id="dossier-heading"
          >
            {siteConfig.name}
          </h2>
          <p className="label text-mist">
            aka {siteConfig.nickname} <span className="jp">通称</span>
          </p>
          <p className="label text-graphite normal-case">@{identity.login}</p>
          <p className="label text-graphite pt-2 normal-case">
            {siteConfig.location}
          </p>
        </div>
      </div>

      {identity.bio && (
        <p className="text-graphite text-sm leading-snug text-pretty">
          {identity.bio}
        </p>
      )}

      <dl className="border-rule grid grid-cols-2 border-t border-l @xs:grid-cols-4">
        {readoutsOf(identity).map((readout) => (
          <div
            className="border-rule flex flex-col gap-1 border-r border-b px-2 py-2"
            key={readout.label}
          >
            <dt className="label text-mist">{readout.label}</dt>
            <dd className="text-ink font-mono text-xl font-light tracking-tight tabular-nums">
              {String(readout.value).padStart(3, "0")}
            </dd>
          </div>
        ))}
      </dl>

      <SocialLinks variant="dossier" />
    </section>
  );
};
