import type { RailTrack } from "./companion-placement";
import type { RailAnchor } from "./companion-rail-math";
import { requestSceneFrame } from "./view-registry";

export interface CompanionRail {
  anchors: readonly RailAnchor[];
  track: RailTrack;
}

let rail: CompanionRail | null = null;

export const setCompanionRail = (next: CompanionRail | null) => {
  rail = next;
  requestSceneFrame();
};

export const getCompanionRail = () => rail;
