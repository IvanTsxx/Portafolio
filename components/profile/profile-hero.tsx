import { DocumentHero } from "@/components/site/document-hero";
import type { GithubIdentity, GithubProfileSource } from "@/lib/github/model";
import { siteConfig } from "@/lib/site/config";

const NAME_KANA = "イヴァン";

interface ProfileHeroProps {
  identity: GithubIdentity;
  fetchedAt: string;
  source: GithubProfileSource;
}

export const ProfileHero = ({
  identity,
  fetchedAt,
  source,
}: ProfileHeroProps) => {
  const [givenName, ...familyNames] = (identity.name ?? identity.login).split(
    /\s+/u
  );
  return (
    <DocumentHero
      annotation="公開記録 / PUBLIC RECORD"
      code="GH-01"
      jp={NAME_KANA}
      lede={`${siteConfig.role} · ${siteConfig.location}`}
      meta={[
        { label: "Login", value: identity.login },
        { label: "Date", value: fetchedAt.slice(0, 10).replaceAll("-", ".") },
        { label: "Feed", value: source === "live" ? "Live" : "Snapshot" },
      ]}
      title={
        <>
          {givenName}
          {familyNames.length > 0 && (
            <>
              <br />
              {familyNames.join(" ")}
            </>
          )}
        </>
      }
      waypoint={{ action: "direct", role: "orchestrator", side: "right" }}
    />
  );
};
