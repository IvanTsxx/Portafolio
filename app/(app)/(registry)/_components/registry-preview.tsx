"use client";

import { useEffect, useRef, useState } from "react";

import InlineCode from "@/shared/components/code-block/blocks/inline-code";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

interface RegistryPreviewProps {
  source: string;
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
          <InlineCode code={source} language="tsx" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
