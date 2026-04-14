import { Server } from "lucide-react";
import * as React from "react";

export function ArchitectureNote({
  children,
  title = "Architecture Note",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="my-6 flex flex-col gap-2 rounded-lg border border-brand-green/20 bg-brand-green/5 p-4 text-[14px]">
      <div className="flex items-center gap-2 font-medium text-brand-green">
        <Server className="h-[16px] w-[16px]" />
        <span>{title}</span>
      </div>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
