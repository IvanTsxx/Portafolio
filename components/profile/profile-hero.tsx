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
  const metaItems = [
    { label: "Doc", value: "GH-01" },
    { label: "Login", value: identity.login },
    { label: "Date", value: fetchedAt.slice(0, 10).replaceAll("-", ".") },
    { label: "Feed", value: source === "live" ? "Live" : "Snapshot" },
  ];
  return (
    <header className="mx-auto w-full max-w-screen-2xl px-4 pt-6 pb-10 md:px-8 md:pt-8 md:pb-14">
      <div className="label border-rule-strong flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b pb-2">
        <span className="flex flex-wrap gap-x-6 gap-y-1">
          {metaItems.map((item) => (
            <span className="flex gap-2" key={item.label}>
              <span className="text-mist">{item.label}</span>
              <span className="text-ink tabular-nums">{item.value}</span>
            </span>
          ))}
        </span>
        <span className="jp text-graphite">公開記録 / PUBLIC RECORD</span>
      </div>

      <div className="mt-10 grid items-end gap-x-6 gap-y-8 md:mt-16 lg:grid-cols-12">
        <h1 className="display text-ink text-6xl sm:text-7xl md:text-8xl lg:col-span-8 xl:text-9xl">
          {givenName}
          {familyNames.length > 0 && (
            <>
              <br />
              {familyNames.join(" ")}
            </>
          )}
        </h1>
        <div className="flex flex-col gap-4 lg:col-span-4">
          <p className="jp text-graphite text-5xl leading-none font-light tracking-widest md:text-6xl">
            {NAME_KANA}
          </p>
          <span
            aria-hidden
            className="hazard-stripe text-ink block h-1.5 w-24"
          />
          <p className="label text-graphite">
            {siteConfig.role} · {siteConfig.location}
          </p>
        </div>
      </div>
    </header>
  );
};
