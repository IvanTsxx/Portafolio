import { sectionSpecs } from "@/lib/design-system/sections";
import { homeSections } from "@/lib/site/config";

export interface PageSection {
  id: string;
  index: string;
  label: string;
}

const registrySections = [
  { id: "install", index: "REG-03", label: "Install" },
  { id: "components", index: "REG-04", label: "Components" },
] as const satisfies readonly PageSection[];

const sectionsByRoute = new Map<string, readonly PageSection[]>([
  ["/", homeSections],
  ["/design-system", sectionSpecs],
  ["/registry", registrySections],
]);

const noSections: readonly PageSection[] = [];

export const sectionsForRoute = (pathname: string) =>
  sectionsByRoute.get(pathname) ?? noSections;

export const notchNumber = (index: string) => index.split("-").at(-1) ?? index;
