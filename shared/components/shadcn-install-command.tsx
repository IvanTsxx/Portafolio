"use client";

import {
  CodeBlockCommand,
  convertNpmCommand,
} from "@/shared/components/code-block-command/code-block-command";

interface ShadcnInstallCommandProps {
  name: string;
  className?: string;
}

export function ShadcnInstallCommand({ name }: ShadcnInstallCommandProps) {
  const command = `npx shadcn@latest add https://ibong.vercel.app/r/${name}.json`;

  return <CodeBlockCommand {...convertNpmCommand(command)} />;
}
