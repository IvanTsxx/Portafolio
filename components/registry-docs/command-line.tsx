"use client";

import { CopyButton } from "@/components/registry-docs/copy-button";

export const CommandLine = ({ command }: { command: string }) => (
  <div className="border-rule-strong bg-popover flex items-center justify-between gap-2 border pl-4">
    <code className="text-ink overflow-x-auto py-3 font-mono text-xs whitespace-nowrap">
      <span aria-hidden="true" className="text-mist select-none">
        ${" "}
      </span>
      {command}
    </code>
    <CopyButton label="Copy command" value={command} />
  </div>
);
