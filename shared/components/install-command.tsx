"use client";

import {
  CodeBlockCommand,
  convertNpmCommand,
} from "@/shared/components/code-block-command/code-block-command";

interface InstallCommandProps {
  command: string;
}

export function InstallCommand({ command }: InstallCommandProps) {
  return <CodeBlockCommand {...convertNpmCommand(command)} />;
}
