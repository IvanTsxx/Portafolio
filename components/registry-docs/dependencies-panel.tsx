import { toInstalledPath } from "@/lib/registry/installed";
import type { RegistryItem } from "@/lib/registry/schema";

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
    { items: item.dependencies, title: "npm packages" },
    { items: item.registryDependencies, title: "Registry dependencies" },
    {
      items: item.files.map((file) => toInstalledPath(file)),
      title: "Files written",
    },
    {
      items: [...formatCssRules(item), ...formatCssVariables(item)],
      title: "Added to your CSS",
    },
  ].filter((group) => group.items.length > 0);

export const DependenciesPanel = ({ item }: { item: RegistryItem }) => (
  <div className="border-graphite/30 grid border-t border-l md:grid-cols-2">
    {groupsOf(item).map((group) => (
      <div
        className="border-graphite/30 flex flex-col gap-3 border-r border-b p-4 md:odd:last:col-span-2"
        key={group.title}
      >
        <h3 className="label text-mist">{group.title}</h3>
        <ul className="flex flex-col gap-1.5">
          {group.items.map((entry) => (
            <li className="text-ink font-mono text-xs break-all" key={entry}>
              {entry}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
