import { Redis } from "@upstash/redis";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AboutSection } from "./_components/about-section";
import { BookmarksSection } from "./_components/bookmarks-section";
import { CoverHero } from "./_components/cover-hero";
import { ExperienceSection } from "./_components/experience-section";
import { FeedbacksSection } from "./_components/feedbacks-section";
import { GitHubContributions } from "./_components/github-contributions";
import { GitHubOpenSource } from "./_components/github-opensource";
import { Hero } from "./_components/hero";
import { ProjectsSection } from "./_components/projects-section";
import { ThoughtsPreviewSection } from "./_components/thoughts-preview-section";

const redis = Redis.fromEnv();

export const metadata: Metadata = {
  description:
    "Full Stack Developer specializing in Next.js. Building fast, typesafe, and beautiful web experiences.",
  title: "Ivan Bongiovanni",
  twitter: {
    card: "summary_large_image",
  },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const existingVisitor = cookieStore.get("visitor_id");

  let visitorNumber: number;

  if (existingVisitor) {
    visitorNumber = Number(existingVisitor.value);
  } else {
    visitorNumber = await redis.incr("total_visits");

    cookieStore.set("visitor_id", String(visitorNumber), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  const totalVisits = await redis.get<number>("total_visits");
  return (
    <main className="mx-auto max-w-3xl bg-background/95 dark:bg-transparent">
      <CoverHero />
      <Hero totalVisits={totalVisits ?? 0} visitorNumber={visitorNumber} />
      <ExperienceSection />
      <AboutSection />
      <GitHubContributions />
      <ProjectsSection />
      <FeedbacksSection />
      <ThoughtsPreviewSection />

      <GitHubOpenSource />
      <BookmarksSection />
    </main>
  );
}
