"use client";

import { env } from "@/env/client";
import {
  CodeBlockCommand,
  convertNpmCommand,
} from "@/shared/components/code-block-command/code-block-command";

interface ShadcnInstallCommandProps {
  name: string;
  className?: string;
}

export function ShadcnInstallCommand({ name }: ShadcnInstallCommandProps) {
  const command = `npx shadcn@latest add ${env.NEXT_PUBLIC_APP_URL}/r/${name}.json`;

  return <CodeBlockCommand {...convertNpmCommand(command)} />;
}
