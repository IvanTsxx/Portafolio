import { readFile } from "node:fs/promises";
import path from "node:path";

import { getGithubProfile } from "@/lib/site/github-profile";

export const revalidate = 3600;

const fallbackPortraitPath = path.join(
  process.cwd(),
  "public",
  "profile",
  "portrait.jpg"
);

const imageResponse = (body: ArrayBuffer | Buffer, contentType: string) =>
  new Response(new Uint8Array(body), {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": contentType,
    },
  });

const fallbackPortrait = async () =>
  imageResponse(await readFile(fallbackPortraitPath), "image/jpeg");

export const GET = async () => {
  const { profile } = await getGithubProfile();
  const { avatarUrl } = profile.identity;
  if (!avatarUrl) {
    return fallbackPortrait();
  }
  try {
    const response = await fetch(avatarUrl, { next: { revalidate } });
    if (!response.ok) {
      return fallbackPortrait();
    }
    return imageResponse(
      await response.arrayBuffer(),
      response.headers.get("content-type") ?? "image/jpeg"
    );
  } catch {
    return fallbackPortrait();
  }
};
