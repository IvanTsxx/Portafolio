"use client";

import { Monitor, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import InlineCode from "@/shared/components/code-block/blocks/inline-cod";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

const VIEWPORTS = [
  { icon: Monitor, label: "Desktop", width: "100%" },
  { icon: Smartphone, label: "Mobile", width: "375px" },
] as const;

type ViewportLabel = (typeof VIEWPORTS)[number]["label"];

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
  const [viewport, setViewport] = useState<ViewportLabel>("Desktop");
  const [iframeHeight, setIframeHeight] = useState(300);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentWidth =
    VIEWPORTS.find((v) => v.label === viewport)?.width ?? "100%";

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
    <motion.div className="w-full">
      <Tabs className="w-full" defaultValue="preview">
        {/* Header */}
        <TabsList className="flex w-full items-center justify-between">
          <div>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </div>

          <div className="flex items-center gap-2">
            {VIEWPORTS.map((v) => (
              <button
                key={v.label}
                onClick={() => setViewport(v.label)}
                className={cn(
                  "flex items-center gap-1",
                  "rounded-md px-2 py-1 text-xs",
                  "border border-border",
                  "text-muted-foreground",
                  "hover:bg-secondary/50",
                  "hover:text-foreground",
                  "transition-colors",
                  viewport === v.label &&
                    "bg-secondary text-secondary-foreground"
                )}
              >
                <v.icon className="size-3" />
                {v.label}
              </button>
            ))}
          </div>
        </TabsList>

        {/* Preview */}
        <TabsContent value="preview" className="w-full">
          <div
            className={cn(
              "w-full border-t",
              type === "component"
                ? "flex justify-center p-6"
                : "overflow-auto max-h-[600px]"
            )}
          >
            <motion.iframe
              ref={iframeRef}
              src={previewUrl}
              title={`Preview of ${componentName}`}
              animate={{ maxWidth: currentWidth }}
              style={{
                height: iframeHeight,
                maxWidth: type === "component" ? "fit-content" : currentWidth,
              }}
              className={cn(
                "block",
                type === "component" ? "w-auto min-w-[200px]" : "w-full mx-auto"
              )}
            />
          </div>
        </TabsContent>

        {/* Code */}
        <TabsContent value="code" className="w-full">
          <InlineCode code={source} language="tsx" />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
