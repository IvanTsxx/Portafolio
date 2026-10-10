import type { PinnedRepository } from "@/lib/github/model";

import { LanguageSwatch } from "./language-swatch";
import { languageMark } from "./languages";
import { SectionFrame } from "./section-frame";

const spectrumOf = (repositories: readonly PinnedRepository[]) => {
  const counts = new Map<string | null, number>();
  for (const repository of repositories) {
    counts.set(repository.language, (counts.get(repository.language) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([language, count]) => ({
      count,
      label: language ?? "Unknown",
      language,
      share: count / repositories.length,
    }))
    .toSorted((a, b) => b.count - a.count);
};

export const LanguageSpectrum = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => {
  const spectrum = spectrumOf(repositories);
  return (
    <SectionFrame
      id="spectrum"
      index="GH-04"
      jp="言語分布"
      label="Language spectrum"
    >
      <div className="relative">
        <div aria-hidden className="border-ink flex h-6 w-full border">
          {spectrum.map((entry) => (
            <LanguageSwatch
              className="h-full border-0 border-r last:border-r-0"
              key={entry.label}
              language={entry.language}
              style={{ width: `${entry.share * 100}%` }}
            />
          ))}
        </div>
      </div>
      <table className="label w-full border-collapse tabular-nums">
        <caption className="sr-only">
          Languages across pinned repositories
        </caption>
        <thead>
          <tr className="text-mist text-left">
            <th className="pb-2 font-normal" scope="col">
              Code
            </th>
            <th className="pb-2 font-normal" scope="col">
              Language
            </th>
            <th className="pb-2 text-right font-normal" scope="col">
              Repos
            </th>
            <th className="pb-2 text-right font-normal" scope="col">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {spectrum.map((entry) => {
            const mark = languageMark(entry.language);
            return (
              <tr className="border-rule border-t" key={entry.label}>
                <td className="text-mist py-2">
                  <span className="flex items-center gap-2">
                    <LanguageSwatch
                      className="size-3"
                      language={entry.language}
                    />
                    {mark.code}
                  </span>
                </td>
                <td className="text-ink py-2">
                  {entry.label}{" "}
                  {mark.jp && <span className="jp text-mist">{mark.jp}</span>}
                </td>
                <td className="text-ink py-2 text-right">
                  {String(entry.count).padStart(2, "0")}
                </td>
                <td className="text-ink py-2 text-right">
                  {(entry.share * 100).toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </SectionFrame>
  );
};
