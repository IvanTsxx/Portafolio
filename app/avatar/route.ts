import { readFile } from "node:fs/promises";
import path from "node:path";

import { cacheLife, cacheTag } from "next/cache";

import {
  GITHUB_PROFILE_TAG,
  GITHUB_REVALIDATE_SECONDS,
} from "@/lib/github/api";
import { getGithubProfile } from "@/lib/site/github-profile";

const fallbackPortraitPath = path.join(
  process.cwd(),
  "public",
  "profile",
  "portrait.jpg"
);

interface AvatarImage {
  bytes: Uint8Array<ArrayBuffer>;
  contentType: string;
}

const fallbackPortrait = async (): Promise<AvatarImage> => ({
  bytes: new Uint8Array(await readFile(fallbackPortraitPath)),
  contentType: "image/jpeg",
});

const fetchAvatar = async (avatarUrl: string): Promise<AvatarImage> => {
  try {
    const response = await fetch(avatarUrl, {
      next: { revalidate: GITHUB_REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      return fallbackPortrait();
    }
    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      contentType: response.headers.get("content-type") ?? "image/jpeg",
    };
  } catch {
    return fallbackPortrait();
  }
};

const loadAvatar = async (): Promise<AvatarImage> => {
  "use cache";
  cacheLife("hours");
  cacheTag(GITHUB_PROFILE_TAG);
  const { profile } = await getGithubProfile();
  const { avatarUrl } = profile.identity;
  return avatarUrl ? fetchAvatar(avatarUrl) : fallbackPortrait();
};

export const GET = async () => {
  const { bytes, contentType } = await loadAvatar();
  return new Response(bytes, {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": contentType,
    },
  });
};
