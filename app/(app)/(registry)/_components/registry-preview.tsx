"use client";

import { useEffect, useRef, useState } from "react";

import { CodeblockShiki } from "@/shared/components/code-block/client/shiki";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockIcon,
} from "@/shared/components/code-block/code-block";
import { CopyButton } from "@/shared/components/copy-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import type { ContentFromFiles } from "@/shared/lib/registry";
import { cn } from "@/shared/lib/utils";
import type { Languages } from "@/shared/utils/shiki/highlight";

interface RegistryPreviewProps {
  source: ContentFromFiles[];
  componentName: string;
  type: "component" | "block" | "page";
}

export function RegistryPreview({
  source,
  componentName,
  type,
}: RegistryPreviewProps) {
  const [iframeHeight, setIframeHeight] = useState(300);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewUrl = `/preview/${componentName}?type=${type}`;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "PREVIEW_HEIGHT") {
        setIframeHeight(event.data.height);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="w-full">
      <Tabs className="w-full" defaultValue="preview">
        {/* Header */}
        <TabsList className="flex w-full items-center justify-between">
          <div>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </div>
        </TabsList>

        {/* Preview */}
        <TabsContent value="preview" className="w-full">
          <div
            className={cn(
              "w-full border-t",
              type === "component"
                ? "flex min-w-full justify-center p-6"
                : "overflow-auto max-h-[600px]"
            )}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              title={`Preview of ${componentName}`}
              style={{
                height: iframeHeight,
                maxWidth: type === "component" ? "100%" : "100%",
              }}
              className={cn(
                "block",
                type === "component" ? "w-screen" : "w-full mx-auto"
              )}
            />
          </div>
        </TabsContent>

        {/* Code */}
        <TabsContent value="code" className="w-full">
          <MultiFiles source={source} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const MultiFiles = ({ source }: { source: ContentFromFiles[] }) => (
  <Tabs className="w-full gap-1" defaultValue={source[0]?.title}>
    <CodeBlock>
      <CodeBlockHeader>
        <div className="flex items-center space-x-1">
          <TabsList className="gap-1 border-0 bg-transparent dark:bg-transparent">
            {source.map((c) => (
              <TabsTrigger
                value={c.title}
                key={c.title}
                className="data-[state=active]:bg-transparent"
              >
                <CodeBlockIcon language={c.lang} />
                <span>{c.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </CodeBlockHeader>
      <CodeBlockContent className="relative">
        {source.map((cmd) => (
          <TabsContent key={cmd.title} value={cmd.title}>
            <div className="relative">
              <CopyButton
                text={cmd.content}
                className="sticky top-2.5 right-2.5 z-10 float-right -mb-10 p-1"
              />
              <CodeblockShiki
                code={cmd.content}
                language={cmd.lang as Languages}
              />
            </div>
          </TabsContent>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  </Tabs>
);
