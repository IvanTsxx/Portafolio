import { ManifestList } from "@/components/site/manifest-list";
import { toInstalledPath } from "@/lib/registry/installed";
import type { RegistryItem } from "@/lib/registry/schema";
import { fileEntry, packageEntry } from "@/lib/site/manifest";
import type { ManifestEntry } from "@/lib/site/manifest";

const formatCssVariables = (item: RegistryItem) => {
  const { cssVars } = item;
  if (!cssVars) {
    return [];
  }
  const entries: string[] = [];
  for (const [name, value] of Object.entries(cssVars.theme ?? {})) {
    entries.push(`--${name}: ${value}`);
  }
  for (const [name, value] of Object.entries(cssVars.light ?? {})) {
    entries.push(`:root --${name}: ${value}`);
  }
  for (const [name, value] of Object.entries(cssVars.dark ?? {})) {
    entries.push(`.dark --${name}: ${value}`);
  }
  return entries;
};

const formatCssRules = (item: RegistryItem) => Object.keys(item.css ?? {});

const groupsOf = (item: RegistryItem) =>
  [
    { entries: item.dependencies.map(packageEntry), title: "npm packages" },
    {
      entries: item.registryDependencies.map((name): ManifestEntry => ({
        kind: "registry",
        name,
      })),
      title: "Registry dependencies",
    },
    {
      entries: item.files.map((file) => fileEntry(toInstalledPath(file))),
      title: "Files written",
    },
    {
      entries: [...formatCssRules(item), ...formatCssVariables(item)].map(
        (name): ManifestEntry => ({ kind: "css", name })
      ),
      title: "Added to your CSS",
    },
  ].filter((group) => group.entries.length > 0);

export const DependenciesPanel = ({ item }: { item: RegistryItem }) => (
  <div className="grid gap-8 md:grid-cols-2">
    {groupsOf(item).map((group) => (
      <ManifestList
        className="md:odd:last:col-span-2"
        entries={group.entries}
        key={group.title}
        title={group.title}
      />
    ))}
  </div>
);
