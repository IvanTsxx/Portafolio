import { DocumentHero } from "@/components/site/document-hero";
import type { GithubIdentity, GithubProfileSource } from "@/lib/github/model";
import { siteConfig } from "@/lib/site/config";

interface ProfileHeroProps {
  identity: GithubIdentity;
  fetchedAt: string;
  source: GithubProfileSource;
}

export const ProfileHero = ({
  identity,
  fetchedAt,
  source,
}: ProfileHeroProps) => (
  <DocumentHero
    annotation="公開記録 / PUBLIC RECORD"
    code="GH-01"
    jp={siteConfig.nicknameKana}
    lede={`${siteConfig.role} · ${siteConfig.location}`}
    meta={[
      { label: "Login", value: identity.login },
      { label: "Date", value: fetchedAt.slice(0, 10).replaceAll("-", ".") },
      { label: "Feed", value: source === "live" ? "Live" : "Snapshot" },
    ]}
    title={siteConfig.nickname}
    waypoint={{ action: "direct", role: "orchestrator", side: "right" }}
  />
);
