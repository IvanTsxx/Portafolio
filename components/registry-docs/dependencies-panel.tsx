import { toInstalledPath } from "@/lib/registry/installed";
import type { RegistryItem } from "@/lib/registry/schema";

const DependencyGroup = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="border-graphite/30 flex flex-col gap-3 border-r border-b p-4">
    <h3 className="label text-mist">{title}</h3>
    {children}
  </div>
);

const MonoList = ({
  emptyLabel,
  items,
}: {
  emptyLabel: string;
  items: readonly string[];
}) =>
  items.length > 0 ? (
    <ul className="flex flex-col gap-1.5">
      {items.map((entry) => (
        <li className="text-ink font-mono text-xs break-all" key={entry}>
          {entry}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-graphite text-sm">{emptyLabel}</p>
  );

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

export const DependenciesPanel = ({ item }: { item: RegistryItem }) => (
  <div className="border-graphite/30 grid border-t border-l md:grid-cols-2">
    <DependencyGroup title="npm packages">
      <MonoList emptyLabel="None." items={item.dependencies} />
    </DependencyGroup>
    <DependencyGroup title="Registry dependencies">
      <MonoList emptyLabel="None." items={item.registryDependencies} />
    </DependencyGroup>
    <DependencyGroup title="Files written">
      <MonoList
        emptyLabel="None."
        items={item.files.map((file) => toInstalledPath(file))}
      />
    </DependencyGroup>
    <DependencyGroup title="Added to your CSS">
      <MonoList
        emptyLabel="None."
        items={[...formatCssRules(item), ...formatCssVariables(item)]}
      />
    </DependencyGroup>
  </div>
);
