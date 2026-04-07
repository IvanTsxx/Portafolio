import "server-only";
import fs from "node:fs";
import path from "node:path";

export type RegistryType =
  | "registry:base"
  | "registry:block"
  | "registry:component"
  | "registry:ui"
  | "registry:font"
  | "registry:lib"
  | "registry:hook"
  | "registry:page"
  | "registry:file"
  | "registry:theme"
  | "registry:style"
  | "registry:item"
  | "registry:example"
  | "registry:internal";

export interface RegistryProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface RegistryFile {
  path: string;
  type: string;
  target?: string;
}

export interface RegistryEntry {
  name: string;
  type: RegistryType;
  title: string;
  description: string;
  registryDependencies: string[];
  dependencies: string[];
  files: RegistryFile[];
  props?: RegistryProp[];
  content: string;
}

interface PublicRegistryItem {
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: (RegistryFile & { content?: string })[];
  props?: RegistryProp[];
}

interface PublicRegistry {
  items: PublicRegistryItem[];
}

function readPublicRegistry(): PublicRegistry {
  const filePath = path.join(process.cwd(), "public/r/registry.json");
  if (!fs.existsSync(filePath)) return { items: [] };
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as PublicRegistry;
}

export interface RawEntry {
  $schema: string;
  name: string;
  title: string;
  author: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: (RegistryFile & { content?: string })[];
  type: string;
}

/**
 * Find the main content file for an item.
 * Priority: registry:component > registry:block > registry:page > first file
 */
function findMainFile(files: (RegistryFile & { content?: string })[]): string {
  // Try to find a component file first
  const componentFile = files.find((f) => f.type === "registry:component");
  if (componentFile?.content) return componentFile.content;

  // Try block type
  const blockFile = files.find((f) => f.type === "registry:block");
  if (blockFile?.content) return blockFile.content;

  // Try page type
  const pageFile = files.find((f) => f.type === "registry:page");
  if (pageFile?.content) return pageFile.content;

  // Fallback to first file with content
  const firstWithContent = files.find((f) => f.content);
  return firstWithContent?.content ?? "// Source not available";
}

function toEntry(item: PublicRegistryItem): RegistryEntry {
  const filePath = path.join(process.cwd(), `public/r/${item.name}.json`);
  if (!fs.existsSync(filePath)) {
    return {
      content: "// Source not available",
      dependencies: item.dependencies ?? [],
      description: item.description ?? "",
      files: item.files ?? [],
      name: item.name,
      props: item.props,
      registryDependencies: item.registryDependencies ?? [],
      title: item.title ?? item.name,
      type: (item.type as RegistryType) ?? "registry:component",
    };
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const contentRaw = JSON.parse(raw) as RawEntry;

  return {
    content: findMainFile(contentRaw.files),
    dependencies: item.dependencies ?? [],
    description: item.description ?? "",
    files: item.files ?? [],
    name: item.name,
    props: item.props,
    registryDependencies: item.registryDependencies ?? [],
    title: item.title ?? item.name,
    type: (item.type as RegistryType) ?? "registry:component",
  };
}

export function getComponents(): RegistryEntry[] {
  return readPublicRegistry()
    .items.filter((i) => i.type === "registry:component")
    .map(toEntry);
}

export function getBlocks(): RegistryEntry[] {
  return readPublicRegistry()
    .items.filter((i) => i.type === "registry:block")
    .map(toEntry);
}

export function getPages(): RegistryEntry[] {
  return readPublicRegistry()
    .items.filter((i) => i.type === "registry:page")
    .map(toEntry);
}

export function getHooks(): RegistryEntry[] {
  return readPublicRegistry()
    .items.filter((i) => i.type === "registry:hook")
    .map(toEntry);
}

export function getLibs(): RegistryEntry[] {
  return readPublicRegistry()
    .items.filter((i) => i.type === "registry:lib")
    .map(toEntry);
}

export function getComponent(name: string): RegistryEntry | null {
  return getComponents().find((c) => c.name === name) ?? null;
}

export function getBlock(name: string): RegistryEntry | null {
  return getBlocks().find((b) => b.name === name) ?? null;
}

export function getPage(name: string): RegistryEntry | null {
  return getPages().find((p) => p.name === name) ?? null;
}

export function getHook(name: string): RegistryEntry | null {
  return getHooks().find((h) => h.name === name) ?? null;
}

export function getLib(name: string): RegistryEntry | null {
  return getLibs().find((l) => l.name === name) ?? null;
}

export function getAllItems(): RegistryEntry[] {
  return readPublicRegistry().items.map(toEntry);
}
