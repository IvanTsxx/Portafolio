import { CommandLine } from "@/components/registry-docs/command-line";
import { getSkillInstallCommand, installScopes } from "@/lib/skills/install";

export const SkillInstall = ({ name }: { name: string }) => (
  <ul className="flex flex-col gap-4">
    {installScopes.map((scope) => (
      <li className="flex flex-col gap-2" key={scope.id}>
        <span className="label text-mist">{scope.label}</span>
        <CommandLine command={getSkillInstallCommand(name, scope.id)} />
      </li>
    ))}
  </ul>
);
