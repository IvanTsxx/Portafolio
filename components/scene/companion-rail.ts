import type { RailTrack } from "./companion-placement";
import { requestSceneFrame } from "./view-registry";

export interface CompanionRail {
  ids: readonly string[];
  marks: readonly number[];
  track: RailTrack;
}

let rail: CompanionRail | null = null;

export const setCompanionRail = (next: CompanionRail | null) => {
  rail = next;
  requestSceneFrame();
};

export const getCompanionRail = () => rail;

export const railMarkFor = (
  { ids, marks }: Pick<CompanionRail, "ids" | "marks">,
  sectionId: string | null
) => (sectionId === null ? 0 : (marks[ids.indexOf(sectionId)] ?? 0));
