"use client";

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
  /*  interval = 2,
  transition = { duration: 0.3 }, */
  const [currentComponentFlip] = names;
  const command = `npx shadcn@latest add @ivantsx/${currentComponentFlip}`;
  return (
    <div className="w-full">
      <CodeBlockCommand {...convertNpmCommand(command)} isFlip names={names} />
    </div>
  );
}
