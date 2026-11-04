"use client";

import { CopyButton } from "@/components/registry-docs/copy-button";

export const CommandLine = ({ command }: { command: string }) => (
  <div className="group/code border-border-strong bg-surface hover:border-signal/60 flex items-center justify-between gap-2 rounded-md border py-1 pr-1 pl-4 transition-colors duration-200">
    <code className="text-foreground no-scrollbar min-w-0 overflow-x-auto mask-r-from-85% py-2.5 font-mono text-sm whitespace-nowrap">
      <span aria-hidden="true" className="text-signal select-none">
        ${" "}
      </span>
      {command}
    </code>
    <CopyButton label="Copy command" value={command} />
  </div>
);
