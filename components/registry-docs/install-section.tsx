"use client";

import { CodeBlock } from "@/components/registry-docs/code-block";
import { CommandLine } from "@/components/registry-docs/command-line";
import { CopyButton } from "@/components/registry-docs/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { HighlightedLine } from "@/lib/registry/highlight";

export interface InstallCommand {
  id: string;
  label: string;
  namespaced: string;
  url: string;
}

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
      <RunnerTabs commands={commands} field="url" />
    </TabsContent>
    <TabsContent className="flex flex-col gap-4 pt-4" value="namespace">
      <div className="border-rule-strong bg-popover flex flex-col border">
        <div className="border-rule-strong bg-paper-deep flex items-center justify-between gap-4 border-b pl-4">
          <p className="label text-graphite">components.json</p>
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
