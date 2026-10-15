export type RackPose = "nudged" | "out" | "peeking" | "rest";

export const rackPoseOf = (
  index: number,
  active: number,
  open: number | null
): RackPose => {
  if (index === open) {
    return "out";
  }
  if (index !== active) {
    return "rest";
  }
  return open === null ? "peeking" : "nudged";
};

export const rackPoseData = (pose: RackPose) => ({
  "data-nudged": pose === "nudged" || undefined,
  "data-open": pose === "out" || undefined,
  "data-peeking": pose === "peeking" || undefined,
});
