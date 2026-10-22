import { siteConfig } from "@/lib/site/config";

export const installScopes = [
  { flag: "", id: "project", label: "Project" },
  { flag: " -g", id: "global", label: "Global" },
] as const;

export type InstallScopeId = (typeof installScopes)[number]["id"];

const scopeOf = (id: InstallScopeId) =>
  installScopes.find((scope) => scope.id === id) ?? installScopes[0];

export const skillPlaceholder = "<name>";

export const getSkillInstallCommand = (
  name: string,
  scope: InstallScopeId = "project"
) =>
  `npx skills add ${siteConfig.repository} --skill ${name}${scopeOf(scope).flag}`;
