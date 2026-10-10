import { cache } from "react";

import { loadGithubProfile } from "@/lib/github/profile";

export const getGithubProfile = cache(loadGithubProfile);
