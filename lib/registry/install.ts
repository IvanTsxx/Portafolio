import { siteConfig } from "@/lib/site/config";

export const packageRunners = [
  { id: "bun", label: "bun", prefix: "bunx --bun shadcn@latest" },
  { id: "pnpm", label: "pnpm", prefix: "pnpm dlx shadcn@latest" },
  { id: "npm", label: "npm", prefix: "npx shadcn@latest" },
  { id: "yarn", label: "yarn", prefix: "yarn dlx shadcn@latest" },
] as const;

export type PackageRunnerId = (typeof packageRunners)[number]["id"];

export const registryUrlTemplate = `${siteConfig.url}/r/{name}.json`;

export const getRegistryItemUrl = (name: string) =>
  registryUrlTemplate.replace("{name}", name);

const getRunnerPrefix = (runner: PackageRunnerId) =>
  (packageRunners.find((entry) => entry.id === runner) ?? packageRunners[0])
    .prefix;

export const getInstallCommand = (runner: PackageRunnerId, name: string) =>
  `${getRunnerPrefix(runner)} add ${getRegistryItemUrl(name)}`;

export const getNamespacedInstallCommand = (
  runner: PackageRunnerId,
  name: string
) => `${getRunnerPrefix(runner)} add ${siteConfig.registryNamespace}/${name}`;

export const getRegistriesSnippet = () =>
  JSON.stringify(
    { registries: { [siteConfig.registryNamespace]: registryUrlTemplate } },
    null,
    2
  );
