import Link from "next/link";

import { CommandLine } from "@/components/registry-docs/command-line";
import { ManifestList } from "@/components/site/manifest-list";
import { focusRingClassName } from "@/components/site/styles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInstallCommand, packageRunners } from "@/lib/registry/install";
import { getRegistryItem } from "@/lib/registry/registry";
import type { RegistryItem } from "@/lib/registry/schema";
import { fileEntry, packageEntry } from "@/lib/site/manifest";
import { registryItemPath } from "@/lib/site/seo";
import { cn } from "@/lib/utils";

const installedFolderPath = (path: string) =>
  path.replace(/^registry\/ivan\//u, "");

const renderTargetOf = (item: RegistryItem) => {
  if (item.files.some((file) => file.path.includes("gpu-stage"))) {
    return "Renders with WebGPU, falls back to WebGL2, and shows a static frame without either.";
  }
  if (item.dependencies.some((dependency) => dependency.startsWith("three"))) {
    return "Needs WebGL and shows a static fallback without it.";
  }
  return null;
};

const requirementsFor = (item: RegistryItem) =>
  [
    "Client component.",
    renderTargetOf(item),
    "Renders a still frame under reduced motion and pauses offscreen.",
  ]
    .filter(Boolean)
    .join(" ");

export const ExperimentInstall = ({ name }: { name: string }) => {
  const item = getRegistryItem(name);
  if (!item) {
    return null;
  }
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          Installs as source into any React project with the shadcn CLI. The
          component owns its own canvas; the scene is exported separately for an
          existing Canvas or drei View.
        </p>
        <Tabs defaultValue={packageRunners[1].id}>
          <TabsList aria-label="Package manager" variant="line">
            {packageRunners.map((runner) => (
              <TabsTrigger key={runner.id} value={runner.id}>
                {runner.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {packageRunners.map((runner) => (
            <TabsContent key={runner.id} value={runner.id}>
              <CommandLine command={getInstallCommand(runner.id, item.name)} />
            </TabsContent>
          ))}
        </Tabs>
        <Link
          className={cn(
            "group/docs label text-foreground flex min-h-11 w-fit items-center gap-2",
            focusRingClassName
          )}
          href={registryItemPath(item.name)}
        >
          <span className="ink-underline">Props, usage and source</span>
          <span
            aria-hidden
            className="ease-out-expo transition-transform duration-500 group-hover/docs:translate-x-1"
          >
            →
          </span>
        </Link>
      </div>
      <div className="flex min-w-0 flex-col gap-8 lg:col-span-5">
        <ManifestList
          entries={item.dependencies.map(packageEntry)}
          title="Dependencies"
        />
        <ManifestList
          entries={item.files.map((file) =>
            fileEntry(installedFolderPath(file.path))
          )}
          title="Files"
        />
        <section className="flex flex-col gap-2">
          <h3 className="label text-faint">Requirements</h3>
          <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
            {requirementsFor(item)}
          </p>
        </section>
      </div>
    </div>
  );
};
