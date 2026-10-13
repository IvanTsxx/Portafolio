import { sectionSpecs } from "@/lib/design-system/sections";
import { homeSections } from "@/lib/site/config";

export interface PageSection {
  id: string;
  index: string;
  label: string;
}

type HomeSectionId = (typeof homeSections)[number]["id"];

const sectionsByRoute = new Map<string, readonly PageSection[]>([
  ["/", homeSections],
  ["/design-system", sectionSpecs],
]);

const noSections: readonly PageSection[] = [];

export const notchedRoutes = [...sectionsByRoute.keys()];

export const sectionsForRoute = (pathname: string) =>
  sectionsByRoute.get(pathname) ?? noSections;

export const homeSectionById = (id: HomeSectionId) => {
  const section = homeSections.find((candidate) => candidate.id === id);
  if (!section) {
    throw new Error(`Unknown home section ${id}`);
  }
  return section;
};

export const notchNumber = (index: string) => index.split("-").at(-1) ?? index;
