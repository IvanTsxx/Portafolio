"use client";

import { useState } from "react";
import { MDXClientRenderer } from "@/components/mdx-client-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escribe tu contenido en markdown...",
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="write">Escribir</TabsTrigger>
        <TabsTrigger value="preview">Vista previa</TabsTrigger>
      </TabsList>

      <TabsContent value="write" className="mt-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[400px] font-mono text-sm"
        />
      </TabsContent>

      <TabsContent value="preview" className="mt-4">
        <div className="min-h-[400px] rounded-lg border border-border bg-background p-6">
          {value ? (
            <MDXClientRenderer content={value} />
          ) : (
            <p className="text-muted-foreground text-sm">
              No hay contenido para previsualizar
            </p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
