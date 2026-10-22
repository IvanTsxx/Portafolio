import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";

import { hoverRowClassName, linkClassName } from "@/components/site/styles";
import { siteConfig } from "@/lib/site/config";
import type { Skill } from "@/lib/skills/skills";
import { cn } from "@/lib/utils";

const sourceUrlOf = (skill: Skill, file: string) =>
  `https://github.com/${siteConfig.repository}/blob/main/skills/${skill.name}/${file}`;

export const SkillFiles = ({ skill }: { skill: Skill }) => (
  <ul className="border-rule border-t">
    {skill.files.map((file) => (
      <li
        className={cn("border-rule border-b px-4", hoverRowClassName)}
        key={file}
      >
        <a
          className={cn(
            linkClassName,
            "text-ink inline-flex min-h-11 items-center gap-2 font-mono text-xs"
          )}
          href={sourceUrlOf(skill, file)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {file}
          <ArrowUpRightIcon aria-hidden className="size-3.5" />
        </a>
      </li>
    ))}
  </ul>
);
