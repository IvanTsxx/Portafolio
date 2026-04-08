"use client";

import { env } from "@/env/client";
import {
  CodeBlockCommand,
  convertNpmCommand,
} from "@/shared/components/code-block-command/code-block-command";

interface ShadcnInstallCommandFlipProps {
  names: string[];
}

export function ShadcnInstallCommandFlip({
  names,
}: ShadcnInstallCommandFlipProps) {
  const command = `npx shadcn@latest add ${env.NEXT_PUBLIC_APP_URL}/r/`;

  return (
    <div className="w-full">
      <CodeBlockCommand {...convertNpmCommand(command)} isFlip names={names} />
    </div>
  );
}
