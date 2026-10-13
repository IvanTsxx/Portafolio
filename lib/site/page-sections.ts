import { sectionSpecs } from "@/lib/design-system/sections";
import { homeSections } from "@/lib/site/config";

export interface PageSection {
  id: string;
  index: string;
  label: string;
}

const sectionsByRoute = new Map<string, readonly PageSection[]>([
  ["/", homeSections],
  ["/design-system", sectionSpecs],
]);

const noSections: readonly PageSection[] = [];

export const sectionsForRoute = (pathname: string) =>
  sectionsByRoute.get(pathname) ?? noSections;

export const notchNumber = (index: string) => index.split("-").at(-1) ?? index;
