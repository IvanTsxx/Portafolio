"use client";

import type { ReactNode } from "react";

import { CodeBlock } from "@/components/registry-docs/code-block";
import { CopyButton } from "@/components/registry-docs/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { HighlightedFile } from "@/lib/registry/source";

const FilePanel = ({ file }: { file: HighlightedFile }) => (
  <div className="border-rule-strong bg-popover flex flex-col border">
    <div className="border-rule-strong bg-paper-deep flex items-center justify-between gap-4 border-b pl-4">
      <p className="label text-graphite truncate">{file.installPath}</p>
      <CopyButton label={`Copy ${file.label}`} value={file.source} />
    </div>
    <CodeBlock className="max-h-128 overflow-y-auto" lines={file.lines} />
  </div>
);

const SourceViewer = ({ files }: { files: readonly HighlightedFile[] }) => {
  const [firstFile] = files;
  if (!firstFile) {
    return null;
  }
  if (files.length === 1) {
    return <FilePanel file={firstFile} />;
  }
  return (
    <Tabs defaultValue={firstFile.id}>
      <TabsList aria-label="Source files" variant="line">
        {files.map((file) => (
          <TabsTrigger key={file.id} value={file.id}>
            {file.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {files.map((file) => (
        <TabsContent key={file.id} value={file.id}>
          <FilePanel file={file} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export const PreviewCodeTabs = ({
  files,
  preview,
}: {
  files: readonly HighlightedFile[];
  preview: ReactNode;
}) => (
  <Tabs defaultValue="preview">
    <TabsList aria-label="Preview or code">
      <TabsTrigger value="preview">Preview</TabsTrigger>
      <TabsTrigger value="code">Code</TabsTrigger>
    </TabsList>
    <TabsContent keepMounted value="preview">
      {preview}
    </TabsContent>
    <TabsContent value="code">
      <SourceViewer files={files} />
    </TabsContent>
  </Tabs>
);
