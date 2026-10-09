import path from "node:path";

import { loadExampleModule } from "@/components/registry-docs/load-demo";
import { PreviewCodeTabs } from "@/components/registry-docs/preview-code-tabs";
import { PreviewStage } from "@/components/registry-docs/preview-stage";
import { toInstalledSource } from "@/lib/registry/installed";
import type { RegistryItemDocs } from "@/lib/registry/schema";
import {
  buildHighlightedFile,
  readRegistrySource,
} from "@/lib/registry/source";

export const ExampleBlock = async ({
  example,
}: {
  example: RegistryItemDocs["examples"][number];
}) => {
  const [{ Example }, source] = await Promise.all([
    loadExampleModule(example.file),
    readRegistrySource(example.file),
  ]);
  const file = await buildHighlightedFile(
    example.file,
    path.basename(example.file),
    toInstalledSource(source),
    "tsx"
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium tracking-tight">
          {example.title}
        </h3>
        {example.description ? (
          <p className="text-muted-foreground max-w-prose text-sm text-pretty">
            {example.description}
          </p>
        ) : null}
      </div>
      <PreviewCodeTabs
        files={[file]}
        preview={
          <PreviewStage className="min-h-48 items-start justify-start md:items-center md:justify-center">
            <Example />
          </PreviewStage>
        }
      />
    </div>
  );
};
