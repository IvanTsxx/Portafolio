import { cacheLife, cacheTag } from "next/cache";

import { GITHUB_PROFILE_TAG } from "@/lib/github/api";
import { loadGithubProfile } from "@/lib/github/profile";

export const getGithubProfile = async () => {
  "use cache";
  cacheLife("hours");
  cacheTag(GITHUB_PROFILE_TAG);
  return await loadGithubProfile();
};
