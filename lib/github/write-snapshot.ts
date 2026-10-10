import { fetchGithubProfile } from "./profile";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error("GITHUB_TOKEN is required to refresh the snapshot");
}

const profile = await fetchGithubProfile(token, new Date());
await Bun.write(
  new URL("snapshot.json", import.meta.url),
  `${JSON.stringify(profile, null, 2)}\n`
);
console.log(
  `snapshot.json written: ${profile.pinned.length} pinned, ${profile.calendars.length} calendars, ${profile.timeline.length} months`
);
