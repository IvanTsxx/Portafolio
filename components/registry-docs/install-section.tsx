"use client";

import { CodeBlock } from "@/components/registry-docs/code-block";
import { CopyButton } from "@/components/registry-docs/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { HighlightedLine } from "@/lib/registry/highlight";

export interface InstallCommand {
  id: string;
  label: string;
  namespaced: string;
  url: string;
}

const CommandLine = ({ command }: { command: string }) => (
  <div className="border-rule bg-card flex items-center justify-between gap-2 border pl-4">
    <code className="overflow-x-auto py-3 font-mono text-xs whitespace-nowrap">
      <span aria-hidden="true" className="text-clay select-none">
        ${" "}
      </span>
      {command}
    </code>
    <CopyButton label="Copy command" value={command} />
  </div>
);

const RunnerTabs = ({
  commands,
  field,
}: {
  commands: readonly InstallCommand[];
  field: "namespaced" | "url";
}) => {
  const [firstCommand] = commands;
  if (!firstCommand) {
    return null;
  }
  return (
    <Tabs defaultValue={firstCommand.id}>
      <TabsList aria-label="Package manager" variant="line">
        {commands.map((command) => (
          <TabsTrigger key={command.id} value={command.id}>
            {command.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {commands.map((command) => (
        <TabsContent key={command.id} value={command.id}>
          <CommandLine command={command[field]} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export const InstallSection = ({
  commands,
  registriesLines,
  registriesSource,
}: {
  commands: readonly InstallCommand[];
  registriesLines: readonly HighlightedLine[];
  registriesSource: string;
}) => (
  <Tabs defaultValue="url">
    <TabsList aria-label="Install method">
      <TabsTrigger value="url">URL</TabsTrigger>
      <TabsTrigger value="namespace">Namespace</TabsTrigger>
    </TabsList>
    <TabsContent className="flex flex-col gap-4 pt-4" value="url">
      <p className="text-muted-foreground max-w-prose text-sm text-pretty">
        Works in any shadcn project with no configuration. The CLI fetches the
        item and writes the files into your aliases.
      </p>
      <RunnerTabs commands={commands} field="url" />
    </TabsContent>
    <TabsContent className="flex flex-col gap-4 pt-4" value="namespace">
      <p className="text-muted-foreground max-w-prose text-sm text-pretty">
        Register the namespace once in components.json, then install any item by
        name.
      </p>
      <div className="border-rule bg-card flex flex-col border">
        <div className="border-rule flex items-center justify-between gap-4 border-b pl-4">
          <p className="label text-muted-foreground">components.json</p>
          <CopyButton
            label="Copy registries snippet"
            value={registriesSource}
          />
        </div>
        <CodeBlock lines={registriesLines} />
      </div>
      <RunnerTabs commands={commands} field="namespaced" />
    </TabsContent>
  </Tabs>
);
