import type { Metadata } from "next";
import { Suspense } from "react";

import { OrganizationJsonLd, WebSiteJsonLd } from "@/shared/components/json-ld";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SITE } from "@/shared/config/site";

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

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description:
    "Full Stack Developer specializing in Next.js. Building fast, typesafe, and beautiful web experiences.",
  openGraph: {
    description:
      "Full Stack Developer specializing in Next.js. Building fast, typesafe, and beautiful web experiences.",
    siteName: SITE.name,
    title: "Ivan Bongiovanni",
    type: "website",
    url: SITE.url,
  },
  title: "Ivan Bongiovanni",
  twitter: {
    card: "summary_large_image",
    creator: "@IvanTsxx",
    description: SITE.description,
    site: SITE.twitter,
    title: SITE.name,
  },
};

export default async function HomePage() {
  return (
    <section className="flex bg-background dark:bg-transparent flex-col gap-1 w-full">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <CoverHero />
      </Suspense>
      <section className="lg:px-6 py-2 dark:px-0">
        <Hero />
        <ExperienceSection />
        <AboutSection />
        <GitHubContributions />
        <ProjectsSection />
        <FeedbacksSection />
        <ThoughtsPreviewSection />
        <GitHubOpenSource />
        <BookmarksSection />
      </section>
    </section>
  );
}
