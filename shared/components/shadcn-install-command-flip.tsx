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

  const command = `npx shadcn@latest add https://ibong.vercel.app/r/`;

  return (
    <div className="w-full">
      <CodeBlockCommand {...convertNpmCommand(command)} isFlip names={names} />
    </div>
  );
}
