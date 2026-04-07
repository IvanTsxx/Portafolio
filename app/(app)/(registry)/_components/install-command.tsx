"use client";

import {
  CodeBlockCommand,
  convertNpmCommand,
} from "@/shared/components/code-block-command/code-block-command";

interface InstallCommandProps {
  name: string;
  className?: string;
}

export function InstallCommand({ name }: InstallCommandProps) {
  const command = `npx shadcn@latest add @ivantsx/${name}`;

  return <CodeBlockCommand {...convertNpmCommand(command)} />;
}
