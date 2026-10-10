import type { GithubIdentity } from "@/lib/github/model";
import { siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";

import { profileLink } from "./ink";
import { PortraitPlate } from "./portrait-plate";
import { hashText, seededRandom } from "./seeded";

const PORTRAIT_SRC = "/profile/portrait.jpg";
const BARCODE_UNITS = 96;

interface SpecRow {
  key: string;
  jp: string;
  value: string;
  href: string | null;
}

const joinedFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const readoutsOf = (identity: GithubIdentity) => [
  { jp: "追跡者", label: "Followers", value: identity.followers },
  { jp: "追跡中", label: "Following", value: identity.following },
  { jp: "保管庫", label: "Repos", value: identity.repositories },
  { jp: "星", label: "Starred", value: identity.starred },
];

const specRowsOf = (identity: GithubIdentity): SpecRow[] => {
  const email = identity.email ?? siteConfig.email;
  const rows: (SpecRow | null)[] = [
    { href: null, jp: "所在地", key: "Location", value: siteConfig.location },
    identity.company
      ? {
          href: identity.company.startsWith("@")
            ? `https://github.com/${identity.company.slice(1)}`
            : null,
          jp: "所属",
          key: "Company",
          value: identity.company,
        }
      : null,
    { href: `mailto:${email}`, jp: "連絡", key: "Email", value: email },
    identity.websiteUrl
      ? {
          href: identity.websiteUrl,
          jp: "網址",
          key: "URL",
          value: identity.websiteUrl.replace(/^https?:\/\//u, ""),
        }
      : null,
    identity.twitterUsername
      ? {
          href: `https://x.com/${identity.twitterUsername}`,
          jp: "発信",
          key: "X",
          value: `@${identity.twitterUsername}`,
        }
      : null,
    {
      href: null,
      jp: "登録",
      key: "Joined",
      value: joinedFormat.format(new Date(identity.createdAt)),
    },
  ];
  return rows.filter((row): row is SpecRow => row !== null);
};

const barcodeOf = (login: string) => {
  const seed = hashText(login);
  const random = seededRandom(seed);
  const bars: { x: number; width: number }[] = [];
  let cursor = 0;
  while (cursor < BARCODE_UNITS) {
    const width = 1 + Math.floor(random() * 3);
    if (random() > 0.35) {
      bars.push({ width, x: cursor });
    }
    cursor += width + 1;
  }
  return {
    bars,
    code: seed.toString(16).toUpperCase().padStart(8, "0"),
    total: cursor,
  };
};

export const IdentityDossier = ({ identity }: { identity: GithubIdentity }) => {
  const name = identity.name ?? identity.login;
  const monogram = name
    .split(/\s+/u)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const barcode = barcodeOf(identity.login);

  return (
    <section aria-labelledby="dossier-heading" className="flex flex-col gap-6">
      <div className="label border-rule-strong flex items-baseline justify-between border-b pb-2">
        <span className="flex items-baseline gap-3">
          <span className="text-mist tabular-nums">[ GH-02 ]</span>
          <span className="text-ink">Dossier</span>
          <span className="jp text-mist">身元</span>
        </span>
        <span className="text-mist">Rev 4.2</span>
      </div>

      <PortraitPlate
        label={`Dithered portrait of ${name}`}
        monogram={monogram}
        src={PORTRAIT_SRC}
      />

      <div className="flex flex-col gap-1">
        <h2
          className="text-ink text-3xl leading-tight font-light tracking-tight text-balance"
          id="dossier-heading"
        >
          {name}
        </h2>
        <p className="label text-graphite normal-case">@{identity.login}</p>
      </div>

      {identity.bio && (
        <p className="text-graphite text-sm leading-relaxed text-pretty whitespace-pre-line">
          {identity.bio}
        </p>
      )}

      <dl className="border-rule grid grid-cols-2 border-t border-l">
        {readoutsOf(identity).map((readout) => (
          <div
            className="border-rule flex flex-col gap-1 border-r border-b p-3"
            key={readout.label}
          >
            <dt className="label text-mist flex items-baseline justify-between">
              <span>{readout.label}</span>
              <span className="jp">{readout.jp}</span>
            </dt>
            <dd className="text-ink font-mono text-3xl font-light tracking-tight tabular-nums">
              {String(readout.value).padStart(3, "0")}
            </dd>
          </div>
        ))}
      </dl>

      <dl className="label">
        {specRowsOf(identity).map((row) => (
          <div className="flex items-baseline gap-2 py-1.5" key={row.key}>
            <dt className="text-mist shrink-0">
              {row.key} <span className="jp">{row.jp}</span>
            </dt>
            <span
              aria-hidden
              className="border-rule-strong mb-1 h-px min-w-4 flex-1 border-b border-dotted"
            />
            <dd className="text-ink min-w-0 truncate normal-case">
              {row.href ? (
                <a
                  className={cn(profileLink, "py-3")}
                  href={row.href}
                  rel={row.href.startsWith("http") ? "noopener" : undefined}
                  target={row.href.startsWith("http") ? "_blank" : undefined}
                >
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {identity.organizations.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="label text-mist">
            Organizations <span className="jp">組織</span>
          </p>
          <ul className="flex flex-wrap gap-2">
            {identity.organizations.map((organization, index) => (
              <li key={organization}>
                <a
                  className="label border-rule-strong text-ink ease-mechanical pointer-fine:hover:border-ink pointer-fine:hover:bg-ink pointer-fine:hover:text-paper flex min-h-8 items-baseline gap-2 border px-2 py-1.5 normal-case transition-colors duration-100"
                  href={`https://github.com/${organization}`}
                  rel="noopener"
                  target="_blank"
                >
                  <span className="tabular-nums opacity-60">
                    O-{String(index + 1).padStart(2, "0")}
                  </span>
                  {organization}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <svg
          aria-hidden
          className="text-ink h-10 w-full"
          fill="currentColor"
          preserveAspectRatio="none"
          viewBox={`0 0 ${barcode.total} 24`}
        >
          {barcode.bars.map((bar) => (
            <rect height={24} key={bar.x} width={bar.width} x={bar.x} y={0} />
          ))}
        </svg>
        <p className="label text-ink flex justify-between">
          <span>GH-{identity.login.toUpperCase()}</span>
          <span>{barcode.code}</span>
        </p>
      </div>
    </section>
  );
};
