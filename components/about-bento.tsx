import { getRecentActivity } from "@/lib/github";
import { getNowPlaying } from "@/lib/spotify";
import { AboutBentoGrid } from "./about-bento-grid";

export async function AboutBento() {
  const [nowPlaying, githubActivity] = await Promise.all([
    getNowPlaying(),
    getRecentActivity(),
  ]);

  return (
    <AboutBentoGrid nowPlaying={nowPlaying} githubActivity={githubActivity} />
  );
}
